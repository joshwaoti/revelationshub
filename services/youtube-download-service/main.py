"""Authenticated YouTube-to-S3 worker for the RevelationsHub import flow."""

from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import re
import secrets
import shutil
import subprocess
import tempfile
import threading
import time
import uuid
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import boto3
from boto3.s3.transfer import TransferConfig
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError


logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("youtube-download-service")

YOUTUBE_HOSTS = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
}
S3_KEY_RE = re.compile(r"^[A-Za-z0-9!_.*'()/=+,@-]+$")
QUALITY_RE = re.compile(r"^(highest|\d{3,4}p)$")
SECRET_URL_RE = re.compile(r"(https?://)([^\s/@:]+):([^\s/@]+)@", re.IGNORECASE)


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    return default if value is None else value.strip().lower() in {"1", "true", "yes", "on"}


SERVICE_TOKEN = os.environ.get("YOUTUBE_SERVICE_TOKEN", "").strip()
ALLOW_INSECURE = env_bool("ALLOW_INSECURE_SERVICE")
PUBLIC_INFO_ENDPOINT = env_bool("PUBLIC_INFO_ENDPOINT")
ALLOW_DIRECT_FALLBACK = env_bool("ALLOW_DIRECT_YOUTUBE_FALLBACK", True)
AWS_BUCKET = os.environ.get("AWS_S3_BUCKET", "").strip()
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1").strip()
POT_PROVIDER_URL = os.environ.get("POT_PROVIDER_URL", "http://pot-provider:4416").rstrip("/")
COOKIES_FILE = os.environ.get("YOUTUBE_COOKIES_FILE", "").strip()
MAX_VIDEO_SECONDS = int(os.environ.get("MAX_DOWNLOAD_SECONDS", str(3 * 60 * 60)))
MAX_VIDEO_BYTES = int(os.environ.get("MAX_DOWNLOAD_BYTES", str(8 * 1024 * 1024 * 1024)))
MAX_VIDEO_HEIGHT = int(os.environ.get("MAX_VIDEO_HEIGHT", "1080"))
MAX_CONCURRENT_DOWNLOADS = max(1, int(os.environ.get("MAX_CONCURRENT_DOWNLOADS", "2")))
MAX_PROXY_ATTEMPTS = max(1, int(os.environ.get("MAX_PROXY_ATTEMPTS", "4")))
TMP_ROOT = Path(os.environ.get("DOWNLOAD_TMP_DIR", "/tmp/youtube-downloads"))
ALLOWED_S3_PREFIX = os.environ.get("ALLOWED_S3_PREFIX", "sermons/").strip()


def parse_list(value: str) -> list[str]:
    return [item.strip() for item in re.split(r"[\r\n,]+", value) if item.strip()]


def validate_proxy(proxy: str) -> str:
    parsed = urlparse(proxy)
    if parsed.scheme not in {"http", "https", "socks5", "socks5h"} or not parsed.hostname:
        raise RuntimeError("YOUTUBE_PROXY_URLS contains an invalid proxy URL")
    return proxy


PROXIES = [validate_proxy(proxy) for proxy in parse_list(os.environ.get("YOUTUBE_PROXY_URLS", ""))]


class ProxyPool:
    def __init__(self, proxies: list[str]) -> None:
        self._proxies = proxies
        self._cursor = 0
        self._lock = threading.Lock()

    def candidates(self) -> list[str | None]:
        if not self._proxies:
            return [None] if ALLOW_DIRECT_FALLBACK else []
        with self._lock:
            start = self._cursor
            self._cursor = (self._cursor + 1) % len(self._proxies)
        ordered = self._proxies[start:] + self._proxies[:start]
        candidates: list[str | None] = ordered[:MAX_PROXY_ATTEMPTS]
        if ALLOW_DIRECT_FALLBACK and len(candidates) < MAX_PROXY_ATTEMPTS:
            candidates.append(None)
        return candidates


proxy_pool = ProxyPool(PROXIES)
download_slots = asyncio.Semaphore(MAX_CONCURRENT_DOWNLOADS)


def safe_error(error: Exception) -> str:
    message = SECRET_URL_RE.sub(r"\1***:***@", str(error))
    for proxy in PROXIES:
        message = message.replace(proxy, "[proxy]")
    return message[:1200]


def validate_youtube_url(value: str) -> str:
    try:
        parsed = urlparse(value)
    except ValueError as error:
        raise ValueError("Invalid YouTube URL") from error
    if parsed.scheme != "https" or (parsed.hostname or "").lower() not in YOUTUBE_HOSTS:
        raise ValueError("Only HTTPS YouTube URLs are supported")
    return value


