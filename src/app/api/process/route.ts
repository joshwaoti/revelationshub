import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { convexQuery } from "@/lib/server/convex-http";

// Processing configuration type
interface ProcessConfig {
    sermonId: string;
    s3Key?: string;
    youtubeUrl?: string;
    videoType: "sermon" | "podcast";
    clipCount: number;
    captionEffect?: "none" | "pop" | "fade" | "karaoke";
    generateQuotes: boolean;
    generateCarousel: boolean;
    generateDiscussionGuide: boolean;
    generateDevotional: boolean;
    generateBlogPost: boolean;
    generateOutline: boolean;
    generateSummary: boolean;
}

interface ConvexOrg {
    _id: string;
}

interface SermonRecord {
    organizationId: string;
    s3Key: string;
    youtubeUrl?: string;
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

        const config: ProcessConfig = await req.json();

        // Validate required fields
        if (!config.sermonId) {
            return NextResponse.json(
                { error: "Missing sermonId" },
                { status: 400 }
            );
        }

        if (!config.s3Key && !config.youtubeUrl) {
            return NextResponse.json(
                { error: "Either s3Key or youtubeUrl is required" },
                { status: 400 }
            );
        }

        const clipCount = Math.min(Math.max(config.clipCount || 5, 1), 10);
        const convexOrg = await convexQuery<ConvexOrg | null>("organizations:getByClerkId", {
            clerkOrgId: orgId,
        });

        if (!convexOrg) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 403 }
            );
        }

        const sermon = await convexQuery<SermonRecord | null>("sermons:getById", {
            sermonId: config.sermonId,
        });

        if (!sermon || sermon.organizationId !== convexOrg._id) {
            return NextResponse.json(
                { error: "Sermon not found" },
                { status: 404 }
            );
        }

        // FLOW 1: S3 Upload - Process via Modal (WhisperX + video clips)
        if (config.s3Key) {
            if (sermon.s3Key !== config.s3Key) {
                return NextResponse.json(
                    { error: "S3 key does not match sermon" },
                    { status: 403 }
                );
            }

            if (!config.s3Key.startsWith(`sermons/${orgId}/`)) {
                return NextResponse.json(
                    { error: "S3 key does not belong to this organization" },
                    { status: 403 }
                );
            }

            // Send event to Inngest to start Modal processing
            const event = await inngest.send({
                name: "sermon/process",
                data: {
                    sermonId: config.sermonId,
                    s3Key: config.s3Key,
                    videoType: config.videoType,
                    maxClips: clipCount,
                    captionEffect: config.captionEffect || "karaoke",
                    organizationId: orgId,
                },
            });

            return NextResponse.json({
                success: true,
                flow: "s3_upload",
                eventId: event.ids[0],
                clipCount,
            });
        }

        // FLOW 2: YouTube URL - Fetch transcript directly (no Modal needed)
        if (config.youtubeUrl) {
            if (sermon.youtubeUrl && sermon.youtubeUrl !== config.youtubeUrl) {
                return NextResponse.json(
                    { error: "YouTube URL does not match sermon" },
                    { status: 403 }
                );
            }

            // Step 1: Fetch transcript from YouTube
            const transcriptResponse = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/youtube/transcript`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: config.youtubeUrl }),
                }
            );

            let transcriptSegments: Array<{ word: string; start: number; end: number }> = [];
            let transcriptError = null;

            if (transcriptResponse.ok) {
                const transcriptData = await transcriptResponse.json();
                transcriptSegments = transcriptData.segments || [];
                console.log(`Fetched ${transcriptSegments.length} transcript segments from YouTube`);
            } else {
                const errorData = await transcriptResponse.json();
                transcriptError = errorData.error || "Could not fetch transcript";
                console.warn("Could not fetch YouTube transcript:", transcriptError);
            }

            // Step 2: Trigger text generation only (no video clips for YouTube)
            // The generate-text function will save transcript and generate content
            const event = await inngest.send({
                name: "sermon/generate-text",
                data: {
                    sermonId: config.sermonId,
                    transcriptSegments,
                    generateQuotes: config.generateQuotes ?? true,
                    generateCarousel: config.generateCarousel ?? true,
                    generateDiscussionGuide: config.generateDiscussionGuide ?? true,
                    generateDevotional: config.generateDevotional ?? true,
                    generateBlogPost: config.generateBlogPost ?? true,
                    generateOutline: config.generateOutline ?? true,
                    generateSummary: config.generateSummary ?? true,
                },
            });

            return NextResponse.json({
                success: true,
                flow: "youtube_transcript",
                eventId: event.ids[0],
                hasTranscript: transcriptSegments.length > 0,
                transcriptError,
                segmentCount: transcriptSegments.length,
            });
        }

        return NextResponse.json(
            { error: "Invalid processing configuration" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Process error:", error);
        return NextResponse.json(
            { error: "Failed to start processing" },
            { status: 500 }
        );
    }
}
