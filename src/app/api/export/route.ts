import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthorizedClipByS3Key } from "@/lib/server/resource-auth";

// This endpoint initiates a video export with captions
// The actual rendering is done by the Python backend with FFmpeg

export interface ExportRequest {
    clipS3Key: string;
    captions: Array<{
        id: string;
        startTime: number;
        endTime: number;
        word: string;
    }>;
    captionStyle: {
        font: string;
        fontSize: number;
        color: string;
        highlightColor?: string;
        backgroundColor?: string;
        position: "top" | "center" | "bottom";
        animation: "none" | "fade" | "pop" | "karaoke";
    };
    frameEffect?: {
        type: "none" | "gradient" | "blur" | "border" | "rounded" | "glow";
        color?: string;
        intensity?: number;
    };
}

export interface ExportResponse {
    success: boolean;
    jobId?: string;
    error?: string;
    estimatedTime?: number; // seconds
}

export async function POST(req: NextRequest): Promise<NextResponse<ExportResponse>> {
    try {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body: ExportRequest = await req.json();

        // Validate required fields
        if (!body.clipS3Key) {
            return NextResponse.json(
                { success: false, error: "clipS3Key is required" },
                { status: 400 }
            );
        }

        if (!body.captions || body.captions.length === 0) {
            return NextResponse.json(
                { success: false, error: "captions are required" },
                { status: 400 }
            );
        }

        if (!(await getAuthorizedClipByS3Key(body.clipS3Key, orgId))) {
            return NextResponse.json(
                { success: false, error: "Clip not found" },
                { status: 404 }
            );
        }

        // Get the backend URL from environment
        const backendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

        // Call the Python backend to render the video
        const response = await fetch(`${backendUrl}/api/export-video`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
            },
            body: JSON.stringify({
                clip_s3_key: body.clipS3Key,
                captions: body.captions.map(c => ({
                    id: c.id,
                    start_time: c.startTime,
                    end_time: c.endTime,
                    word: c.word,
                })),
                caption_style: {
                    font: body.captionStyle.font,
                    font_size: body.captionStyle.fontSize,
                    color: body.captionStyle.color,
                    highlight_color: body.captionStyle.highlightColor,
                    background_color: body.captionStyle.backgroundColor,
                    position: body.captionStyle.position,
                    animation: body.captionStyle.animation,
                },
                frame_effect: body.frameEffect ? {
                    type: body.frameEffect.type,
                    color: body.frameEffect.color,
                    intensity: body.frameEffect.intensity,
                } : undefined,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Backend export error:", errorData);
            return NextResponse.json(
                {
                    success: false,
                    error: errorData.error || "Failed to start video export"
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            jobId: data.job_id,
            estimatedTime: data.estimated_time || 30,
        });

    } catch (error) {
        console.error("Export API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Check export job status
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("jobId");

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: "jobId is required" },
                { status: 400 }
            );
        }

        const backendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

        const response = await fetch(`${backendUrl}/api/export-status?job_id=${jobId}`, {
            headers: {
                "X-User-Id": userId,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: "Failed to get export status" },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            status: data.status, // "pending" | "processing" | "completed" | "failed"
            progress: data.progress, // 0-100
            outputUrl: data.output_url,
            error: data.error,
        });

    } catch (error) {
        console.error("Export status API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
