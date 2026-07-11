"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { MarkdownText, renderInlineMarkdown } from "@/components/MarkdownText";

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

export default function PublicBlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const content = useQuery(api.generatedContent.getBySlug, { slug });

    // Parse content
    const parseContent = (contentStr: string): BlogData | null => {
        if (!contentStr) return null;

        let cleanContent = contentStr.trim();

        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '');
            cleanContent = cleanContent.replace(/\n?```\s*$/, '');
        }

        try {
            return JSON.parse(cleanContent);
        } catch {
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
            } catch {
                return null;
            }
        }
    };

    // Loading state
    if (content === undefined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#231238] via-[#301a4b] to-[#231238] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#6db1bf]" />
            </div>
        );
    }

    // Not found
    if (content === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#231238] via-[#301a4b] to-[#231238] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-bold text-[#ffeaec] mb-4">Blog Post Not Found</h1>
                <p className="text-[#548a94] mb-6">This blog post may have been removed or the link is incorrect.</p>
                <Link href="/" className="text-[#6db1bf] hover:underline">
                    ← Back to Home
                </Link>
            </div>
        );
    }

    const data = parseContent(content.content);

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#231238] via-[#301a4b] to-[#231238] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-bold text-[#ffeaec] mb-4">Error Loading Blog</h1>
                <p className="text-[#548a94]">Something went wrong while loading this blog post.</p>
            </div>
        );
    }

    const publishedDate = content.publishedAt
        ? new Date(content.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#231238] via-[#301a4b] to-[#231238]">
            {/* Header */}
            <header className="border-b border-[#6db1bf]/20 bg-[#231238]/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-[#6db1bf] font-bold text-xl">
                        RevelationsHub
                    </Link>
                    <span className="text-[#548a94] text-sm">Blog</span>
                </div>
            </header>

            {/* Article */}
            <main className="max-w-3xl mx-auto px-4 py-12">
                <article>
                    {/* Title */}
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#ffeaec] mb-6 leading-tight">
                        {data.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#548a94] mb-10 pb-8 border-b border-[#6db1bf]/20">
                        {data.author && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{data.author}</span>
                            </div>
                        )}
                        {publishedDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{publishedDate}</span>
                            </div>
                        )}
                        {data.readTime && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{data.readTime}</span>
                            </div>
                        )}
                    </div>

                    {/* Introduction */}
                    {data.introduction && (
                        <div className="mb-10">
                            <MarkdownText
                                text={data.introduction}
                                className="text-lg text-[#ffeaec]/90 leading-relaxed mb-4 last:mb-0"
                            />
                        </div>
                    )}

                    {/* Sections */}
                    {data.sections?.map((section, i) => (
                        <section key={i} className="mb-12">
                            <h2 className="font-display text-2xl font-semibold text-[#6db1bf] mb-4">
                                {section.heading}
                            </h2>
                            <div className="mb-6">
                                <MarkdownText
                                    text={section.content}
                                    className="text-[#ffeaec]/85 leading-relaxed mb-4 last:mb-0"
                                />
                            </div>
                            {section.keyScripture && (
                                <blockquote className="border-l-4 border-[#d8315b] pl-6 py-3 my-6 bg-[#d8315b]/10 rounded-r-lg">
                                    <p className="text-[#ffeaec] italic text-lg">
                                        &quot;{section.keyScripture.text}&quot;
                                    </p>
                                    <cite className="text-sm text-[#548a94] mt-3 block not-italic">
                                        — {section.keyScripture.reference}
                                    </cite>
                                </blockquote>
                            )}
                        </section>
                    ))}

                    {/* Key Scripture */}
                    {data.keyScripture && (
                        <blockquote className="border-l-4 border-[#6db1bf] pl-6 py-4 my-10 bg-[#6db1bf]/10 rounded-r-lg">
                            <p className="text-[#ffeaec] italic text-xl">
                                &quot;{data.keyScripture.text}&quot;
                            </p>
                            <cite className="text-sm text-[#548a94] mt-3 block not-italic">
                                — {data.keyScripture.reference}
                            </cite>
                        </blockquote>
                    )}

                    {/* Action Steps */}
                    {data.actionSteps && data.actionSteps.length > 0 && (
                        <section className="my-10">
                            <h2 className="font-display text-2xl font-semibold text-[#6db1bf] mb-6">
                                Action Steps
                            </h2>
                            <ol className="list-decimal list-outside pl-7 space-y-4 text-[#ffeaec]/85">
                                {data.actionSteps.map((step, i) => (
                                    <li key={i} className="leading-relaxed pl-1">
                                        {renderInlineMarkdown(step, `step-${i}`)}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {/* Weekly Challenge */}
                    {data.weeklyChallenge && (
                        <div className="bg-gradient-to-r from-[#6db1bf]/20 to-[#d8315b]/20 p-8 rounded-2xl my-10 border border-[#6db1bf]/30">
                            <h3 className="font-display text-xl font-semibold text-[#ffeaec] mb-3">
                                🎯 This Week&apos;s Challenge
                            </h3>
                            <MarkdownText
                                text={data.weeklyChallenge}
                                className="text-[#ffeaec]/90 leading-relaxed mb-3 last:mb-0"
                            />
                        </div>
                    )}

                    {/* Conclusion */}
                    {data.conclusion && (
                        <section className="mt-12 pt-8 border-t border-[#6db1bf]/20">
                            <MarkdownText
                                text={data.conclusion}
                                className="text-lg text-[#ffeaec]/90 leading-relaxed mb-4 last:mb-0"
                            />
                        </section>
                    )}
                </article>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-[#6db1bf]/20 text-center">
                    <p className="text-[#548a94] text-sm">
                        Published on{" "}
                        <Link href="/" className="text-[#6db1bf] hover:underline">
                            RevelationsHub
                        </Link>
                    </p>
                    <p className="text-[#548a94]/60 text-xs mt-2">
                        Your Sunday Message. Monday&apos;s Movement.
                    </p>
                </footer>
            </main>
        </div>
    );
}
