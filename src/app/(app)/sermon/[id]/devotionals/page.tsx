"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Share2, Calendar, Heart, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useGenerateContent } from "@/hooks/use-generate-content";

export default function DevotionalsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch generated content
    const generatedContent = useQuery(
        api.generatedContent.getBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );

    const devotional = generatedContent?.find(c => c.type === "devotional" && c.status === "ready");
    const isProcessing = generatedContent?.some(c => c.type === "devotional" && c.status === "processing");

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["devotional"]);
        }
    };

    // Parse content
    const parseContent = (content: string) => {
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    };

    // Loading state
    if (sermon === undefined || generatedContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const data = devotional ? parseContent(devotional.content) : null;

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
                            Weekly Devotional
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Based on &quot;{sermon?.title}&quot;
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* No content state */}
            {!devotional && !isProcessing && (
                <div className="text-center py-16">
                    <Calendar className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No Devotional Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Generate a 5-day devotional from your sermon
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Devotional"}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating Devotional...
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
                        <div className="text-center border-b border-[var(--color-border)] pb-6 mb-8 mt-6 sm:mt-0">
                            <div className="inline-flex items-center gap-2 text-[var(--color-secondary)] mb-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">5-Day Devotional</span>
                            </div>
                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)]">
                                {data.title || sermon?.title}
                            </h2>
                            {data.subtitle && (
                                <p className="text-[var(--color-text-muted)] mt-2">
                                    {data.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Devotional Days */}
                        <div className="space-y-6">
                            {data.days?.map((day: any, index: number) => (
                                <div key={index} className="group">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                                {day.day || index + 1}
                                            </div>
                                            {index < (data.days?.length || 0) - 1 && (
                                                <div className="w-0.5 h-full min-h-[60px] bg-[var(--color-primary)]/20 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                                                <span className="text-sm font-medium text-[var(--color-primary)]">
                                                    {day.dayName}
                                                </span>
                                                <h3 className="font-display text-lg font-semibold text-[var(--color-text-light)]">
                                                    {day.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                                Scripture: {day.scripture}
                                            </p>
                                            <div className="bg-[var(--color-surface)] rounded-[var(--radius-default)] p-4 border border-[var(--color-border)]">
                                                <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                                    {day.reflection}
                                                </p>
                                                {day.prayerFocus && (
                                                    <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                                                        <p className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                                                            <Heart className="h-3 w-3" />
                                                            Prayer Focus
                                                        </p>
                                                        <p className="text-sm text-[var(--color-text-light)] mt-1 italic">
                                                            &quot;{day.prayerFocus}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Created with RevelationsHub
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
