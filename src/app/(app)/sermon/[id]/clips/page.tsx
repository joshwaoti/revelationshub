"use client";

import { use, useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Share2,
    Edit,
    Loader2,
    ChevronLeft,
    Wand2,
    Flame,
    Quote,
    MessageSquare,
    Film,
    Clapperboard,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RegenerateClipsModal } from "@/components/regenerate-clips-modal";
import { DownloadClipButton } from "@/components/DownloadClipButton";

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

// Category chip labels for both sermon and podcast categories
const CATEGORY_LABELS: Record<string, string> = {
    conviction: "Conviction",
    encouragement: "Encouragement",
    teaching: "Teaching",
    story: "Story",
    challenge: "Challenge",
    testimony: "Testimony",
    hot_take: "Hot Take",
    insight: "Insight",
    qa: "Q&A",
    humor: "Humor",
    advice: "Advice",
};

function ScoreBadge({ score }: { score?: number }) {
    if (typeof score !== "number") return null;
    const tone =
        score >= 85
            ? "text-orange-400 bg-orange-500/10 border-orange-500/30"
            : score >= 70
                ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                : "text-[var(--color-text-muted)] bg-[var(--color-surface)] border-[var(--color-border)]";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>
            <Flame className="h-3 w-3" />
            {score}
        </span>
    );
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

    const isPodcast = sermon?.videoType === "podcast";
    const contentWord = isPodcast ? "episode" : "sermon";

    // Get ready clips, best first
    const readyClips = (clips?.filter(c => c.status === "ready") || [])
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const processingClips = clips?.filter(c => c.status === "processing" || c.status === "pending") || [];

    // Check if any clips are being generated or processing
    const isProcessingClips = processingClips.length > 0 || isGenerating;
    const isSermonStillProcessing = sermon?.status === "processing" || sermon?.status === "uploading";

    // Selected clip
    const selectedClip = selectedClipId
        ? readyClips.find(c => c._id === selectedClipId)
        : readyClips[0];

    // Fetch signed URL when selected clip changes
    useEffect(() => {
        const fetchSignedUrl = async () => {
            if (!selectedClip?.s3Key) return;
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

    // Track previous clip count to detect when new clips are added
    const prevClipCountRef = useRef(clips?.length || 0);

    // Reset generating state when new clips appear (either processing or ready)
    useEffect(() => {
        const currentCount = clips?.length || 0;
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

    const handleShare = async () => {
        if (!selectedClip) return;
        const url = getClipUrl(selectedClip.s3Key);
        if (!url) return;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: selectedClip.title || "Clip",
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied", {
                    description: "Share link is valid for a limited time.",
                });
            }
        } catch {
            // User cancelled share sheet - not an error
        }
    };

    // Loading state - skeleton layout instead of a lone spinner
    if (sermon === undefined || clips === undefined) {
        return (
            <div className="h-[calc(100vh-48px)] flex flex-col animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-20 rounded-lg bg-[var(--color-surface)]" />
                    <div className="h-6 w-64 rounded-lg bg-[var(--color-surface)]" />
                </div>
                <div className="flex-1 flex gap-6 min-h-0">
                    <div className="w-80 shrink-0 space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)]" />
                        ))}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="h-[70%] rounded-xl bg-[var(--color-surface)]" style={{ aspectRatio: "9/16" }} />
                    </div>
                </div>
            </div>
        );
    }

    // Sermon not found
    if (sermon === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-[var(--color-text-muted)]">Not found</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-48px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href={`/sermon/${sermonId}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <h2 className="font-display text-lg font-semibold text-[var(--color-text-light)] truncate">
                        Clips · {sermon?.title}
                    </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">
                        {readyClips.length} ready
                    </Badge>
                    {processingClips.length > 0 && (
                        <Badge variant="processing">
                            {processingClips.length} rendering
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
                        /* Designed empty state */
                        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-5 py-10 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
                                <Clapperboard className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            {isSermonStillProcessing ? (
                                <>
                                    <p className="font-medium text-[var(--color-text-light)] mb-1">
                                        Clips are on the way
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                        The AI is transcribing your {contentWord} and hunting for the most
                                        share-worthy moments. This usually takes a few minutes.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-[var(--color-text-light)] mb-1">
                                        No clips yet
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
                                        Generate clips from the best moments of this {contentWord}, or
                                        describe the exact moment you want in the transcript chat.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setRegenerateModalOpen(true)}
                                            disabled={!sermon?.s3Key}
                                        >
                                            <Wand2 className="h-4 w-4 mr-1.5" />
                                            Generate Clips
                                        </Button>
                                        <Link href={`/sermon/${sermonId}/chat`} className="w-full">
                                            <Button size="sm" variant="outline" className="w-full">
                                                <MessageSquare className="h-4 w-4 mr-1.5" />
                                                Ask the Transcript
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Processing clips */}
                            {processingClips.map((clip) => (
                                <Card key={clip._id} className="relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    <div className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                                            <p className="text-sm text-[var(--color-text-light)]">
                                                {clip.title || "Rendering clip…"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                            <span className="font-mono">
                                                {formatDuration(clip.endTime - clip.startTime)}
                                            </span>
                                            <span>@ {formatTimestamp(clip.startTime)}</span>
                                            <span className="text-[var(--color-primary)]">Adding captions…</span>
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
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <p className="text-sm font-medium text-[var(--color-text-light)] line-clamp-2">
                                                {clip.title || `Clip at ${formatTimestamp(clip.startTime)}`}
                                            </p>
                                            <ScoreBadge score={clip.score} />
                                        </div>
                                        {clip.hook && (
                                            <p className="mb-1.5 text-xs italic text-[var(--color-text-muted)] line-clamp-1">
                                                “{clip.hook}”
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                            <span className="font-mono">
                                                {formatDuration(clip.endTime - clip.startTime)}
                                            </span>
                                            <span>@ {formatTimestamp(clip.startTime)}</span>
                                            {clip.category && CATEGORY_LABELS[clip.category] && (
                                                <span className="rounded-full bg-[var(--color-primary)]/10 px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]">
                                                    {CATEGORY_LABELS[clip.category]}
                                                </span>
                                            )}
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
                                <div className="relative h-full" style={{ aspectRatio: '9/16', maxHeight: '100%' }}>
                                    {getClipUrl(selectedClip.s3Key) ? (
                                        <video
                                            ref={videoRef}
                                            key={selectedClip._id}
                                            controls
                                            controlsList="nodownload"
                                            playsInline
                                            className="w-full h-full object-contain rounded-lg bg-black"
                                            poster={selectedClip.thumbnailUrl || undefined}
                                            style={{ maxHeight: '100%' }}
                                        >
                                            <source src={getClipUrl(selectedClip.s3Key)} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : loadingUrl ? (
                                        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg" style={{ aspectRatio: '9/16' }}>
                                            <div className="text-center">
                                                <Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
                                                <p className="text-white/70 text-sm">Loading preview…</p>
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

                            {/* Clip metadata */}
                            {(selectedClip.quote || selectedClip.reason) && (
                                <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-3 space-y-1.5">
                                    {selectedClip.quote && (
                                        <p className="flex items-start gap-2 text-sm text-[var(--color-text-light)]">
                                            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
                                            <span className="italic">“{selectedClip.quote}”</span>
                                        </p>
                                    )}
                                    {selectedClip.reason && (
                                        <p className="text-xs text-[var(--color-text-muted)] pl-5.5">
                                            Why this clip: {selectedClip.reason}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Clip Actions */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <DownloadClipButton
                                        clipS3Key={selectedClip.s3Key}
                                        clipTitle={selectedClip.title || `${sermon.title}_clip_${Math.floor(selectedClip.startTime)}`}
                                        variant="outline"
                                        size="default"
                                    />
                                    <Button variant="outline" onClick={handleShare} disabled={!getClipUrl(selectedClip.s3Key)}>
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
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
                                <Film className="h-7 w-7 text-[var(--color-text-muted)]" />
                            </div>
                            <p className="text-[var(--color-text-light)] font-medium mb-1">
                                {isProcessingClips ? "Your clips are rendering" : "Select a clip to preview"}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
                                {isProcessingClips
                                    ? "Each clip gets reframed to vertical, captioned, and polished. They appear here the moment they're done."
                                    : "Pick a clip from the list to watch it, download it, or open it in the editor."}
                            </p>
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