def validate_s3_key(value: str) -> str:
    if value.startswith("/") or ".." in value.split("/") or not S3_KEY_RE.fullmatch(value):
        raise ValueError("Invalid S3 object key")
    if ALLOWED_S3_PREFIX and not value.startswith(ALLOWED_S3_PREFIX):
        raise ValueError(f"S3 object key must begin with {ALLOWED_S3_PREFIX}")
    return value


class DownloadToS3Request(BaseModel):
    url: str
    quality: str = "highest"
    start: float | None = Field(default=None, ge=0)
    end: float | None = Field(default=None, gt=0)
    s3_key: str = Field(min_length=1, max_length=1024)
    s3_bucket: str | None = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return validate_youtube_url(value)

    @field_validator("s3_key")
    @classmethod
    def validate_key(cls, value: str) -> str:
        return validate_s3_key(value)

    @field_validator("quality")
    @classmethod
    def validate_quality(cls, value: str) -> str:
        if not QUALITY_RE.fullmatch(value):
            raise ValueError("quality must be 'highest' or a resolution such as 720p")
        return value


def require_auth(request: Request, *, allow_public_info: bool = False) -> None:
    if allow_public_info and PUBLIC_INFO_ENDPOINT:
        return
    if not SERVICE_TOKEN:
        if ALLOW_INSECURE:
            return
        raise HTTPException(status_code=503, detail="Service authentication is not configured")
    supplied = request.headers.get("authorization", "")
    expected = f"Bearer {SERVICE_TOKEN}"
    if not secrets.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


def ydl_options(*, proxy: str | None, output_template: str | None = None) -> dict[str, Any]:
    options: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "cachedir": False,
        "retries": 5,
        "fragment_retries": 10,
        "extractor_retries": 3,
        "file_access_retries": 3,
        "socket_timeout": 30,
        "concurrent_fragment_downloads": 4,
        "max_filesize": MAX_VIDEO_BYTES,
        "js_runtimes": {"node": {}},
        "extractor_args": {
            "youtube": {"player_client": ["mweb"]},
            "youtubepot-bgutilhttp": {"base_url": [POT_PROVIDER_URL]},
        },
    }
    if proxy:
        options["proxy"] = proxy
    if COOKIES_FILE:
        options["cookiefile"] = COOKIES_FILE
    if output_template:
        options.update(
            {
                "outtmpl": output_template,
                "format": (
                    f"bv*[height<={MAX_VIDEO_HEIGHT}][ext=mp4]+ba[ext=m4a]/"
                    f"b[height<={MAX_VIDEO_HEIGHT}][ext=mp4]/best[height<={MAX_VIDEO_HEIGHT}]"
                ),
                "merge_output_format": "mp4",
                "final_ext": "mp4",
            }
        )
    else:
        options["skip_download"] = True
    return options


def with_proxy_failover(operation: str, callback: Any, request_id: str) -> Any:
    candidates = proxy_pool.candidates()
    if not candidates:
        raise RuntimeError("No YouTube proxy is configured and direct fallback is disabled")

    last_error: Exception | None = None
    for attempt, proxy in enumerate(candidates, start=1):
        try:
            logger.info(
                "%s request_id=%s attempt=%s route=%s",
                operation,
                request_id,
                attempt,
                "proxy" if proxy else "direct",
            )
            return callback(proxy)
        except (DownloadError, OSError, subprocess.SubprocessError) as error:
            last_error = error
            logger.warning(
                "%s_failed request_id=%s attempt=%s error=%s",
                operation,
                request_id,
                attempt,
                safe_error(error),
            )
            if attempt < len(candidates):
                time.sleep(min(2 ** (attempt - 1), 8))
    raise RuntimeError(f"YouTube {operation} failed after {len(candidates)} routes: {safe_error(last_error or Exception())}")


def extract_info(url: str, request_id: str) -> dict[str, Any]:
    def operation(proxy: str | None) -> dict[str, Any]:
        with YoutubeDL(ydl_options(proxy=proxy)) as ydl:
            info = ydl.extract_info(url, download=False)
            if not isinstance(info, dict):
                raise DownloadError("YouTube returned no metadata")
            return info

    return with_proxy_failover("metadata", operation, request_id)


def enforce_media_limits(info: dict[str, Any]) -> None:
    duration = int(info.get("duration") or 0)
    if duration <= 0:
        raise HTTPException(status_code=422, detail="The video duration could not be determined")
    if duration > MAX_VIDEO_SECONDS:
        raise HTTPException(status_code=413, detail="The YouTube video is longer than the configured limit")
    estimated_size = int(info.get("filesize") or info.get("filesize_approx") or 0)
    if estimated_size > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=413, detail="The YouTube video is larger than the configured limit")


