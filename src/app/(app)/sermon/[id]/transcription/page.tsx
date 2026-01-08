"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Copy,
    Search,
    Edit3,
    Check,
    Clock,
    ChevronLeft,
    Loader2,
    FileText,
} from "lucide-react";
import Link from "next/link";

// Format timestamp from seconds
function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Format duration
function formatDuration(seconds?: number): string {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TranscriptionPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch transcript
    const transcript = useQuery(
        api.transcripts.getBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    // Loading state
    if (sermon === undefined || transcript === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    // Group segments into paragraphs (every 10-15 words or on pause)
    const groupSegmentsIntoParagraphs = () => {
        if (!transcript?.segments) return [];

        const paragraphs: Array<{
            start: number;
            end: number;
            text: string;
            words: typeof transcript.segments;
        }> = [];

        let currentParagraph: typeof transcript.segments = [];
        let paragraphStart = 0;

        transcript.segments.forEach((segment, index) => {
            if (currentParagraph.length === 0) {
                paragraphStart = segment.start;
            }
            currentParagraph.push(segment);

            // Create new paragraph every ~20 words or on significant pause
            const nextSegment = transcript.segments[index + 1];
            const hasLongPause = nextSegment && (nextSegment.start - segment.end) > 1;
            const hasEnoughWords = currentParagraph.length >= 20;

            if (hasLongPause || hasEnoughWords || index === transcript.segments.length - 1) {
                paragraphs.push({
                    start: paragraphStart,
                    end: segment.end,
                    text: currentParagraph.map(s => s.word).join(" "),
                    words: [...currentParagraph],
                });
                currentParagraph = [];
            }
        });

        return paragraphs;
    };

    const paragraphs = groupSegmentsIntoParagraphs();

    // Filter paragraphs based on search
    const filteredParagraphs = paragraphs.filter(p =>
        p.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Copy all text
    const handleCopyAll = () => {
        const fullText = transcript?.fullText || paragraphs.map(p => p.text).join("\n\n");
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Export as text file
    const handleExport = () => {
        const fullText = transcript?.fullText || paragraphs.map(p => p.text).join("\n\n");
        const blob = new Blob([fullText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sermon?.title || "transcript"}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link href={`/sermon/${sermonId}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                            Transcription
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {sermon?.title} • {formatDuration(sermon?.duration)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyAll}>
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy All
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* No transcript state */}
            {!transcript && (
                <div className="text-center py-16">
                    <FileText className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No Transcript Available
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        {sermon?.status === "processing"
                            ? "Transcript is being generated..."
                            : "Transcript has not been generated yet."}
                    </p>
                </div>
            )}

            {transcript && (
                <>
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search transcript..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-default)] bg-[var(--color-surface)] text-[var(--color-text-light)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                    </div>

                    {/* Word count info */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-[var(--color-text-muted)]">
                        <span>{transcript.segments.length} words</span>
                        <span>{paragraphs.length} paragraphs</span>
                    </div>

                    {/* Transcript */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                {filteredParagraphs.map((paragraph, index) => (
                                    <div
                                        key={index}
                                        className="group p-3 sm:p-4 rounded-[var(--radius-default)] hover:bg-[var(--color-primary)]/5 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button className="text-xs font-mono text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded hover:bg-[var(--color-primary)]/20 transition-colors">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {formatTimestamp(paragraph.start)}
                                                </button>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {editingIndex === index ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            defaultValue={paragraph.text}
                                                            className="w-full h-24 p-3 rounded-[var(--radius-default)] bg-[var(--color-surface)] text-[var(--color-text-light)] border border-[var(--color-primary)] focus:outline-none resize-none text-sm"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => setEditingIndex(null)}>
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Save
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setEditingIndex(null)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                                        {searchQuery ? (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: paragraph.text.replace(
                                                                        new RegExp(`(${searchQuery})`, "gi"),
                                                                        '<mark class="bg-[var(--color-secondary)]/30 px-0.5 rounded">$1</mark>'
                                                                    ),
                                                                }}
                                                            />
                                                        ) : (
                                                            paragraph.text
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            {editingIndex !== index && (
                                                <button
                                                    onClick={() => setEditingIndex(index)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all shrink-0"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
