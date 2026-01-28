"use client";

import { useState, useCallback, useRef } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Upload,
    Youtube,
    FileVideo,
    Loader2,
    CheckCircle,
    AlertCircle,
    Play,
    Download,
    Clock,
} from "lucide-react";
import { analytics } from "@/lib/posthog";

// YouTube download service URL
const YOUTUBE_SERVICE_URL = process.env.NEXT_PUBLIC_YOUTUBE_SERVICE_URL || "http://localhost:8001";

interface UploadSermonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (sermonId: string) => void;
}

type UploadStep = "input" | "processing" | "complete" | "error";

interface YouTubeMetadata {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnails: {
        default?: string;
        medium?: string;
        high?: string;
        maxres?: string;
    };
    duration: number;
    durationFormatted: string;
    channelId: string;
    channelName: string;
    channelThumbnail: string;
    publishedAt: string;
    publishedDate: string;
    tags: string[];
    categoryId: string;
    defaultLanguage: string;
    defaultAudioLanguage: string;
    viewCount: string;
    viewCountFormatted: string;
    likeCount: string;
    commentCount: string;
    definition: string;
    dimension: string;
    caption: boolean;
    licensedContent: boolean;
    hasTranscript: boolean;
    captionLanguages: string[];
    liveBroadcastContent: string;
}

