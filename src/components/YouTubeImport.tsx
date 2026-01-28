"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Youtube,
    Download,
    Upload,
    Loader2,
    Check,
    AlertCircle,
    Clock,
    Play,
    Pause,
} from "lucide-react";
import { toast } from "sonner";

// YouTube download service URL
const YOUTUBE_SERVICE_URL = process.env.NEXT_PUBLIC_YOUTUBE_SERVICE_URL || "http://localhost:8001";

interface VideoInfo {
    title: string;
    author: string;
    duration: number;
    duration_formatted: string;
    thumbnail: string;
    has_captions: boolean;
    qualities: Array<{
        resolution: string;
        fps: number;
        filesize: number;
        itag: number;
    }>;
}

interface YouTubeImportProps {
    onVideoUploaded: (file: File) => void;
}

export function YouTubeImport({ onVideoUploaded }: YouTubeImportProps) {
    const [url, setUrl] = useState("");
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [selectedQuality, setSelectedQuality] = useState("720p");
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validate YouTube URL
    const isValidYouTubeUrl = (url: string): boolean => {
        const patterns = [
            /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
            /^(https?:\/\/)?(www\.)?youtube\.com\/live\/[\w-]+/,
        ];
        return patterns.some((pattern) => pattern.test(url));
    };

    // Fetch video info
    const fetchVideoInfo = async () => {
        if (!isValidYouTubeUrl(url)) {
            setError("Please enter a valid YouTube URL");
            return;
        }

        setLoading(true);
        setError(null);
        setVideoInfo(null);

        try {
            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/api/youtube/info?url=${encodeURIComponent(url)}`
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to fetch video info");
            }

            const data = await response.json();
            setVideoInfo(data);
            setEndTime(data.duration);

            if (data.qualities.length > 0) {
                setSelectedQuality(data.qualities[0].resolution || "720p");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch video info");
            toast.error("Failed to fetch video info");
        } finally {
            setLoading(false);
        }
    };

    // Download video
    const downloadVideo = async () => {
        if (!videoInfo) return;

        setDownloading(true);
        setDownloadProgress(0);

        try {
            // Build download URL with parameters
            const params = new URLSearchParams({
                url: url,
                quality: selectedQuality,
            });

            if (startTime > 0) {
                params.append("start", startTime.toString());
            }
            if (endTime < videoInfo.duration) {
                params.append("end", endTime.toString());
            }

            const downloadUrl = `${YOUTUBE_SERVICE_URL}/api/youtube/download?${params}`;

            // Use XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();
            xhr.open("GET", downloadUrl, true);
            xhr.responseType = "blob";

            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    setDownloadProgress(Math.round(percent));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    // Create download link
                    const blob = xhr.response;
                    const downloadLink = document.createElement("a");
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = `${videoInfo.title.slice(0, 50)}.mp4`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);

                    toast.success("Video downloaded! Now upload it to continue.");
                    setDownloading(false);
                    setDownloadProgress(100);
                } else {
                    throw new Error("Download failed");
                }
            };

            xhr.onerror = () => {
                toast.error("Download failed. Please try again.");
                setDownloading(false);
            };

            xhr.send();
        } catch (err) {
            toast.error("Download failed");
            setDownloading(false);
        }
    };

    // Format time for display
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle file upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onVideoUploaded(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                    YouTube URL
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="pl-10"
                            onKeyDown={(e) => e.key === "Enter" && fetchVideoInfo()}
                        />
                    </div>
                    <Button onClick={fetchVideoInfo} disabled={loading || !url}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Fetch"
                        )}
                    </Button>
                </div>
                {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </p>
                )}
            </div>

            {/* Video Info */}
            {videoInfo && (
                <div className="space-y-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                    {/* Thumbnail and Title */}
                    <div className="flex gap-4">
                        <img
                            src={videoInfo.thumbnail}
                            alt={videoInfo.title}
                            className="w-40 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                            <h3 className="font-medium line-clamp-2">{videoInfo.title}</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {videoInfo.author}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-muted)]">
                                <Clock className="h-4 w-4" />
                                {videoInfo.duration_formatted}
                                {videoInfo.has_captions && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                        Captions
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Select Time Range
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-[var(--color-text-muted)]">Start</label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={endTime}
                                    value={startTime}
                                    onChange={(e) => setStartTime(Number(e.target.value))}
                                    className="h-8"
                                />
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    {formatTime(startTime)}
                                </span>
                            </div>
                            <span className="text-[var(--color-text-muted)]">to</span>
                            <div className="flex-1">
                                <label className="text-xs text-[var(--color-text-muted)]">End</label>
                                <Input
                                    type="number"
                                    min={startTime}
                                    max={videoInfo.duration}
                                    value={endTime}
                                    onChange={(e) => setEndTime(Number(e.target.value))}
                                    className="h-8"
                                />
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    {formatTime(endTime)}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Duration: {formatTime(endTime - startTime)}
                        </p>
                    </div>

                    {/* Quality Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quality</label>
                        <div className="flex gap-2 flex-wrap">
                            {videoInfo.qualities.map((q) => (
                                <button
                                    key={q.itag}
                                    onClick={() => setSelectedQuality(q.resolution)}
                                    className={`px-3 py-1 rounded text-sm transition-colors ${selectedQuality === q.resolution
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "bg-[var(--color-base)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10"
                                        }`}
                                >
                                    {q.resolution}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Download Button */}
                    <Button
                        onClick={downloadVideo}
                        disabled={downloading}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Downloading... {downloadProgress}%
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Download Video
                            </>
                        )}
                    </Button>

                    {downloading && (
                        <div className="w-full bg-[var(--color-base)] rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Upload Section */}
            <div className="border-t border-[var(--color-border)] pt-6">
                <h3 className="font-medium mb-3">Upload Video</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    After downloading, upload the video file to start processing.
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Video File
                </Button>
            </div>
        </div>
    );
}
