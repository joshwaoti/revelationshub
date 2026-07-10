"use client";

import { useState, useCallback, useRef } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
    Clock,
    X,
    Church,
    Mic,
} from "lucide-react";
import { analytics } from "@/lib/posthog";

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
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [sermonId, setSermonId] = useState<Id<"sermons"> | null>(null);

    // YouTube download states
    const [ytStartTime, setYtStartTime] = useState(0);
    const [ytEndTime, setYtEndTime] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Processing config
    const [clipCount, setClipCount] = useState(3);
    const [videoType, setVideoType] = useState<"sermon" | "podcast">("sermon");
    const [captionEffect, setCaptionEffect] = useState<"none" | "pop" | "fade" | "karaoke">("karaoke");
    const [uploadController, setUploadController] = useState<AbortController | null>(null);

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
    const patchS3Key = useMutation(api.sermons.patchS3Key);
    const cancelSermon = useMutation(api.sermons.cancel);

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
            analytics.trackSermonUpload(videoType, "youtube");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch video info");
        } finally {
            setIsLoading(false);
        }
    };

    // Format time helper
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const acceptVideoFile = useCallback((file: File) => {
        if (file) {
            if (!file.type.startsWith("video/")) {
                setError("Please select a video file");
                return false;
            }
            if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
                setError("File size must be under 2GB");
                return false;
            }
            setSelectedFile(file);
            setError(null);
            analytics.trackSermonUpload(videoType, "upload");
        }

        return true;
    }, [videoType]);

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            acceptVideoFile(file);
        }
    }, [acceptVideoFile]);

    const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingFile(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            acceptVideoFile(file);
        }
    }, [acceptVideoFile]);

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
            // Step 1: Create the Convex sermon record IMMEDIATELY so it shows
            // in the library with an "Uploading" badge even if modal is closed.
            const newSermonId = await createSermon({
                organizationId: convexOrg._id,
                title: metadata?.title || selectedFile?.name || (videoType === "podcast" ? "Untitled Episode" : "Untitled Sermon"),
                description: metadata?.description,
                s3Key: "", // placeholder, patched below after upload
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
            setUploadProgress(10);

            let s3Key = "";

            // Step 2a: For YouTube, download directly to S3 (server-side)
            if (activeTab === "youtube" && metadata) {
                const videoDuration = metadata.duration || 0;
                const effectiveEndTime = ytEndTime || videoDuration;

                const downloadResponse = await fetch("/api/youtube/download-to-s3", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: youtubeUrl,
                        quality: "highest",
                        start: ytStartTime > 0 ? ytStartTime.toString() : undefined,
                        end: effectiveEndTime < videoDuration ? effectiveEndTime.toString() : undefined,
                    }),
                });

                if (!downloadResponse.ok) {
                    const errorData = await downloadResponse.json();
                    throw new Error(errorData.error || "Failed to download video");
                }

                const downloadResult = await downloadResponse.json();
                s3Key = downloadResult.s3Key;

                setUploadProgress(50);
            }

            // Step 2b: For file upload, get presigned URL and upload
            if (activeTab === "upload" && selectedFile) {
                // Create abort controller for cancellation
                const controller = new AbortController();
                setUploadController(controller);

                // Get presigned URL
                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: selectedFile.name,
                        contentType: selectedFile.type,
                        fileSize: selectedFile.size,
                    }),
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to get upload URL");
                }

                const { presignedUrl, key } = await uploadResponse.json();
                s3Key = key;
                setUploadProgress(25);

                // Upload to S3 with abort support
                const uploadResult = await fetch(presignedUrl, {
                    method: "PUT",
                    body: selectedFile,
                    headers: { "Content-Type": selectedFile.type },
                    signal: controller.signal,
                });

                if (!uploadResult.ok) {
                    throw new Error("Failed to upload file");
                }

                setUploadProgress(50);
            }

            // Step 3: Patch the real S3 key onto the sermon record
            await patchS3Key({ sermonId: newSermonId, s3Key });
            setUploadProgress(60);

            // Step 4: Trigger processing via Inngest pipeline
            const processResponse = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sermonId: newSermonId,
                    s3Key: s3Key,
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

    // Cancel upload/processing
    const handleCancel = async () => {
        // Abort any ongoing upload
        if (uploadController) {
            uploadController.abort();
        }

        if (sermonId) {
            try {
                await cancelSermon({ sermonId });
            } catch (err) {
                console.error("Failed to cancel sermon:", err);
            }
        }
        resetModal();
        onOpenChange(false);
    };

    // Handle close
    const handleClose = (isOpen: boolean) => {
        if (!isOpen && (step === "processing" || step === "input")) {
            // Cancel if closing during processing
            handleCancel();
            return;
        }
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
            <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-[var(--color-primary)]" />
                        {videoType === "podcast" ? "Upload Podcast Episode" : "Upload Sermon"}
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
                                    <div className="flex flex-col gap-2 sm:flex-row">
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
                                    <div className="bg-[var(--color-surface)] rounded-lg p-3 space-y-3 sm:p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            {metadata.thumbnail && (
                                                <img
                                                    src={metadata.thumbnail}
                                                    alt="Thumbnail"
                                                    className="aspect-video w-full rounded object-cover sm:h-24 sm:w-40"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-[var(--color-text-light)] line-clamp-2 mb-1">
                                                    {metadata.title}
                                                </h4>
                                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-text-muted)]">
                                                    <span className="min-w-0 break-words">{metadata.channelName}</span>
                                                    {metadata.viewCountFormatted && (
                                                        <>
                                                            <span className="text-[var(--color-text-muted)]/50">/</span>
                                                            <span>{metadata.viewCountFormatted} views</span>
                                                        </>
                                                    )}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
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

                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            {metadata.hasTranscript ? (
                                                <span className="flex min-w-0 flex-wrap items-center gap-1 text-green-500">
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
                                            <div className="flex flex-wrap items-center justify-between gap-2">
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
                                            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
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
                                                <span className="hidden text-[var(--color-text-muted)] sm:mt-7 sm:block">to</span>
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
                                                Selected: {formatTime(ytStartTime)} to {formatTime(ytEndTime || metadata.duration)} ({formatTime((ytEndTime || metadata.duration) - ytStartTime)})
                                            </p>
                                        </div>

                                        {/* Ready to Process indicator */}
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <p className="text-sm text-green-400">
                                                Video ready. Click <strong>Start Processing</strong> below to generate clips and content.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="upload" className="space-y-4 mt-4">
                                <div
                                    className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors sm:p-8 ${isDraggingFile ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" : "border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]"}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        setIsDraggingFile(true);
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDraggingFile(true);
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        setIsDraggingFile(false);
                                    }}
                                    onDrop={handleFileDrop}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                >
                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <FileVideo className="h-10 w-10 mx-auto text-[var(--color-primary)]" />
                                            <p className="break-all font-medium text-[var(--color-text-light)]">
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
                                                Drop a video here or tap to browse
                                            </p>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                MP4, MOV, WEBM up to 2GB
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
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
                            {/* Content type - drives the whole processing pipeline */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    What are you uploading?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setVideoType("sermon")}
                                        className={`flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all ${videoType === "sermon"
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2 font-medium text-sm text-[var(--color-text-light)]">
                                            <Church className="h-4 w-4 text-[var(--color-primary)]" />
                                            Sermon
                                        </span>
                                        <span className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                            Tracks the preacher with a cinematic camera, cleans up room audio, finds convicting &amp; encouraging moments
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVideoType("podcast")}
                                        className={`flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all ${videoType === "podcast"
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2 font-medium text-sm text-[var(--color-text-light)]">
                                            <Mic className="h-4 w-4 text-[var(--color-primary)]" />
                                            Podcast
                                        </span>
                                        <span className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                            Follows whoever is speaking, finds stories, hot takes &amp; Q&amp;A moments made for Reels and Shorts
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Caption style */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Caption Style
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {([
                                        { value: "karaoke", label: "Highlight", hint: "Active word lights up", recommended: true },
                                        { value: "pop", label: "Pop", hint: "Highlight + subtle scale", recommended: false },
                                        { value: "fade", label: "Fade", hint: "Phrases fade in", recommended: false },
                                        { value: "none", label: "Minimal", hint: "Clean static text", recommended: false },
                                    ] as const).map((style) => (
                                        <button
                                            key={style.value}
                                            type="button"
                                            onClick={() => setCaptionEffect(style.value)}
                                            className={`relative rounded-xl border-2 p-2.5 text-center transition-all ${captionEffect === style.value
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                                }`}
                                        >
                                            {style.recommended && (
                                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white">
                                                    Best
                                                </span>
                                            )}
                                            {/* Mini caption preview */}
                                            <span className="block font-display text-[13px] font-extrabold uppercase tracking-tight text-[var(--color-text-light)]">
                                                {style.value === "karaoke" || style.value === "pop" ? (
                                                    <>YOUR <span className="text-[#FFD700]">STORY</span></>
                                                ) : style.value === "fade" ? (
                                                    <span className="opacity-70">YOUR STORY</span>
                                                ) : (
                                                    <>YOUR STORY</>
                                                )}
                                            </span>
                                            <span className="mt-1 block text-[10px] leading-tight text-[var(--color-text-muted)]">
                                                {style.hint}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                                    Clips to Generate
                                </label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={clipCount}
                                        onChange={(e) => setClipCount(Number(e.target.value))}
                                        className="w-24"
                                    />
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        The AI ranks every moment it finds and renders the top {clipCount}. You can always generate more later.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                    <div className="py-8 space-y-6">
                        <div className="text-center">
                            <div className="relative mx-auto mb-4 h-14 w-14">
                                <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 animate-ping" />
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                                    <Loader2 className="h-7 w-7 text-[var(--color-primary)] animate-spin" />
                                </div>
                            </div>
                            <h3 className="font-medium text-[var(--color-text-light)] mb-1">
                                {videoType === "podcast" ? "Getting your episode ready…" : "Getting your sermon ready…"}
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                You can close this — processing continues in the background
                            </p>
                        </div>

                        {/* Stage checklist */}
                        <div className="mx-auto max-w-xs space-y-2.5">
                            {[
                                { label: "Uploading video", threshold: 10 },
                                { label: "Handing off to the AI pipeline", threshold: 60 },
                                { label: "Transcription & clip discovery queued", threshold: 100 },
                            ].map((stage) => {
                                const done = uploadProgress >= stage.threshold;
                                const active = !done && uploadProgress >= stage.threshold - 50;
                                return (
                                    <div key={stage.label} className="flex items-center gap-2.5 text-sm">
                                        {done ? (
                                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                                        ) : active ? (
                                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-primary)]" />
                                        ) : (
                                            <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[var(--color-border)]" />
                                        )}
                                        <span className={done ? "text-[var(--color-text-light)]" : "text-[var(--color-text-muted)]"}>
                                            {stage.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="w-full bg-[var(--color-surface)] rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>

                        <div className="text-center">
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {step === "complete" && (
                    <div className="py-8 text-center space-y-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                        <div>
                            <h3 className="font-medium text-[var(--color-text-light)] mb-2">
                                {videoType === "podcast" ? "Episode uploaded!" : "Sermon uploaded!"}
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                The AI is transcribing, hunting for the best moments, and rendering your clips.
                                Track live progress on the {videoType === "podcast" ? "episode" : "sermon"} page.
                            </p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" onClick={() => handleClose(false)}>
                                Upload Another
                            </Button>
                            <Button onClick={handleViewSermon}>
                                <Play className="h-4 w-4 mr-2" />
                                {videoType === "podcast" ? "View Episode" : "View Sermon"}
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