export function UploadSermonModal({ open, onOpenChange, onSuccess }: UploadSermonModalProps) {
    const { organization } = useOrganization();
    const { user } = useUser();

    // State
    const [activeTab, setActiveTab] = useState<"youtube" | "upload">("youtube");
    const [step, setStep] = useState<UploadStep>("input");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [sermonId, setSermonId] = useState<string | null>(null);

    // YouTube download states
    const [ytStartTime, setYtStartTime] = useState(0);
    const [ytEndTime, setYtEndTime] = useState(0);
    const [ytDownloading, setYtDownloading] = useState(false);
    const [ytDownloadProgress, setYtDownloadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Processing config
    const [clipCount, setClipCount] = useState(3);
    const [videoType, setVideoType] = useState<"sermon" | "podcast">("sermon");
    const [captionEffect, setCaptionEffect] = useState<"none" | "pop" | "fade" | "karaoke">("karaoke");

    // Convex
    const convexOrg = useQuery(
        api.organizations.getByClerkId,
        organization?.id ? { clerkOrgId: organization.id } : "skip"
    );
    const member = useQuery(
        api.members.getByClerkUserId,
        user?.id ? { clerkUserId: user.id } : "skip"
    );
    const createSermon = useMutation(api.sermons.create);

    // Fetch YouTube metadata
    const fetchYouTubeMetadata = async (url: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/youtube/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch video info");
            }

            const data = await response.json();
            setMetadata(data);
            setYtEndTime(data.duration || 0);  // Set end time to video duration
            analytics.trackSermonUpload("sermon", "youtube");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch video info");
        } finally {
            setIsLoading(false);
        }
    };

    // Download video from YouTube service
    const downloadYouTubeVideo = async () => {
        if (!metadata) return;

        setYtDownloading(true);
        setYtDownloadProgress(0);
        setError(null);

        try {
            const params = new URLSearchParams({
                url: youtubeUrl,
                quality: "highest",  // Download best available quality
            });

            const videoDuration = metadata.duration || 0;
            const effectiveEndTime = ytEndTime || videoDuration;

            // Only pass start/end if not downloading full video
            if (ytStartTime > 0) {
                params.append("start", ytStartTime.toString());
            }
            if (effectiveEndTime < videoDuration) {
                params.append("end", effectiveEndTime.toString());
            }

            const downloadUrl = `${YOUTUBE_SERVICE_URL}/api/youtube/download?${params}`;

            const xhr = new XMLHttpRequest();
            xhr.open("GET", downloadUrl, true);
            xhr.responseType = "blob";

            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setYtDownloadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const blob = xhr.response;
                    const downloadLink = document.createElement("a");
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = `${metadata.title?.slice(0, 50) || "video"}.mp4`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    setYtDownloading(false);
                    setYtDownloadProgress(100);
                } else {
                    throw new Error("Download failed");
                }
            };

            xhr.onerror = () => {
                setError("Download failed. Please try again.");
                setYtDownloading(false);
            };

            xhr.send();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Download failed");
            setYtDownloading(false);
        }
    };

    // Format time helper
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("video/")) {
                setError("Please select a video file");
                return;
            }
            if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
                setError("File size must be under 2GB");
                return;
            }
            setSelectedFile(file);
            setError(null);
            analytics.trackSermonUpload("sermon", "upload");
        }
    }, []);

    // Start processing
    const startProcessing = async () => {
        if (!convexOrg?._id || !member?._id) {
            setError("Organization not found");
            return;
        }

        setStep("processing");
        setIsLoading(true);
        setError(null);

        try {
            let s3Key = "";

            // Step 1: For file upload, get presigned URL and upload
            if (activeTab === "upload" && selectedFile) {
                setUploadProgress(10);

                // Get presigned URL
                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: selectedFile.name,
                        contentType: selectedFile.type,
                    }),
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to get upload URL");
                }

                const { presignedUrl, key } = await uploadResponse.json();
                s3Key = key;

                setUploadProgress(20);

                // Upload to S3
                const uploadResult = await fetch(presignedUrl, {
                    method: "PUT",
                    body: selectedFile,
                    headers: { "Content-Type": selectedFile.type },
                });

                if (!uploadResult.ok) {
                    throw new Error("Failed to upload file");
                }

                setUploadProgress(50);
            }

            // Step 2: Create sermon record in Convex
            const newSermonId = await createSermon({
                organizationId: convexOrg._id,
                title: metadata?.title || selectedFile?.name || "Untitled Sermon",
                description: metadata?.description,
                s3Key: s3Key,
                s3Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || "josh-video-clipper",
                // YouTube specific
                youtubeUrl: activeTab === "youtube" ? youtubeUrl : undefined,
                youtubeVideoId: metadata?.videoId,
                channelName: metadata?.channelName,
                channelId: metadata?.channelId,
                publishedAt: metadata?.publishedAt,
                tags: metadata?.tags,
                // Media info
                thumbnailUrl: metadata?.thumbnail,
                duration: metadata?.duration,
                viewCount: metadata?.viewCount,
                definition: metadata?.definition,
                hasTranscript: metadata?.hasTranscript,
                // Type
                videoType,
                createdBy: member._id,
            });

            setSermonId(newSermonId);
            setUploadProgress(60);

            // Step 3: Trigger processing via API
            const processResponse = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sermonId: newSermonId,
                    s3Key: s3Key || undefined,
                    youtubeUrl: activeTab === "youtube" ? youtubeUrl : undefined,
                    videoType,
                    clipCount,
                    captionEffect,
                    // Content generation flags
                    generateQuotes: true,
                    generateCarousel: true,
                    generateDiscussionGuide: true,
                    generateDevotional: true,
                    generateBlogPost: true,
                    generateOutline: true,
                    generateSummary: true,
                }),
            });

            if (!processResponse.ok) {
                const errorData = await processResponse.json();
                throw new Error(errorData.error || "Failed to start processing");
            }

            setUploadProgress(100);
            setStep("complete");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Processing failed");
            setStep("error");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset modal state
    const resetModal = () => {
        setStep("input");
        setYoutubeUrl("");
        setSelectedFile(null);
        setMetadata(null);
        setError(null);
        setUploadProgress(0);
        setSermonId(null);
    };

    // Handle close
    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetModal();
        }
        onOpenChange(isOpen);
    };

    // Handle success
    const handleViewSermon = () => {
        if (sermonId) {
            onSuccess?.(sermonId);
            handleClose(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-[var(--color-primary)]" />
                        Upload Sermon
                    </DialogTitle>
                    <DialogDescription>
                        Upload a video file or paste a YouTube link to get started
                    </DialogDescription>
                </DialogHeader>

                {step === "input" && (
                    <>
                        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "youtube" | "upload")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="youtube" className="flex items-center gap-2">
                                    <Youtube className="h-4 w-4" />
                                    YouTube
                                </TabsTrigger>
                                <TabsTrigger value="upload" className="flex items-center gap-2">
                                    <FileVideo className="h-4 w-4" />
                                    Upload
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="youtube" className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        YouTube URL
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                        />
                                        <Button
                                            onClick={() => fetchYouTubeMetadata(youtubeUrl)}
                                            disabled={!youtubeUrl || isLoading}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                                        </Button>
                                    </div>
                                </div>

                                {metadata && (
                                    <div className="bg-[var(--color-surface)] rounded-lg p-4 space-y-3">
                                        <div className="flex gap-3">
                                            {metadata.thumbnail && (
                                                <img
                                                    src={metadata.thumbnail}
                                                    alt="Thumbnail"
                                                    className="w-40 h-24 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-[var(--color-text-light)] line-clamp-2 mb-1">
                                                    {metadata.title}
                                                </h4>
                                                <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                                    <span>{metadata.channelName}</span>
                                                    {metadata.viewCountFormatted && (
                                                        <>
                                                            <span className="text-[var(--color-text-muted)]/50">•</span>
                                                            <span>{metadata.viewCountFormatted} views</span>
                                                        </>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                                                    <span className="font-mono">
                                                        {Math.floor(metadata.duration / 60)}:{(metadata.duration % 60).toString().padStart(2, "0")}
                                                    </span>
                                                    {metadata.definition && (
                                                        <span className="uppercase bg-[var(--color-primary)]/20 px-1.5 py-0.5 rounded text-[var(--color-primary)]">
                                                            {metadata.definition}
                                                        </span>
                                                    )}
                                                    {metadata.publishedDate && (
                                                        <span>Published {metadata.publishedDate}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags preview */}
                                        {metadata.tags && metadata.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {metadata.tags.slice(0, 5).map((tag: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs bg-[var(--color-base)] px-2 py-0.5 rounded text-[var(--color-text-muted)]"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {metadata.tags.length > 5 && (
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        +{metadata.tags.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm">
                                            {metadata.hasTranscript ? (
                                                <span className="flex items-center gap-1 text-green-500">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Captions available
                                                    {metadata.captionLanguages.length > 0 && (
                                                        <span className="text-[var(--color-text-muted)]">
                                                            ({metadata.captionLanguages.join(", ")})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-500">
                                                    <AlertCircle className="h-4 w-4" />
                                                    No captions - will generate transcript
                                                </span>
                                            )}
                                        </div>

                                        {/* Time Range Selection */}
                                        <div className="border-t border-[var(--color-border)] pt-3 mt-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Clock className="h-4 w-4" />
                                                    Time Range
                                                </div>
                                                {ytStartTime === 0 && ytEndTime === metadata.duration && (
                                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                                        Full video
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                Leave as default to download the entire video, or enter specific seconds to download a portion.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <label className="text-xs text-[var(--color-text-muted)]">Start (seconds)</label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={ytEndTime || metadata.duration}
                                                        value={ytStartTime}
                                                        onChange={(e) => setYtStartTime(Number(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className="h-8"
                                                    />
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        {formatTime(ytStartTime)}
                                                    </span>
                                                </div>
                                                <span className="text-[var(--color-text-muted)] mt-3">to</span>
                                                <div className="flex-1">
                                                    <label className="text-xs text-[var(--color-text-muted)]">End (seconds)</label>
                                                    <Input
                                                        type="number"
                                                        min={ytStartTime}
                                                        max={metadata.duration}
                                                        value={ytEndTime || metadata.duration}
                                                        onChange={(e) => setYtEndTime(Number(e.target.value) || metadata.duration)}
                                                        placeholder={String(metadata.duration)}
                                                        className="h-8"
                                                    />
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        {formatTime(ytEndTime || metadata.duration)} / {formatTime(metadata.duration)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                Selected: {formatTime(ytStartTime)} → {formatTime(ytEndTime || metadata.duration)} ({formatTime((ytEndTime || metadata.duration) - ytStartTime)})
                                            </p>
                                        </div>

                                        {/* Download Button */}
                                        <Button
                                            onClick={downloadYouTubeVideo}
                                            disabled={ytDownloading}
                                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                                        >
                                            {ytDownloading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Downloading... {ytDownloadProgress}%
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download from YouTube
                                                </>
                                            )}
                                        </Button>

                                        {ytDownloading && (
                                            <div className="w-full bg-[var(--color-base)] rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                                                    style={{ width: `${ytDownloadProgress}%` }}
                                                />
                                            </div>
                                        )}

                                        <p className="text-xs text-[var(--color-text-muted)] text-center">
                                            After downloading, go to the "Upload" tab to upload the video file.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="upload" className="space-y-4 mt-4">
                                <div
                                    className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-lg p-8 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                                    onClick={() => document.getElementById("file-input")?.click()}
                                >
                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <FileVideo className="h-10 w-10 mx-auto text-[var(--color-primary)]" />
                                            <p className="font-medium text-[var(--color-text-light)]">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-10 w-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
                                            <p className="text-[var(--color-text-light)]">
                                                Click or drag to upload
                                            </p>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                MP4, MOV, WEBM up to 2GB
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </TabsContent>
                        </Tabs>

                        {/* Processing Config */}
                        <div className="border-t border-[var(--color-primary)]/10 pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Video Type
                                    </label>
                                    <select
                                        className="w-full h-10 rounded-[var(--radius-default)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20"
                                        value={videoType}
                                        onChange={(e) => setVideoType(e.target.value as "sermon" | "podcast")}
                                    >
                                        <option value="sermon">Sermon</option>
                                        <option value="podcast">Podcast</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Clips to Generate
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={clipCount}
                                        onChange={(e) => setClipCount(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                        Caption Effect
                                    </label>
                                    <select
                                        className="w-full p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-light)]"
                                        value={captionEffect}
                                        onChange={(e) => setCaptionEffect(e.target.value as "none" | "pop" | "fade" | "karaoke")}
                                    >
                                        <option value="karaoke">Karaoke (word-by-word highlight)</option>
                                        <option value="pop">Pop (words scale up)</option>
                                        <option value="fade">Fade (smooth fade-in)</option>
                                        <option value="none">None (static text)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => handleClose(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={startProcessing}
                                disabled={
                                    isLoading ||
                                    (activeTab === "youtube" && !metadata) ||
                                    (activeTab === "upload" && !selectedFile)
                                }
                            >
                                Start Processing
                            </Button>
                        </div>
                    </>
                )}

                {step === "processing" && (
                    <div className="py-8 text-center space-y-4">
                        <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] animate-spin" />
                        <div>
                            <h3 className="font-medium text-[var(--color-text-light)] mb-2">
                                Processing your sermon...
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                This may take a few minutes
                            </p>
                        </div>
                        <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                            <div
                                className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {uploadProgress < 50 ? "Uploading video..." :
                                uploadProgress < 80 ? "Processing started..." :
                                    "Finishing up..."}
                        </p>
                    </div>
                )}

                {step === "complete" && (
                    <div className="py-8 text-center space-y-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                        <div>
                            <h3 className="font-medium text-[var(--color-text-light)] mb-2">
                                Upload Complete!
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Your sermon is being processed. You&apos;ll be notified when clips are ready.
                            </p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" onClick={() => handleClose(false)}>
                                Upload Another
                            </Button>
                            <Button onClick={handleViewSermon}>
                                <Play className="h-4 w-4 mr-2" />
                                View Sermon
                            </Button>
                        </div>
                    </div>
                )}

                {step === "error" && (
                    <div className="py-8 text-center space-y-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                        <div>
                            <h3 className="font-medium text-[var(--color-text-light)] mb-2">
                                Upload Failed
                            </h3>
                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        </div>
                        <Button variant="outline" onClick={resetModal}>
                            Try Again
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
