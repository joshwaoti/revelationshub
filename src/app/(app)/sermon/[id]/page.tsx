"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Play,
    Sparkles,
    Wand2,
    Clock,
    Calendar,
    User,
    BookOpen,
    Loader2,
    RefreshCw,
    FileText,
    Quote,
    Image,
    MessageSquare,
    Pen,
    BookMarked,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useGenerateContent } from "@/hooks/use-generate-content";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

// Format duration from seconds to MM:SS
function formatDuration(seconds?: number): string {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Format date
function formatDate(timestamp?: number): string {
    if (!timestamp) return "--";
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function SermonDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon data
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch lightweight clip stats and preview rows for the overview.
    const clipCounts = useQuery(
        api.clips.getCountsBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );
    const readyClipPreviews = useQuery(
        api.clips.getReadyPreviewBySermon,
        sermon?._id ? { sermonId: sermon._id, limit: 4 } : "skip"
    );

    // Fetch transcript metadata only; the full transcript is loaded on the transcription page.
    const transcriptSummary = useQuery(
        api.transcripts.getSummaryBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );

    // Fetch generated content counts without returning large content JSON payloads.
    const contentCounts = useQuery(
        api.generatedContent.getCountsBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );

    // Generate content hook - MUST be called before any early returns
    const { isGenerating, generateAll } = useGenerateContent();

    // Loading state
    if (sermon === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    // Not found
    if (sermon === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="h-12 w-12 text-[var(--color-text-muted)] mb-4" />
                <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-2">
                    Sermon Not Found
                </h2>
                <p className="text-[var(--color-text-muted)] mb-4">
                    This sermon may have been deleted or doesn&apos;t exist.
                </p>
                <Link href="/library">
                    <Button>Back to Library</Button>
                </Link>
            </div>
        );
    }

    // Processing status
    const isProcessing = sermon.status === "processing" || sermon.status === "uploading";
    const readyClips = readyClipPreviews || [];

    const handleGenerateAll = () => {
        if (sermon?._id) {
            generateAll(sermon._id);
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                variants={headerVariants}
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text-light)]">
                            {sermon.title}
                        </h1>
                        <Badge
                            variant={
                                sermon.status === "ready"
                                    ? "success"
                                    : sermon.status === "processing"
                                        ? "processing"
                                        : sermon.status === "failed"
                                            ? "destructive"
                                            : "secondary"
                            }
                        >
                            {sermon.status === "ready"
                                ? "Ready"
                                : sermon.status === "processing"
                                    ? "Processing"
                                    : sermon.status === "uploading"
                                        ? "Uploading"
                                        : "Failed"}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
                        {sermon.speaker && (
                            <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {sermon.speaker}
                            </span>
                        )}
                        {sermon.series && (
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                {sermon.series}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(sermon.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(sermon.duration)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {sermon.youtubeUrl && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline">
                                    <Play className="h-4 w-4 mr-2" />
                                    Watch on YouTube
                                </Button>
                            </a>
                        </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="secondary"
                            disabled={isProcessing || isGenerating}
                            onClick={handleGenerateAll}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate All Content
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Processing Status Banner */}
            {isProcessing && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-4"
                >
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                        <div>
                            <p className="font-medium text-[var(--color-text-light)]">
                                Your sermon is being processed
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                This may take a few minutes. Clips and content will appear automatically when ready.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player - Large */}
                <motion.div className="lg:col-span-2 lg:row-span-2" variants={itemVariants}>
                    <Card className="overflow-hidden h-full">
                        <div className="relative aspect-video bg-[var(--color-base)]">
                            {sermon.thumbnailUrl ? (
                                <img
                                    src={sermon.thumbnailUrl}
                                    alt={sermon.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <motion.button
                                    className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Play className="h-7 w-7 text-[var(--color-base)] ml-1" />
                                </motion.button>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-sm text-white font-mono">
                                {formatDuration(sermon.duration)}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Processing Stats */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
                                </motion.div>
                                Content Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                    <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                        <Wand2 className="h-4 w-4" />
                                        Clips Generated
                                    </span>
                                    <span className="text-sm font-medium text-[var(--color-text-light)]">
                                        {clipCounts?.ready || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                    <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                        <Quote className="h-4 w-4" />
                                        Quotes
                                    </span>
                                    <span className="text-sm font-medium text-[var(--color-text-light)]">
                                        {contentCounts?.quote || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                                    <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Has Transcript
                                    </span>
                                    <span className="text-sm font-medium text-[var(--color-text-light)]">
                                        {transcriptSummary?.exists ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Content Status */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Content Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[
                                    { name: "Carousel", count: contentCounts?.carousel || 0, icon: Image },
                                    { name: "Discussion Guide", count: contentCounts?.discussion_guide || 0, icon: MessageSquare },
                                    { name: "Devotional", count: contentCounts?.devotional || 0, icon: BookMarked },
                                    { name: "Blog Post", count: contentCounts?.blog_post || 0, icon: Pen },
                                    { name: "Outline", count: contentCounts?.sermon_outline || 0, icon: FileText },
                                ].map((item) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                                    >
                                        <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </span>
                                        {item.count > 0 ? (
                                            <Badge variant="success">Ready</Badge>
                                        ) : isProcessing ? (
                                            <Badge variant="processing">Generating</Badge>
                                        ) : (
                                            <Badge variant="secondary">Available</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Clips */}
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-[var(--color-primary)]" />
                                    Clips ({clipCounts?.ready || 0})
                                </CardTitle>
                                <Link
                                    href={`/sermon/${sermon._id}/clips`}
                                    className="text-sm text-[var(--color-primary)] hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {readyClips.length === 0 ? (
                                <div className="text-center py-8 text-[var(--color-text-muted)]">
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <p>Generating clips...</p>
                                        </div>
                                    ) : (
                                        <p>No clips generated yet</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {readyClips.slice(0, 4).map((clip, index) => (
                                        <motion.div
                                            key={clip._id}
                                            className="group cursor-pointer"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 + index * 0.1 }}
                                            whileHover={{ y: -4 }}
                                        >
                                            <Link href={`/sermon/${sermon._id}/clips`}>
                                                <div className="relative aspect-[9/16] bg-[var(--color-base)] rounded-[var(--radius-default)] overflow-hidden mb-2 group-hover:ring-2 ring-[var(--color-primary)]/30 transition-all">
                                                    {clip.thumbnailUrl ? (
                                                        <img
                                                            src={clip.thumbnailUrl}
                                                            alt={clip.title || "Clip"}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30" />
                                                    )}
                                                    <motion.div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                        <motion.div
                                                            className="h-10 w-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <Play className="h-4 w-4 text-[var(--color-base)] ml-0.5" />
                                                        </motion.div>
                                                    </motion.div>
                                                    <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                                                        {formatDuration(clip.endTime - clip.startTime)}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-[var(--color-text-light)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                                                    {clip.title || `Clip ${index + 1}`}
                                                </p>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href={`/sermon/${sermon._id}/clips`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Wand2 className="h-4 w-4 mr-2 text-[var(--color-primary)]" />
                                            View Clips
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href={`/sermon/${sermon._id}/quotes`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Quote className="h-4 w-4 mr-2 text-[var(--color-secondary)]" />
                                            View Quotes
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href={`/sermon/${sermon._id}/discussion-guide`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <BookOpen className="h-4 w-4 mr-2 text-[var(--color-success)]" />
                                            Discussion Guide
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href={`/sermon/${sermon._id}/transcription`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <FileText className="h-4 w-4 mr-2 text-[var(--color-text-muted)]" />
                                            View Transcript
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
