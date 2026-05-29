"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Copy,
    RefreshCw,
    FileText,
    ListOrdered,
    MessageSquare,
    Hash,
    Loader2,
    Sparkles,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useGenerateContent } from "@/hooks/use-generate-content";
import { toast } from "sonner";

export default function SummariesPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only summary content for this page.
    const summaryContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "summary" } : "skip"
    );

    const summary = summaryContent?.find(c => c.status === "ready");
    const isProcessing = summaryContent?.some(c => c.status === "processing");

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["summary"]);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
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
    if (sermon === undefined || summaryContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const data = summary ? parseContent(summary.content) : null;

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
                            Summaries
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Auto-generated summaries in multiple formats
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Regenerate All
                </Button>
            </div>

            {/* No content state */}
            {!summary && !isProcessing && (
                <div className="text-center py-16">
                    <FileText className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No Summaries Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Generate summaries in multiple formats
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Summaries"}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating Summaries...
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        This may take a few moments
                    </p>
                </div>
            )}

            {/* Content */}
            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Paragraph Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                                    Paragraph Summary
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(data.paragraph || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                {data.paragraph}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Bullet Points */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ListOrdered className="h-4 w-4 text-[var(--color-secondary)]" />
                                    Key Points
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(data.bullets?.join("\n") || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {data.bullets?.map((bullet: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-[var(--color-text-light)]">
                                        <span className="text-[var(--color-secondary)] mt-1">•</span>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Social Media Caption */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-[var(--color-success)]" />
                                    Social Caption
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(data.socialCaption || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-[var(--color-surface)] rounded-[var(--radius-default)] p-4">
                                <pre className="text-sm text-[var(--color-text-light)] whitespace-pre-wrap font-sans">
                                    {data.socialCaption}
                                </pre>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                Optimized for Instagram & Facebook
                            </p>
                        </CardContent>
                    </Card>

                    {/* Hashtags */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-[var(--color-primary)]" />
                                    Suggested Hashtags
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(data.hashtags?.join(" ") || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {data.hashtags?.map((tag: string, index: number) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-[var(--color-primary)]/10"
                                        onClick={() => copyToClipboard(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mt-4">
                                Click to copy individual hashtags
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
