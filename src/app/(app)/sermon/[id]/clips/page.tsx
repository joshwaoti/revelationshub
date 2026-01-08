"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Play,
    Download,
    Share2,
    Edit,
    RefreshCw,
    Loader2,
    Palette,
    Type,
    Move,
    Frame,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";

// Template options
const templates = [
    { id: "default", name: "Default", frame: "none", font: "Inter", position: "bottom" },
    { id: "bold", name: "Bold Impact", frame: "gradient", font: "Montserrat Bold", position: "center" },
    { id: "minimal", name: "Minimal", frame: "blur", font: "Roboto", position: "bottom" },
    { id: "neon", name: "Neon Glow", frame: "neon", font: "Poppins", position: "center" },
    { id: "classic", name: "Classic", frame: "border", font: "Playfair Display", position: "bottom" },
    { id: "modern", name: "Modern Pop", frame: "rounded", font: "Inter Bold", position: "top" },
];

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
    const [selectedTemplate, setSelectedTemplate] = useState("default");
    const [showTemplatePanel, setShowTemplatePanel] = useState(false);

    // Get ready clips
    const readyClips = clips?.filter(c => c.status === "ready") || [];
    const processingClips = clips?.filter(c => c.status === "processing" || c.status === "pending") || [];

    // Selected clip
    const selectedClip = selectedClipId
        ? readyClips.find(c => c._id === selectedClipId)
        : readyClips[0];

    // Loading state
    if (sermon === undefined || clips === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    // Generate S3 URL for clip playback
    const getClipUrl = (s3Key: string) => {
        const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || "josh-video-clipper";
        const region = process.env.NEXT_PUBLIC_S3_REGION || "us-east-1";
        return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    };

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
                        <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Regenerate
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
                            {/* Video Preview */}
                            <div className="flex-1 flex items-center justify-center bg-[var(--color-base)] rounded-[var(--radius-default)] overflow-hidden">
                                <div className="w-full max-w-sm aspect-[9/16] relative bg-black rounded-lg overflow-hidden">
                                    {/* Video element or thumbnail */}
                                    {selectedClip.thumbnailUrl ? (
                                        <img
                                            src={selectedClip.thumbnailUrl}
                                            alt="Clip preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30" />
                                    )}

                                    {/* Template overlay preview */}
                                    {selectedTemplate !== "default" && (
                                        <div className={`absolute inset-0 ${selectedTemplate === "bold" ? "bg-gradient-to-t from-black/80 via-transparent to-transparent" :
                                                selectedTemplate === "minimal" ? "backdrop-blur-sm bg-black/20" :
                                                    selectedTemplate === "neon" ? "border-4 border-[var(--color-primary)]" :
                                                        selectedTemplate === "classic" ? "border-8 border-white/80" :
                                                            "bg-gradient-to-b from-transparent via-transparent to-black/60"
                                            }`} />
                                    )}

                                    {/* Play button overlay */}
                                    <a
                                        href={getClipUrl(selectedClip.s3Key)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <button className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center hover:scale-105 transition-transform">
                                            <Play className="h-7 w-7 text-[var(--color-base)] ml-1" />
                                        </button>
                                    </a>

                                    {/* Caption overlay */}
                                    <div className={`absolute left-4 right-4 text-center ${templates.find(t => t.id === selectedTemplate)?.position === "top" ? "top-16" :
                                            templates.find(t => t.id === selectedTemplate)?.position === "center" ? "top-1/2 -translate-y-1/2" :
                                                "bottom-16"
                                        }`}>
                                        <p className={`text-lg font-bold text-white drop-shadow-lg ${selectedTemplate === "neon" ? "text-[var(--color-primary)]" : ""
                                            }`}>
                                            &quot;{selectedClip.title || "Moment from sermon"}&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Clip Details & Actions */}
                            <div className="mt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mb-1">
                                            {selectedClip.title || `Clip at ${formatTimestamp(selectedClip.startTime)}`}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                                            <span className="font-mono">
                                                {formatDuration(selectedClip.endTime - selectedClip.startTime)}
                                            </span>
                                            <span>
                                                {formatTimestamp(selectedClip.startTime)} - {formatTimestamp(selectedClip.endTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={getClipUrl(selectedClip.s3Key)}
                                        download
                                    >
                                        <Button>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </a>
                                    <Button variant="outline">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowTemplatePanel(!showTemplatePanel)}
                                    >
                                        <Palette className="h-4 w-4 mr-2" />
                                        Templates
                                    </Button>
                                    <Link href={`/sermon/${sermonId}/editor?clip=${selectedClip._id}`}>
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
                            <p>Select a clip to preview</p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Template Editor */}
                {showTemplatePanel && (
                    <div className="w-72 shrink-0 space-y-4 overflow-y-auto bg-[var(--color-surface)] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[var(--color-text-light)]">Template Style</h3>
                            <button
                                onClick={() => setShowTemplatePanel(false)}
                                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]"
                            >
                                ×
                            </button>
                        </div>

                        {/* Template Options */}
                        <div className="space-y-2">
                            <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                <Frame className="h-3 w-3" />
                                Frame Style
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.id)}
                                        className={`p-3 rounded-lg text-sm text-left transition-all ${selectedTemplate === template.id
                                                ? "bg-[var(--color-primary)] text-[var(--color-base)]"
                                                : "bg-[var(--color-base)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10"
                                            }`}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="space-y-2">
                            <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                <Type className="h-3 w-3" />
                                Font Style
                            </label>
                            <select
                                className="w-full h-10 rounded-[var(--radius-default)] bg-[var(--color-base)] px-3 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20"
                                defaultValue="inter"
                            >
                                <option value="inter">Inter</option>
                                <option value="montserrat">Montserrat</option>
                                <option value="roboto">Roboto</option>
                                <option value="poppins">Poppins</option>
                                <option value="playfair">Playfair Display</option>
                            </select>
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                <Move className="h-3 w-3" />
                                Caption Position
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {["top", "center", "bottom"].map((pos) => (
                                    <button
                                        key={pos}
                                        className="p-2 rounded-lg text-xs bg-[var(--color-base)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10 capitalize"
                                    >
                                        {pos}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button className="w-full mt-4">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Apply Template
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
