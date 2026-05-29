import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuthorizedClip } from "@/lib/server/resource-auth";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "josh-video-clipper";
const ALLOWED_EXPORT_TYPES = new Set(["exported", "captioned", "edited"]);

// Generate presigned URL for uploading exported video
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
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

        if (!ALLOWED_EXPORT_TYPES.has(type)) {
            return NextResponse.json(
                { error: "Invalid export type" },
                { status: 400 }
            );
        }

        const authorized = await getAuthorizedClip(clipId, orgId);
        if (!authorized) {
            return NextResponse.json(
                { error: "Clip not found" },
                { status: 404 }
            );
        }

        // Generate unique S3 key for exported video
        const timestamp = Date.now();
        const s3Key = `exports/${orgId}/${authorized.clip._id}_${type}_${timestamp}.mp4`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            ContentType: "video/mp4",
            ServerSideEncryption: "AES256",
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 900, // 15 minutes
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
