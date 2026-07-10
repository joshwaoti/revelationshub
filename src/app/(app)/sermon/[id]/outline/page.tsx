"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Copy, FileText, Clock, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useGenerateContent } from "@/hooks/use-generate-content";
import { toast } from "sonner";
import { openPrintWindow, PrintSection } from "@/lib/print-export";

type OutlineSection = {
    timeRange?: string;
    title?: string;
    points?: string[];
    keyScripture?: string;
};

type OutlineContent = {
    title?: string;
    speaker?: string;
    sections?: OutlineSection[];
};

export default function SermonOutlinePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only outline content for this page.
    const outlineContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "sermon_outline" } : "skip"
    );

    const outline = outlineContent?.find(c => c.status === "ready");
    const isProcessing = outlineContent?.some(c => c.status === "processing");

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["outline"]);
        }
    };

    const handleCopy = () => {
        const text = outlineAsText();
        if (text) {
            navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        }
    };

    // Parse content
    const parseContent = (content: string): OutlineContent | null => {
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    };

    // Loading state
    if (sermon === undefined || outlineContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const data = outline ? parseContent(outline.content) : null;

    // Podcasts get chapter language; sermons keep outline language
    const isPodcast = sermon?.videoType === "podcast";
    const outlineName = isPodcast ? "Episode Chapters" : "Sermon Outline";

    // Formatted plain-text version (used by Copy - raw JSON is useless to paste)
    const outlineAsText = (): string => {
        if (!data) return "";
        const lines: string[] = [data.title || sermon?.title || outlineName];
        if (data.speaker) lines.push(data.speaker);
        lines.push("");
        for (const section of data.sections || []) {
            lines.push(`${section.timeRange ? `[${section.timeRange}] ` : ""}${section.title || ""}`.trim());
            for (const point of section.points || []) {
                lines.push(`  • ${point}`);
            }
            if (section.keyScripture) {
                lines.push(`  ${isPodcast ? "Key quote" : "Key scripture"}: ${section.keyScripture}`);
            }
            lines.push("");
        }
        return lines.join("\n").trim();
    };

    const handleExport = () => {
        if (!data) return;
        const sections: PrintSection[] = (data.sections || []).map((section) => ({
            heading: `${section.timeRange ? `${section.timeRange} · ` : ""}${section.title || ""}`.trim(),
            list: [
                ...(section.points || []),
                ...(section.keyScripture
                    ? [`${isPodcast ? "Key quote" : "Key scripture"}: ${section.keyScripture}`]
                    : []),
            ],
        }));
        const opened = openPrintWindow({
            title: data.title || sermon?.title || outlineName,
            subtitle: `${outlineName}${data.speaker ? ` · ${data.speaker}` : ""}`,
            sections,
        });
        if (!opened) {
            toast.error("Popup blocked", { description: "Allow popups for this site to export." });
        } else {
            toast.info("Choose “Save as PDF” in the print dialog", { duration: 5000 });
        }
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
                            {outlineName}
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {sermon?.title}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!data}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* No content state */}
            {!outline && !isProcessing && (
                <div className="text-center py-16">
                    <FileText className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No Outline Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Generate {isPodcast ? "timestamped chapters from your episode" : "a structured outline from your sermon"}
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Outline"}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating Outline...
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        This may take a few moments
                    </p>
                </div>
            )}

            {/* Content */}
            {data && (
                <Card className="max-w-3xl mx-auto">
                    <CardContent className="p-6 sm:p-10 relative">
                        <Button
                            variant="default"
                            size="sm"
                            className="absolute top-3 right-3 sm:top-4 sm:right-4"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Regenerate
                        </Button>

                        {/* Title */}
                        <div className="border-b border-[var(--color-border)] pb-6 mb-6 mt-6 sm:mt-0">
                            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{outlineName}</span>
                            </div>
                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)]">
                                {data.title || sermon?.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--color-text-muted)]">
                                {data.speaker && <span>{data.speaker}</span>}
                                {sermon?.duration && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {Math.floor(sermon.duration / 60)}:{(sermon.duration % 60).toString().padStart(2, '0')}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Outline Sections */}
                        <div className="space-y-6">
                            {data.sections?.map((section, index) => (
                                <div key={index} className="group">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-3">
                                        {section.timeRange && (
                                            <Badge variant="outline" className="w-fit font-mono text-xs">
                                                {section.timeRange}
                                            </Badge>
                                        )}
                                        <h3 className="font-display text-lg font-semibold text-[var(--color-text-light)]">
                                            {section.title}
                                        </h3>
                                    </div>

                                    <div className="ml-0 sm:ml-[100px]">
                                        {section.points && (
                                            <ul className="space-y-2 mb-3">
                                                {section.points.map((point: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-light)]">
                                                        <span className="text-[var(--color-secondary)] mt-1">•</span>
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {section.keyScripture && (
                                            <p className="text-sm text-[var(--color-text-muted)] italic border-l-2 border-[var(--color-secondary)] pl-3">
                                                {isPodcast ? "Key Quote" : "Key Scripture"}: {section.keyScripture}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
                                <span>Generated by RevelationsHub</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
