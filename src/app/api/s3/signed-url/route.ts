import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const s3Key = searchParams.get("key");

        if (!s3Key) {
            return NextResponse.json({ error: "S3 key is required" }, { status: 400 });
        }

        const bucket = process.env.AWS_S3_BUCKET || "josh-video-clipper";

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: s3Key,
        });

        // Generate a pre-signed URL that expires in 1 hour
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({ url: signedUrl });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json(
            { error: "Failed to generate signed URL" },
            { status: 500 }
        );
    }
}
