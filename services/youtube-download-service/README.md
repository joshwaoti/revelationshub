# RevelationsHub YouTube Download Service

This private FastAPI worker validates a YouTube URL, downloads it through yt-dlp, and uploads the resulting MP4 to the configured S3 bucket. It is designed for the server-to-server `/api/youtube/download-to-s3` route in the RevelationsHub app.

## Production shape

`docker-compose.dokploy.yml` runs two internal services:

- `downloader`: authenticated FastAPI, yt-dlp, FFmpeg, proxy failover, and S3 multipart upload.
- `pot-provider`: the BgUtils provider recommended by the yt-dlp PO-token guide. It is not exposed publicly.

Only the downloader receives a Dokploy domain. Route `https://yt.zitrionhub.xyz` to service `downloader`, container port `8001`, with HTTPS and a Let's Encrypt certificate.

## Required Dokploy variables

Set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, and a strong `YOUTUBE_SERVICE_TOKEN`. Set the same token and `YOUTUBE_SERVICE_URL=https://yt.zitrionhub.xyz` on the RevelationsHub application.

Set `YOUTUBE_PROXY_URLS` to comma- or newline-separated proxy URLs. Authenticated URLs such as `http://user:password@host:port` are supported and are redacted from logs. A residential or ISP proxy pool is strongly preferred to a cloud-datacenter IP for YouTube traffic.

`ALLOW_DIRECT_YOUTUBE_FALLBACK=true` lets the service try the VPS address after proxy routes fail. Set it to `false` when every download must use a proxy.

Do not put browser cookies in Git or the Docker image. If account-gated content is required, mount a Netscape-format cookie file and set `YOUTUBE_COOKIES_FILE` to its in-container path. Public sermons normally should not need account cookies.

## Local checks

```bash
docker compose -f docker-compose.dokploy.yml config
docker compose -f docker-compose.dokploy.yml up --build
curl http://localhost:8001/health
```

## Endpoints

All endpoints except `/health` require `Authorization: Bearer <YOUTUBE_SERVICE_TOKEN>`.
`/api/youtube/info` is additionally readable without a token when `PUBLIC_INFO_ENDPOINT=true`.

```text
GET  /health                      service, proxy count, active job count
GET  /api/youtube/info?url=...    metadata (title, duration, qualities, captions)
POST /api/youtube/jobs            queue an import, returns 202 + job_id
GET  /api/youtube/jobs/{job_id}   job status: queued | running | succeeded | failed
POST /api/youtube/download-to-s3  synchronous import (legacy; blocks until done)
```

`POST /api/youtube/jobs` is what the application uses. It returns immediately so no
caller has to hold a connection open for the length of a download, and the
Inngest `import-youtube` function polls the job until it finishes.

Both import endpoints take the same body: `url`, `quality`, optional `start`/`end`,
`s3_key`, and optional `s3_bucket`.

Two layers of idempotency protect against duplicate work: queuing a job for an
`s3_key` that already has one in flight returns the existing job, and an import
whose S3 object already exists with a matching source hash returns without
re-downloading. Finished jobs are retained in memory for `JOB_RETENTION_SECONDS`
(default 6h); a container restart drops in-flight jobs, and the polling caller
re-queues them.
