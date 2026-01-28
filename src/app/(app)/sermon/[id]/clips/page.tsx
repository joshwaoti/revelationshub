"use client";

import { use, useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Download,
    Share2,
    Edit,
    RefreshCw,
    Loader2,
    ChevronLeft,
    Wand2,
} from "lucide-react";
import Link from "next/link";
import { RegenerateClipsModal } from "@/components/regenerate-clips-modal";

// Format duration
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Format timestamp
function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ClipsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch clips
    const clips = useQuery(
        api.clips.getBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );

    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

    // State for regenerate modal
    const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);

    // State for tracking if clips are being generated
    const [isGenerating, setIsGenerating] = useState(false);

    // State for signed URLs
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
    const [loadingUrl, setLoadingUrl] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Get ready clips
    const readyClips = clips?.filter(c => c.status === "ready") || [];
    const processingClips = clips?.filter(c => c.status === "processing" || c.status === "pending") || [];

    // Check if any clips are being generated or processing
    const isProcessingClips = processingClips.length > 0 || isGenerating;

    // Selected clip
    const selectedClip = selectedClipId
        ? readyClips.find(c => c._id === selectedClipId)
        : readyClips[0];

    // Fetch signed URL when selected clip changes
    useEffect(() => {
        const fetchSignedUrl = async () => {
            if (!selectedClip?.s3Key) return;

            // Check if we already have a valid URL
            if (signedUrls[selectedClip.s3Key]) return;

            setLoadingUrl(true);
            try {
                const response = await fetch(`/api/s3/signed-url?key=${encodeURIComponent(selectedClip.s3Key)}`);
                const data = await response.json();

                if (data.url) {
                    setSignedUrls(prev => ({
                        ...prev,
                        [selectedClip.s3Key]: data.url
                    }));
                }
            } catch (error) {
                console.error("Failed to get signed URL:", error);
            } finally {
                setLoadingUrl(false);
            }
        };

        fetchSignedUrl();
    }, [selectedClip?.s3Key, signedUrls]);

    // Reset video state when clip changes
    useEffect(() => {
        setCurrentTime(0);
        setIsPlaying(false);
    }, [selectedClip?._id]);

    // Track previous clip count to detect when new clips are added
    const prevClipCountRef = useRef(clips?.length || 0);

    // Reset generating state when new clips appear (either processing or ready)
    useEffect(() => {
        const currentCount = clips?.length || 0;

        // If clips count increased, or if processing clips appeared, stop "generating" state
        // We let the UI rely on isProcessingClips (data-driven) from this point
        if (isGenerating) {
            if (currentCount > prevClipCountRef.current || processingClips.length > 0) {
                setIsGenerating(false);
            }
        }

        prevClipCountRef.current = currentCount;
    }, [clips?.length, processingClips.length, isGenerating]);

    // Get signed URL for a clip
    const getClipUrl = (s3Key: string) => {
        return signedUrls[s3Key] || "";
    };

    // Handle video time update
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Loading state
    if (sermon === undefined || clips === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    // Sermon not found
    if (sermon === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-[var(--color-text-muted)]">Sermon not found</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-48px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link href={`/sermon/${sermonId}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <h2 className="font-display text-lg font-semibold text-[var(--color-text-light)]">
                        Clips for: {sermon?.title}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                        {readyClips.length} ready
                    </Badge>
                    {processingClips.length > 0 && (
                        <Badge variant="processing">
                            {processingClips.length} processing
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Column - Clip List */}
                <div className="w-80 shrink-0 space-y-2 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                            Generated Clips
                        </h3>
                        <Button
                            variant={isProcessingClips ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => setRegenerateModalOpen(true)}
                            disabled={!sermon?.s3Key || isProcessingClips}
                            className={isProcessingClips ? "animate-pulse border-primary/50 text-primary bg-primary/10 relative overflow-hidden" : ""}
                            title={!sermon?.s3Key ? "Video clips can only be regenerated for uploaded videos" : "Generate new clips"}
                        >
                            {isProcessingClips && (
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                            {isProcessingClips ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-4 w-4 mr-1" />
                                    Generate More
                                </>
                            )}
                        </Button>
                    </div>

                    {readyClips.length === 0 && processingClips.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                            <p>No clips generated yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Processing clips */}
                            {processingClips.map((clip) => (
                                <Card key={clip._id} className="opacity-60">
                                    <div className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                Processing clip...
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                            <span className="font-mono">
                                                {formatDuration(clip.endTime - clip.startTime)}
                                            </span>
                                            <span>@ {formatTimestamp(clip.startTime)}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Ready clips */}
                            {readyClips.map((clip) => (
                                <Card
                                    key={clip._id}
                                    onClick={() => setSelectedClipId(clip._id)}
                                    className={`cursor-pointer transition-all ${selectedClip?._id === clip._id
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                        : "hover:border-[var(--color-primary)]/50"
                                        }`}
                                >
                                    <div className="p-3">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="text-sm text-[var(--color-text-light)] line-clamp-2">
                                                {clip.title || `Clip at ${formatTimestamp(clip.startTime)}`}
                                            </p>
                                            <Badge variant="success" className="shrink-0">
                                                Ready
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                            <span className="font-mono">
                                                {formatDuration(clip.endTime - clip.startTime)}
                                            </span>
                                            <span>@ {formatTimestamp(clip.startTime)}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </>
                    )}
                </div>

                {/* Center - Video Preview */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedClip ? (
                        <>
                            {/* Video Preview - Vertical Video Optimized */}
                            <div className="flex-1 flex items-center justify-center bg-[var(--color-base)] rounded-[var(--radius-default)] p-4 overflow-hidden">
                                {/* Container that maintains 9:16 aspect ratio and fills available height */}
                                <div className="relative h-full" style={{ aspectRatio: '9/16', maxHeight: '100%' }}>
                                    {getClipUrl(selectedClip.s3Key) ? (
                                        <>
                                            <video
                                                ref={videoRef}
                                                key={selectedClip._id}
                                                controls
                                                controlsList="nodownload"
                                                playsInline
                                                className="w-full h-full object-contain rounded-lg bg-black"
                                                poster={selectedClip.thumbnailUrl || undefined}
                                                style={{ maxHeight: '100%' }}
                                                onTimeUpdate={handleTimeUpdate}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                            >
                                                <source src={getClipUrl(selectedClip.s3Key)} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </>
                                    ) : loadingUrl ? (
                                        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg" style={{ aspectRatio: '9/16' }}>
                                            <div className="text-center">
                                                <Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
                                                <p className="text-white/70 text-sm">Loading video...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
                                            {selectedClip.thumbnailUrl ? (
                                                <img
                                                    src={selectedClip.thumbnailUrl}
                                                    alt="Clip preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-16 w-16 rounded-full bg-[var(--color-primary)]/50 flex items-center justify-center">
                                                    <Loader2 className="h-7 w-7 text-[var(--color-base)] animate-spin" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Clip Actions */}
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getClipUrl(selectedClip.s3Key) ? (
                                        <a
                                            href={getClipUrl(selectedClip.s3Key)}
                                            download
                                        >
                                            <Button variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </a>
                                    ) : (
                                        <Button disabled variant="outline">
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Loading...
                                        </Button>
                                    )}
                                    <Button variant="outline">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>

                                <Link href={`/sermon/${sermonId}/editor?clip=${selectedClip._id}`}>
                                    <Button size="lg" className="px-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Open in Editor
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
                            <p>Select a clip to preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Regenerate Clips Modal */}
            <RegenerateClipsModal
                open={regenerateModalOpen}
                onOpenChange={setRegenerateModalOpen}
                sermonId={sermon._id}
                sermonTitle={sermon.title}
                onSuccess={() => {
                    setIsGenerating(true);
                    // The clips will auto-refresh via Convex's live queries
                }}
            />
        </div>
    );
}

