import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// YouTube download service URL. Prefer the private server env; keep the public
// name as a compatibility fallback for existing local setups.
const YOUTUBE_SERVICE_URL = process.env.YOUTUBE_SERVICE_URL || process.env.NEXT_PUBLIC_YOUTUBE_SERVICE_URL || "http://localhost:8001";
const YOUTUBE_SERVICE_TOKEN = process.env.YOUTUBE_SERVICE_TOKEN;
const MAX_YOUTUBE_CLIP_SECONDS = 3 * 60 * 60;

function isYouTubeUrl(url: string) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.replace(/^www\./, "");
        return hostname === "youtube.com" || hostname === "youtu.be" || hostname === "m.youtube.com";
    } catch {
        return false;
    }
}

function parseOptionalSeconds(value: unknown) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
}

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { url, quality, start, end } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: "Missing YouTube URL" },
                { status: 400 }
            );
        }

        if (!isYouTubeUrl(url)) {
            return NextResponse.json(
                { error: "Invalid YouTube URL" },
                { status: 400 }
            );
        }

        const startSeconds = parseOptionalSeconds(start);
        const endSeconds = parseOptionalSeconds(end);

        if (Number.isNaN(startSeconds) || Number.isNaN(endSeconds)) {
            return NextResponse.json(
                { error: "Invalid start or end time" },
                { status: 400 }
            );
        }

        if (startSeconds !== null && endSeconds !== null) {
            if (endSeconds <= startSeconds) {
                return NextResponse.json(
                    { error: "End time must be after start time" },
                    { status: 400 }
                );
            }

            if (endSeconds - startSeconds > MAX_YOUTUBE_CLIP_SECONDS) {
                return NextResponse.json(
                    { error: "Selected YouTube range is too long" },
                    { status: 400 }
                );
            }
        }

        // Generate S3 key (same pattern as /api/upload)
        const timestamp = Date.now();
        const sanitizedTitle = url.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50);
        const s3Key = `sermons/${orgId}/${timestamp}_yt_${sanitizedTitle}.mp4`;
        const s3Bucket = process.env.AWS_S3_BUCKET || "josh-video-clipper";

        // Call the youtube-download-service to download and upload to S3
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (YOUTUBE_SERVICE_TOKEN) {
            headers.Authorization = `Bearer ${YOUTUBE_SERVICE_TOKEN}`;
        }

        const response = await fetch(`${YOUTUBE_SERVICE_URL}/api/youtube/download-to-s3`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                url,
                quality: quality || "highest",
                start: startSeconds,
                end: endSeconds,
                s3_key: s3Key,
                s3_bucket: s3Bucket,
            }),
            signal: AbortSignal.timeout(30 * 60 * 1000),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || "Failed to download video to S3" },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            s3Key: result.s3_key,
            s3Bucket: result.s3_bucket,
            fileSize: result.file_size,
            title: result.title,
        });
    } catch (error) {
        console.error("YouTube download-to-s3 error:", error);
        return NextResponse.json(
            { error: "Failed to download video to S3" },
            { status: 500 }
        );
    }
}
