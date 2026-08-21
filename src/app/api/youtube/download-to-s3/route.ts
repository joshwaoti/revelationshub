import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { convexQuery } from "@/lib/server/convex-http";

// Dispatches the YouTube import to a background Inngest job. The download
// itself happens in the downloader service (through the proxy pool), so this
// request returns immediately instead of holding a connection open for the
// length of a sermon.
const MAX_YOUTUBE_CLIP_SECONDS = 3 * 60 * 60;

interface ConvexOrg {
    _id: string;
}

interface SermonRecord {
    organizationId: string;
}

function isYouTubeUrl(url: string) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") return false;
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
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            url,
            quality,
            start,
            end,
            sermonId,
            videoType,
            clipCount,
            captionEffect,
        } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Missing YouTube URL" }, { status: 400 });
        }

        if (!isYouTubeUrl(url)) {
            return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
        }

        if (!sermonId) {
            return NextResponse.json({ error: "Missing sermonId" }, { status: 400 });
        }

        const startSeconds = parseOptionalSeconds(start);
        const endSeconds = parseOptionalSeconds(end);

        if (Number.isNaN(startSeconds) || Number.isNaN(endSeconds)) {
            return NextResponse.json({ error: "Invalid start or end time" }, { status: 400 });
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

        // The sermon must exist and belong to the caller's organization before
        // we hand anything to the background worker.
        const convexOrg = await convexQuery<ConvexOrg | null>("organizations:getByClerkId", {
            clerkOrgId: orgId,
        });

        if (!convexOrg) {
            return NextResponse.json({ error: "Organization not found" }, { status: 403 });
        }

        const sermon = await convexQuery<SermonRecord | null>("sermons:getById", { sermonId });

        if (!sermon || sermon.organizationId !== convexOrg._id) {
            return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
        }

        // Deterministic key so retries of the same import reuse the same object.
        const timestamp = Date.now();
        const sanitizedTitle = url.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50);
        const s3Key = `sermons/${orgId}/${timestamp}_yt_${sanitizedTitle}.mp4`;

        const event = await inngest.send({
            name: "sermon/youtube-import",
            data: {
                sermonId,
                youtubeUrl: url,
                s3Key,
                quality: quality || "highest",
                start: startSeconds ?? undefined,
                end: endSeconds ?? undefined,
                videoType: videoType === "podcast" ? "podcast" : "sermon",
                maxClips: Math.min(Math.max(Number(clipCount) || 5, 1), 10),
                captionEffect: captionEffect || "karaoke",
                organizationId: orgId,
            },
        });

        return NextResponse.json({
            success: true,
            queued: true,
            s3Key,
            eventId: event.ids[0],
        });
    } catch (error) {
        console.error("YouTube import dispatch error:", error);
        return NextResponse.json(
            { error: "Failed to start YouTube import" },
            { status: 500 }
        );
    }
}
