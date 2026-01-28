import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "josh-video-clipper";

// Generate presigned URL for uploading exported video
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const clipId = searchParams.get("clipId");
        const type = searchParams.get("type") || "exported";

        if (!clipId) {
            return NextResponse.json(
                { error: "clipId is required" },
                { status: 400 }
            );
        }

        // Generate unique S3 key for exported video
        const timestamp = Date.now();
        const s3Key = `exports/${orgId || userId}/${clipId}_${type}_${timestamp}.mp4`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            ContentType: "video/mp4",
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
        });

        return NextResponse.json({
            uploadUrl,
            s3Key,
        });

    } catch (error) {
        console.error("Upload URL generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
