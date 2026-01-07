import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { getMaxClips, canUseFeature } from "@/lib/tier-limits";

// Processing configuration type
interface ProcessConfig {
    sermonId: string;
    s3Key?: string;
    youtubeUrl?: string;
    videoType: "sermon" | "podcast";
    clipCount: number;
    generateQuotes: boolean;
    generateCarousel: boolean;
    generateDiscussionGuide: boolean;
    generateDevotional: boolean;
    generateBlogPost: boolean;
    generateOutline: boolean;
    generateSummary: boolean;
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

        // TODO: Fetch subscription from Convex to validate tier
        // For now, default to free tier limits
        const tier = "free" as const;

        // Validate clip count against tier
        const validatedClipCount = getMaxClips(tier, config.clipCount || 3);

        // Validate feature access
        const lockedFeatures: string[] = [];
        if (config.generateDiscussionGuide && !canUseFeature(tier, "discussion_guide")) {
            lockedFeatures.push("discussion_guide");
        }
        if (config.generateDevotional && !canUseFeature(tier, "devotional")) {
            lockedFeatures.push("devotional");
        }
        if (config.generateBlogPost && !canUseFeature(tier, "blog")) {
            lockedFeatures.push("blog");
        }

        if (lockedFeatures.length > 0) {
            return NextResponse.json(
                {
                    error: "Feature not available on your plan",
                    lockedFeatures,
                    upgradeRequired: true,
                },
                { status: 402 }
            );
        }

        // Send event to Inngest to start processing
        const event = await inngest.send({
            name: "sermon/process",
            data: {
                sermonId: config.sermonId,
                s3Key: config.s3Key,
                youtubeUrl: config.youtubeUrl,
                videoType: config.videoType,
                maxClips: validatedClipCount,
                organizationId: orgId,
            },
        });

        return NextResponse.json({
            success: true,
            eventId: event.ids[0],
            validatedClipCount,
        });
    } catch (error) {
        console.error("Process error:", error);
        return NextResponse.json(
            { error: "Failed to start processing" },
            { status: 500 }
        );
    }
}
