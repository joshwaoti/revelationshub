"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, X } from "lucide-react";
import { toast } from "sonner";

interface DownloadClipButtonProps {
    clipS3Key: string;
    clipTitle?: string;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
    className?: string;
}

/**
 * Downloads the backend-rendered clip (captions already burned in) with
 * real byte-level progress instead of a fire-and-forget anchor click.
 */
export function DownloadClipButton({
    clipS3Key,
    clipTitle = "clip",
    variant = "default",
    size = "lg",
    className,
}: DownloadClipButtonProps) {
    const [progress, setProgress] = useState<number | null>(null);
    const [downloadComplete, setDownloadComplete] = useState(false);

    const isDownloading = progress !== null;

    const handleDownload = async () => {
        if (!clipS3Key) {
            toast.error("No video available for download");
            return;
        }

        setProgress(0);
        setDownloadComplete(false);

        try {
            const res = await fetch(`/api/s3/signed-url?key=${encodeURIComponent(clipS3Key)}`);
            const data = await res.json();
            if (!data.url) throw new Error("Failed to get download URL");

            const videoResponse = await fetch(data.url);
            if (!videoResponse.ok || !videoResponse.body) {
                throw new Error("Failed to download video");
            }

            const totalBytes = Number(videoResponse.headers.get("Content-Length")) || 0;
            const reader = videoResponse.body.getReader();
            const chunks: BlobPart[] = [];
            let receivedBytes = 0;

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedBytes += value.byteLength;
                if (totalBytes > 0) {
                    setProgress(Math.min(99, Math.round((receivedBytes / totalBytes) * 100)));
                }
            }

            const blob = new Blob(chunks, { type: "video/mp4" });
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `${clipTitle.replace(/[^a-z0-9]/gi, "_")}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);

            setDownloadComplete(true);
            toast.success("Clip saved", {
                description: `${(receivedBytes / 1024 / 1024).toFixed(1)} MB downloaded`,
            });
            setTimeout(() => setDownloadComplete(false), 3000);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Download failed", {
                description: "Check your connection and try again.",
                action: { label: "Retry", onClick: handleDownload },
                icon: <X className="h-4 w-4" />,
            });
        } finally {
            setProgress(null);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant={variant}
            size={size}
            className={`relative overflow-hidden ${variant === "default" ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90" : ""} ${className ?? ""}`}
        >
            {/* Progress fill behind the label */}
            {isDownloading && (
                <span
                    className="absolute inset-y-0 left-0 bg-white/20 transition-[width] duration-200"
                    style={{ width: `${progress ?? 0}%` }}
                />
            )}
            <span className="relative flex items-center">
                {isDownloading ? (
                    <>
                        <Download className="h-4 w-4 mr-2 animate-bounce" />
                        {progress && progress > 0 ? `Downloading ${progress}%` : "Preparing…"}
                    </>
                ) : downloadComplete ? (
                    <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved!
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </>
                )}
            </span>
        </Button>
    );
}
