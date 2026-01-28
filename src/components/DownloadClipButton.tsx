"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DownloadClipButtonProps {
    clipS3Key: string;
    clipTitle?: string;
}

/**
 * Simple button to download the backend-rendered video clip
 * The video already has captions burned in from the backend processing
 */
export function DownloadClipButton({ clipS3Key, clipTitle = "clip" }: DownloadClipButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);

    const handleDownload = async () => {
        if (!clipS3Key) {
            toast.error("No video available for download");
            return;
        }

        setIsDownloading(true);
        setDownloadComplete(false);

        try {
            // Get signed URL for the clip
            const res = await fetch(`/api/s3/signed-url?key=${encodeURIComponent(clipS3Key)}`);
            const data = await res.json();

            if (!data.url) {
                throw new Error("Failed to get download URL");
            }

            // Create download link
            const a = document.createElement("a");
            a.href = data.url;
            a.download = `${clipTitle.replace(/[^a-z0-9]/gi, "_")}.mp4`;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setDownloadComplete(true);
            toast.success("Download started!");

            // Reset after a few seconds
            setTimeout(() => setDownloadComplete(false), 3000);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download video");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
            size="lg"
        >
            {isDownloading ? (
                <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Preparing Download...
                </>
            ) : downloadComplete ? (
                <>
                    <Check className="h-5 w-5 mr-2" />
                    Downloaded!
                </>
            ) : (
                <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Video
                </>
            )}
        </Button>
    );
}
