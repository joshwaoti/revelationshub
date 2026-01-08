"use client";

import { useState, useCallback } from "react";
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [sermonId, setSermonId] = useState<string | null>(null);

    // Processing config
    const [clipCount, setClipCount] = useState(3);
    const [videoType, setVideoType] = useState<"sermon" | "podcast">("sermon");

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
            analytics.trackSermonUpload("sermon", "youtube");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch video info");
        } finally {
            setIsLoading(false);
        }
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
            <DialogContent className="sm:max-w-lg">
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
