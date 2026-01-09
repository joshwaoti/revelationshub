import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sermonId, contentTypes } = body;

        if (!sermonId) {
            return NextResponse.json({ error: "Sermon ID is required" }, { status: 400 });
        }

        // Verify sermon exists and belongs to user's organization
        const sermon = await convex.query(api.sermons.getById, {
            sermonId: sermonId as Id<"sermons">,
        });

        if (!sermon) {
            return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
        }

        // Get organization
        const org = await convex.query(api.organizations.getByClerkId, {
            clerkOrgId: orgId,
        });

        if (!org || sermon.organizationId !== org._id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if transcript exists
        const transcript = await convex.query(api.transcripts.getBySermon, {
            sermonId: sermon._id,
        });

        if (!transcript) {
            return NextResponse.json(
                { error: "Transcript not available. Please wait for processing to complete." },
                { status: 400 }
            );
        }

        // Trigger content generation via Inngest
        await inngest.send({
            name: "sermon/generate-text",
            data: {
                sermonId: sermon._id,
                generateQuotes: contentTypes?.includes("quotes") ?? false,
                generateCarousel: contentTypes?.includes("carousel") ?? false,
                generateDiscussionGuide: contentTypes?.includes("discussion_guide") ?? false,
                generateDevotional: contentTypes?.includes("devotional") ?? false,
                generateBlogPost: contentTypes?.includes("blog_post") ?? false,
                generateOutline: contentTypes?.includes("outline") ?? false,
                generateSummary: contentTypes?.includes("summary") ?? false,
            },
        });

        // Note: PostHog tracking removed - analytics.trackContentGeneration 
        // only works client-side, not in API routes

        return NextResponse.json({
            success: true,
            message: "Content generation started",
            sermonId: sermon._id,
        });
    } catch (error) {
        console.error("Generate content error:", error);
        return NextResponse.json(
            { error: "Failed to start content generation" },
            { status: 500 }
        );
    }
}
