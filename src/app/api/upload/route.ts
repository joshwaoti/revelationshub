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

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-matroska",
]);

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

        const { filename, contentType, fileSize } = await req.json();

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: "Missing filename or contentType" },
                { status: 400 }
            );
        }

        if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
            return NextResponse.json(
                { error: "Unsupported video type" },
                { status: 400 }
            );
        }

        if (typeof fileSize === "number" && fileSize > MAX_UPLOAD_BYTES) {
            return NextResponse.json(
                { error: "File size must be under 2GB" },
                { status: 400 }
            );
        }

        // Generate a unique key for the file
        const timestamp = Date.now();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `sermons/${orgId}/${timestamp}_${sanitizedFilename}`;

        const bucket = process.env.AWS_S3_BUCKET || "josh-video-clipper";

        // Create presigned URL for upload
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
            ContentLength: typeof fileSize === "number" ? fileSize : undefined,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
        });

        return NextResponse.json({
            presignedUrl,
            key,
            bucket,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