def locate_download(directory: Path) -> Path:
    candidates = [path for path in directory.glob("source.*") if path.is_file() and ".part" not in path.name]
    if not candidates:
        raise RuntimeError("yt-dlp completed without producing a media file")
    return max(candidates, key=lambda path: path.stat().st_size)


def download_video(url: str, directory: Path, request_id: str) -> tuple[Path, dict[str, Any]]:
    def operation(proxy: str | None) -> tuple[Path, dict[str, Any]]:
        for old_file in directory.glob("source.*"):
            old_file.unlink(missing_ok=True)
        with YoutubeDL(ydl_options(proxy=proxy, output_template=str(directory / "source.%(ext)s"))) as ydl:
            info = ydl.extract_info(url, download=False)
            if not isinstance(info, dict):
                raise DownloadError("YouTube returned no metadata")
            enforce_media_limits(info)
            ydl.process_ie_result(info, download=True)
        return locate_download(directory), info

    return with_proxy_failover("download", operation, request_id)


def trim_video(source: Path, start: float, end: float, directory: Path) -> Path:
    target = directory / "trimmed.mp4"
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-ss",
            str(start),
            "-i",
            str(source),
            "-t",
            str(end - start),
            "-map",
            "0:v:0",
            "-map",
            "0:a:0?",
            "-c",
            "copy",
            "-movflags",
            "+faststart",
            str(target),
        ],
        capture_output=True,
        text=True,
        timeout=MAX_VIDEO_SECONDS + 120,
        check=False,
    )
    if result.returncode != 0 or not target.exists():
        raise RuntimeError(f"FFmpeg trim failed: {result.stderr[-800:]}")
    return target


def s3_client() -> Any:
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        config=Config(
            retries={"max_attempts": 10, "mode": "adaptive"},
            connect_timeout=10,
            read_timeout=120,
            max_pool_connections=16,
        ),
    )


def existing_object(client: Any, key: str, source_hash: str) -> dict[str, Any] | None:
    try:
        head = client.head_object(Bucket=AWS_BUCKET, Key=key)
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") in {"404", "NoSuchKey", "NotFound"}:
            return None
        raise
    if head.get("Metadata", {}).get("source-url-sha256") != source_hash:
        raise HTTPException(status_code=409, detail="The requested S3 key already exists")
    return head


def run_download_to_s3(payload: DownloadToS3Request, request_id: str) -> dict[str, Any]:
    if not AWS_BUCKET:
        raise HTTPException(status_code=503, detail="AWS_S3_BUCKET is not configured")
    if payload.s3_bucket and payload.s3_bucket != AWS_BUCKET:
        raise HTTPException(status_code=400, detail="The requested S3 bucket is not allowed")

    source_hash = hashlib.sha256(payload.url.encode("utf-8")).hexdigest()
    client = s3_client()
    head = existing_object(client, payload.s3_key, source_hash)
    if head:
        return {
            "success": True,
            "s3_key": payload.s3_key,
            "s3_bucket": AWS_BUCKET,
            "file_size": int(head.get("ContentLength") or 0),
            "title": head.get("Metadata", {}).get("source-title", "YouTube video"),
            "idempotent": True,
            "request_id": request_id,
        }

    TMP_ROOT.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix=f"{request_id}-", dir=TMP_ROOT))
    try:
        video_path, info = download_video(payload.url, temp_dir, request_id)
        duration = float(info.get("duration") or 0)
        start = payload.start or 0.0
        end = payload.end if payload.end is not None else duration
        if start < 0 or end <= start or end > duration + 1:
            raise HTTPException(status_code=400, detail="Invalid start/end range")
        if end - start > MAX_VIDEO_SECONDS:
            raise HTTPException(status_code=413, detail="The selected range is longer than the configured limit")
        if start > 0 or end < duration - 0.5:
            video_path = trim_video(video_path, start, end, temp_dir)

        file_size = video_path.stat().st_size
        if file_size <= 0 or file_size > MAX_VIDEO_BYTES:
            raise HTTPException(status_code=413, detail="Downloaded media exceeds the configured size limit")

        title = str(info.get("title") or "YouTube video")
        safe_title = title.encode("ascii", "ignore").decode("ascii")[:200] or "YouTube video"
        transfer = TransferConfig(
            multipart_threshold=16 * 1024 * 1024,
            multipart_chunksize=16 * 1024 * 1024,
            max_concurrency=4,
            use_threads=True,
        )
        client.upload_file(
            str(video_path),
            AWS_BUCKET,
            payload.s3_key,
            ExtraArgs={
                "ContentType": "video/mp4",
                "Metadata": {
                    "source-url-sha256": source_hash,
                    "source-title": safe_title,
                    "request-id": request_id,
                },
            },
            Config=transfer,
        )
        uploaded = client.head_object(Bucket=AWS_BUCKET, Key=payload.s3_key)
        uploaded_size = int(uploaded.get("ContentLength") or 0)
        if uploaded_size != file_size:
            raise RuntimeError("S3 upload verification failed")

        logger.info(
            "upload_complete request_id=%s bucket=%s key=%s bytes=%s",
            request_id,
            AWS_BUCKET,
            payload.s3_key,
            uploaded_size,
        )
        return {
            "success": True,
            "s3_key": payload.s3_key,
            "s3_bucket": AWS_BUCKET,
            "file_size": uploaded_size,
            "title": title,
            "idempotent": False,
            "request_id": request_id,
        }
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


