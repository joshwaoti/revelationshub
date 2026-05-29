import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { convexQuery } from "@/lib/server/convex-http";

// Request payload type
interface RegenerateClipsRequest {
    sermonId: string;
    captionEffect: "none" | "pop" | "fade" | "karaoke";
    clipCount: number;
    locationType: "auto" | "text" | "time";
    clipDescription?: string;
    startTime?: number;
    endTime?: number;
    appendMode: boolean;
}

interface ConvexOrg {
    _id: string;
}

interface SermonRecord {
    organizationId: string;
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

        const payload: RegenerateClipsRequest = await req.json();

        // Validate required fields
        if (!payload.sermonId) {
            return NextResponse.json(
                { error: "Missing sermonId" },
                { status: 400 }
            );
        }

        // Validate based on location type
        // "auto" mode - no validation needed, uses default best moments
        // "text" mode - clipDescription is optional (empty = auto)
        // "time" mode - startTime/endTime are optional (empty = full video)

        if (payload.locationType === "time") {
            // Only validate if both times are provided
            if (payload.startTime !== undefined && payload.endTime !== undefined) {
                if (payload.endTime <= payload.startTime) {
                    return NextResponse.json(
                        { error: "End time must be after start time" },
                        { status: 400 }
                    );
                }
            }
        }

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
            sermonId: payload.sermonId,
        });

        if (!sermon || sermon.organizationId !== convexOrg._id) {
            return NextResponse.json(
                { error: "Sermon not found" },
                { status: 404 }
            );
        }

        const clipCount = Math.min(Math.max(payload.clipCount || 3, 1), 10);

        // Send event to Inngest to regenerate clips
        const event = await inngest.send({
            name: "sermon/regenerate-clips",
            data: {
                sermonId: payload.sermonId,
                captionEffect: payload.captionEffect || "karaoke",
                clipCount,
                locationType: payload.locationType || "auto",
                clipDescription: payload.clipDescription,
                startTime: payload.startTime,
                endTime: payload.endTime,
                appendMode: true, // Always append - never delete existing clips
                organizationId: orgId,
            },
        });

        return NextResponse.json({
            success: true,
            eventId: event.ids[0],
            message: "Clip generation started",
        });
    } catch (error) {
        console.error("Regenerate clips error:", error);
        return NextResponse.json(
            { error: "Failed to start clip regeneration" },
            { status: 500 }
        );
    }
}
