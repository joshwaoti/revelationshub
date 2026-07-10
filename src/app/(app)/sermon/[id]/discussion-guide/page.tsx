"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Printer, Share2, Loader2, MessageSquare, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useGenerateContent } from "@/hooks/use-generate-content";

export default function DiscussionGuidePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only discussion guide content for this page.
    const discussionGuideContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "discussion_guide" } : "skip"
    );

    const discussionGuide = discussionGuideContent?.find(c => c.status === "ready");
    const isProcessing = discussionGuideContent?.some(c => c.status === "processing");

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["discussion_guide"]);
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
    if (sermon === undefined || discussionGuideContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const guide = discussionGuide ? parseContent(discussionGuide.content) : null;

    // Podcast episodes get listener-guide language; sermons keep ministry language
    const isPodcast = sermon?.videoType === "podcast";
    const labels = isPodcast
        ? {
            pageTitle: "Listener Guide",
            subtitle: "Listener Discussion Guide",
            opening: "Opening Thought",
            key: "Key Quote",
            closing: "Closing Thought",
            emptyBody: "Generate a discussion guide from your episode transcript",
            generateCta: "Generate Listener Guide",
        }
        : {
            pageTitle: "Discussion Guide",
            subtitle: "Small Group Discussion Guide",
            opening: "Opening Prayer",
            key: "Key Scripture",
            closing: "Closing Prayer",
            emptyBody: "Generate a discussion guide from your sermon transcript",
            generateCta: "Generate Discussion Guide",
        };

    return (
        <div className="min-h-screen bg-[var(--color-scripture-bg)]">
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
                            {labels.pageTitle}
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {sermon?.title}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
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
            {!discussionGuide && !isProcessing && (
                <div className="text-center py-16">
                    <MessageSquare className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No {labels.pageTitle} Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        {labels.emptyBody}
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : labels.generateCta}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating Discussion Guide...
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        This may take a few moments
                    </p>
                </div>
            )}

            {/* Content */}
            {guide && (
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-[var(--color-surface)] rounded-[var(--radius-default)] shadow-lg p-6 sm:p-10 min-h-[600px] relative">
                        {/* Regenerate Button */}
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

                        <div className="space-y-6 sm:space-y-8 mt-8 sm:mt-0">
                            {/* Title */}
                            <div className="text-center border-b border-[var(--color-success)]/30 pb-6">
                                <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[var(--color-text-light)] mb-2">
                                    {guide.title || sermon?.title}
                                </h2>
                                <p className="text-gray-600 dark:text-[var(--color-text-muted)]">
                                    {labels.subtitle}
                                </p>
                            </div>

                            {/* Opening Prayer */}
                            {guide.openingPrayer && (
                                <section>
                                    <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">1</span>
                                        {labels.opening}
                                    </h3>
                                    <p className="text-gray-700 dark:text-[var(--color-text-light)] leading-relaxed italic">
                                        &quot;{guide.openingPrayer}&quot;
                                    </p>
                                </section>
                            )}

                            {/* Key Scripture */}
                            {guide.keyScripture && (
                                <section>
                                    <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">2</span>
                                        {labels.key}
                                    </h3>
                                    <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 py-2 bg-[var(--color-primary)]/5 rounded-r">
                                        <p className="text-gray-700 dark:text-[var(--color-text-light)] italic">
                                            &quot;{guide.keyScripture.text}&quot;
                                        </p>
                                        <cite className="text-sm text-gray-500 dark:text-[var(--color-text-muted)] mt-2 block">
                                            — {guide.keyScripture.reference}
                                        </cite>
                                    </blockquote>
                                </section>
                            )}

                            {/* Discussion Questions */}
                            {guide.discussionQuestions && (
                                <section>
                                    <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-4 flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">3</span>
                                        Discussion Questions
                                    </h3>
                                    <ol className="space-y-3 sm:space-y-4 list-decimal list-inside text-gray-700 dark:text-[var(--color-text-light)]">
                                        {guide.icebreaker && (
                                            <li className="leading-relaxed">
                                                <span className="font-medium">Icebreaker:</span> {guide.icebreaker}
                                            </li>
                                        )}
                                        {guide.discussionQuestions.map((q: string, i: number) => (
                                            <li key={i} className="leading-relaxed">{q}</li>
                                        ))}
                                    </ol>
                                </section>
                            )}

                            {/* Weekly Challenge */}
                            {guide.weeklyChallenge && (
                                <section>
                                    <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">4</span>
                                        Weekly Challenge
                                    </h3>
                                    <div className="bg-[var(--color-secondary)]/10 p-4 rounded-[var(--radius-default)]">
                                        <p className="text-gray-700 dark:text-[var(--color-text-light)] leading-relaxed">
                                            {guide.weeklyChallenge}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* Closing Prayer */}
                            {guide.closingPrayer && (
                                <section>
                                    <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">5</span>
                                        {labels.closing}
                                    </h3>
                                    <p className="text-gray-700 dark:text-[var(--color-text-light)] leading-relaxed italic">
                                        &quot;{guide.closingPrayer}&quot;
                                    </p>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
