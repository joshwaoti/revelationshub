"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGenerateContent } from "@/hooks/use-generate-content";
import { MarkdownText } from "@/components/MarkdownText";
import Link from "next/link";
import {
    ChevronLeft,
    Loader2,
    X,
    Save,
    Edit,
    Copy,
    Share2,
    ExternalLink,
    FileText,
    Sparkles,
    RefreshCw,
    FileEdit
} from "lucide-react";

interface BlogData {
    title: string;
    author?: string;
    readTime?: string;
    introduction?: string;
    sections?: Array<{
        heading: string;
        content: string;
        keyScripture?: {
            text: string;
            reference: string;
        };
    }>;
    keyScripture?: {
        text: string;
        reference: string;
    };
    actionSteps?: string[];
    weeklyChallenge?: string;
    conclusion?: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // State
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<BlogData | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only blog post content for this page.
    const blogPostContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "blog_post" } : "skip"
    );

    const blogPost = blogPostContent?.find(c => c.status === "ready");
    const isProcessing = blogPostContent?.some(c => c.status === "processing");

    // Mutations
    const updateContent = useMutation(api.generatedContent.updateContent);
    const publishContent = useMutation(api.generatedContent.publish);

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["blog_post"]);
        }
    };

    // Copy as formatted markdown
    const handleCopy = () => {
        if (!data) return;

        let markdown = `# ${data.title}\n\n`;
        if (data.author) markdown += `*By ${data.author}*`;
        if (data.readTime) markdown += ` • ${data.readTime}`;
        markdown += "\n\n---\n\n";

        if (data.introduction) markdown += `${data.introduction}\n\n`;

        data.sections?.forEach(section => {
            markdown += `## ${section.heading}\n\n`;
            markdown += `${section.content}\n\n`;
            if (section.keyScripture) {
                markdown += `> "${section.keyScripture.text}"\n> — ${section.keyScripture.reference}\n\n`;
            }
        });

        if (data.keyScripture) {
            markdown += `> "${data.keyScripture.text}"\n> — ${data.keyScripture.reference}\n\n`;
        }

        if (data.actionSteps?.length) {
            markdown += `## Action Steps\n\n`;
            data.actionSteps.forEach((step, i) => {
                markdown += `${i + 1}. ${step}\n`;
            });
            markdown += "\n";
        }

        if (data.weeklyChallenge) {
            markdown += `### This Week's Challenge\n\n${data.weeklyChallenge}\n\n`;
        }

        if (data.conclusion) {
            markdown += `---\n\n${data.conclusion}\n`;
        }

        navigator.clipboard.writeText(markdown);
        toast.success("Copied as Markdown!");
    };

    // Publish blog
    const handlePublish = async () => {
        if (!blogPost?._id) return;

        setIsPublishing(true);
        try {
            const slug = await publishContent({ contentId: blogPost._id });
            const publicUrl = `${window.location.origin}/blog/${slug}`;

            await navigator.clipboard.writeText(publicUrl);
            toast.success("Published! URL copied to clipboard.", {
                description: publicUrl,
                duration: 5000,
            });
        } catch (error) {
            console.error("Publish error:", error);
            toast.error("Failed to publish blog post");
        } finally {
            setIsPublishing(false);
        }
    };

    // Start editing
    const handleStartEdit = () => {
        if (data) {
            setEditedData({ ...data });
            setIsEditing(true);
        }
    };

    // Save edits
    const handleSaveEdit = async () => {
        if (!blogPost?._id || !editedData) return;

        try {
            await updateContent({
                contentId: blogPost._id,
                content: JSON.stringify(editedData),
            });
            toast.success("Changes saved!");
            setIsEditing(false);
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save changes");
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedData(null);
    };

    // Parse content - handles JSON that may be wrapped in markdown code blocks
    const parseContent = (content: string): BlogData | null => {
        if (!content) return null;

        let cleanContent = content.trim();

        // Remove markdown code block wrapper if present
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '');
            cleanContent = cleanContent.replace(/\n?```\s*$/, '');
        }

        // Try parsing directly first
        try {
            return JSON.parse(cleanContent);
        } catch {
            // If that fails, try to fix common issues with AI-generated JSON
            try {
                const fixedContent = cleanContent.replace(
                    /"([^"\\]*(\\.[^"\\]*)*)"/g,
                    (match) => {
                        return match
                            .replace(/\n/g, '\\n')
                            .replace(/\r/g, '\\r')
                            .replace(/\t/g, '\\t');
                    }
                );
                return JSON.parse(fixedContent);
            } catch (e) {
                console.error("Parse error after fix attempt:", e);
                return null;
            }
        }
    };

    // Loading state
    if (sermon === undefined || blogPostContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const data = blogPost ? parseContent(blogPost.content) : null;
    const displayData = isEditing ? editedData : data;
    const isPublished = !!blogPost?.slug;

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
                            Blog Post
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {isPublished ? "Published" : "Auto-generated article from your sermon"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            {data && (
                                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!data}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                            <Button
                                size="sm"
                                onClick={handlePublish}
                                disabled={!data || isPublishing}
                            >
                                {isPublishing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : isPublished ? (
                                    <Share2 className="h-4 w-4 mr-2" />
                                ) : (
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                )}
                                {isPublished ? "Share Link" : "Publish"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* No content state */}
            {!blogPost && !isProcessing && (
                <div className="text-center py-16">
                    <FileText className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No Blog Post Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Transform your sermon into an SEO-friendly blog post
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Blog Post"}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating Blog Post...
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        This may take a few moments
                    </p>
                </div>
            )}

            {/* Content */}
            {displayData && (
                <Card className="max-w-3xl mx-auto">
                    <CardContent className="p-6 sm:p-10 relative">
                        {!isEditing && (
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
                        )}

                        <article className="prose prose-invert max-w-none mt-6 sm:mt-0">
                            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-4">
                                <FileEdit className="h-4 w-4" />
                                <span className="text-sm">
                                    {isEditing ? "Editing Mode" : "Generated Blog Post"}
                                </span>
                            </div>

                            {/* Title */}
                            {isEditing ? (
                                <Input
                                    value={editedData?.title || ""}
                                    onChange={(e) => setEditedData(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    className="font-display text-2xl font-bold mb-4"
                                    placeholder="Blog title..."
                                />
                            ) : (
                                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)] mb-4">
                                    {displayData.title}
                                </h2>
                            )}

                            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-8 pb-6 border-b border-[var(--color-border)]">
                                {displayData.author && <span>By {displayData.author}</span>}
                                {displayData.readTime && (
                                    <>
                                        <span>•</span>
                                        <span>{displayData.readTime}</span>
                                    </>
                                )}
                            </div>

                            {/* Introduction */}
                            {isEditing ? (
                                <Textarea
                                    value={editedData?.introduction || ""}
                                    onChange={(e) => setEditedData(prev => prev ? { ...prev, introduction: e.target.value } : null)}
                                    className="mb-6 min-h-[100px]"
                                    placeholder="Introduction..."
                                />
                            ) : displayData.introduction && (
                                <div className="mb-6">
                                    <MarkdownText
                                        text={displayData.introduction}
                                        className="text-[var(--color-text-light)] leading-relaxed mb-4 last:mb-0"
                                    />
                                </div>
                            )}

                            {/* Sections */}
                            {displayData.sections?.map((section, i) => (
                                <div key={i}>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                value={editedData?.sections?.[i]?.heading || ""}
                                                onChange={(e) => {
                                                    const newSections = [...(editedData?.sections || [])];
                                                    newSections[i] = { ...newSections[i], heading: e.target.value };
                                                    setEditedData(prev => prev ? { ...prev, sections: newSections } : null);
                                                }}
                                                className="font-display text-xl font-semibold mt-8 mb-4"
                                                placeholder="Section heading..."
                                            />
                                            <Textarea
                                                value={editedData?.sections?.[i]?.content || ""}
                                                onChange={(e) => {
                                                    const newSections = [...(editedData?.sections || [])];
                                                    newSections[i] = { ...newSections[i], content: e.target.value };
                                                    setEditedData(prev => prev ? { ...prev, sections: newSections } : null);
                                                }}
                                                className="mb-6 min-h-[150px]"
                                                placeholder="Section content..."
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mt-8 mb-4">
                                                {section.heading}
                                            </h3>
                                            <div className="mb-6">
                                                <MarkdownText
                                                    text={section.content}
                                                    className="text-[var(--color-text-light)] leading-relaxed mb-4 last:mb-0"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {section.keyScripture && !isEditing && (
                                        <blockquote className="border-l-4 border-[var(--color-secondary)] pl-4 py-2 my-4 bg-[var(--color-secondary)]/10 rounded-r">
                                            <p className="text-[var(--color-text-light)] italic">
                                                &quot;{section.keyScripture.text}&quot;
                                            </p>
                                            <cite className="text-sm text-[var(--color-text-muted)] mt-2 block">
                                                — {section.keyScripture.reference}
                                            </cite>
                                        </blockquote>
                                    )}
                                </div>
                            ))}

                            {displayData.keyScripture && !isEditing && (
                                <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 py-2 my-6 bg-[var(--color-primary)]/10 rounded-r">
                                    <p className="text-[var(--color-text-light)] italic">
                                        &quot;{displayData.keyScripture.text}&quot;
                                    </p>
                                    <cite className="text-sm text-[var(--color-text-muted)] mt-2 block">
                                        — {displayData.keyScripture.reference}
                                    </cite>
                                </blockquote>
                            )}

                            {displayData.actionSteps && (
                                <ol className="list-decimal list-inside space-y-3 text-[var(--color-text-light)] mb-6">
                                    {displayData.actionSteps.map((step, i) => (
                                        <li key={i} className="leading-relaxed">{step}</li>
                                    ))}
                                </ol>
                            )}

                            {displayData.weeklyChallenge && (
                                <div className="bg-[var(--color-secondary)]/10 p-6 rounded-[var(--radius-default)] my-8 border border-[var(--color-secondary)]/20">
                                    <p className="font-medium text-[var(--color-text-light)] mb-2">
                                        This Week&apos;s Challenge
                                    </p>
                                    {isEditing ? (
                                        <Textarea
                                            value={editedData?.weeklyChallenge || ""}
                                            onChange={(e) => setEditedData(prev => prev ? { ...prev, weeklyChallenge: e.target.value } : null)}
                                            className="min-h-[80px]"
                                        />
                                    ) : (
                                        <MarkdownText
                                            text={displayData.weeklyChallenge}
                                            className="text-[var(--color-text-light)] mb-3 last:mb-0"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Conclusion */}
                            {isEditing ? (
                                <Textarea
                                    value={editedData?.conclusion || ""}
                                    onChange={(e) => setEditedData(prev => prev ? { ...prev, conclusion: e.target.value } : null)}
                                    className="min-h-[100px]"
                                    placeholder="Conclusion..."
                                />
                            ) : displayData.conclusion && (
                                <MarkdownText
                                    text={displayData.conclusion}
                                    className="text-[var(--color-text-light)] leading-relaxed mb-4 last:mb-0"
                                />
                            )}
                        </article>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Generated from sermon: {sermon?.title}
                            </p>
                            {isPublished && blogPost?.slug && (
                                <p className="text-xs text-[var(--color-primary)] mt-2">
                                    Published at: {window.location.origin}/blog/{blogPost.slug}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