app = FastAPI(
    title="RevelationsHub YouTube Download Service",
    version="2.0.0",
    docs_url=None,
    redoc_url=None,
)

allowed_origins = parse_list(os.environ.get("ALLOWED_ORIGINS", ""))
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
    )


@app.on_event("startup")
def validate_runtime() -> None:
    if not SERVICE_TOKEN and not ALLOW_INSECURE:
        raise RuntimeError("YOUTUBE_SERVICE_TOKEN is required")
    if not AWS_BUCKET:
        raise RuntimeError("AWS_S3_BUCKET is required")
    if shutil.which("ffmpeg") is None or shutil.which("node") is None:
        raise RuntimeError("ffmpeg and Node.js are required")
    if COOKIES_FILE and not Path(COOKIES_FILE).is_file():
        raise RuntimeError("YOUTUBE_COOKIES_FILE does not exist")
    TMP_ROOT.mkdir(parents=True, exist_ok=True)
    logger.info(
        "service_ready proxies=%s direct_fallback=%s max_concurrency=%s pot_provider=%s",
        len(PROXIES),
        ALLOW_DIRECT_FALLBACK,
        MAX_CONCURRENT_DOWNLOADS,
        POT_PROVIDER_URL,
    )


@app.get("/")
@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "revelationshub-youtube-downloader",
        "version": "2.0.0",
        "proxy_routes": len(PROXIES),
        "direct_fallback": ALLOW_DIRECT_FALLBACK,
        "pot_provider_configured": bool(POT_PROVIDER_URL),
    }


@app.get("/api/youtube/info")
async def video_info(request: Request, url: str = Query(...)) -> dict[str, Any]:
    require_auth(request, allow_public_info=True)
    try:
        valid_url = validate_youtube_url(url)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
    try:
        info = await asyncio.to_thread(extract_info, valid_url, request_id)
        enforce_media_limits(info)
        qualities: dict[tuple[int, int], dict[str, Any]] = {}
        for media_format in info.get("formats") or []:
            height = int(media_format.get("height") or 0)
            if height <= 0 or height > MAX_VIDEO_HEIGHT:
                continue
            fps = int(media_format.get("fps") or 0)
            qualities[(height, fps)] = {
                "resolution": f"{height}p",
                "fps": fps,
                "filesize": media_format.get("filesize") or media_format.get("filesize_approx"),
                "itag": media_format.get("format_id"),
            }
        duration = int(info.get("duration") or 0)
        return {
            "success": True,
            "title": info.get("title"),
            "author": info.get("uploader") or info.get("channel"),
            "duration": duration,
            "duration_formatted": time.strftime("%H:%M:%S", time.gmtime(duration)),
            "thumbnail": info.get("thumbnail"),
            "has_captions": bool(info.get("subtitles") or info.get("automatic_captions")),
            "available_captions": sorted(
                set((info.get("subtitles") or {}).keys()) | set((info.get("automatic_captions") or {}).keys())
            ),
            "qualities": sorted(qualities.values(), key=lambda item: (int(item["resolution"][:-1]), item["fps"]), reverse=True),
            "views": info.get("view_count"),
            "publish_date": info.get("upload_date"),
            "request_id": request_id,
        }
    except HTTPException:
        raise
    except Exception as error:
        logger.error("metadata_error request_id=%s error=%s", request_id, safe_error(error))
        raise HTTPException(status_code=502, detail="YouTube metadata retrieval failed") from error


@app.post("/api/youtube/download-to-s3")
async def download_to_s3(payload: DownloadToS3Request, request: Request) -> dict[str, Any]:
    require_auth(request)
    request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
    async with download_slots:
        try:
            return await asyncio.to_thread(run_download_to_s3, payload, request_id)
        except HTTPException:
            raise
        except Exception as error:
            logger.error("download_error request_id=%s error=%s", request_id, safe_error(error))
            raise HTTPException(
                status_code=502,
                detail={"message": "YouTube download or S3 upload failed", "request_id": request_id},
            ) from error
