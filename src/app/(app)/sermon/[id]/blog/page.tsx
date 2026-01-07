"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Copy, FileEdit, ExternalLink } from "lucide-react";

export default function BlogPostPage() {
    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Blog Post
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Auto-generated article from your sermon
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                    <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Publish
                    </Button>
                </div>
            </div>

            {/* Content Card */}
            <Card className="max-w-3xl mx-auto">
                <CardContent className="p-6 sm:p-10 relative">
                    <Button variant="default" size="sm" className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>

                    {/* Article */}
                    <article className="prose prose-invert max-w-none mt-6 sm:mt-0">
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-4">
                            <FileEdit className="h-4 w-4" />
                            <span className="text-sm">Generated Blog Post</span>
                        </div>

                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)] mb-4">
                            Finding Peace in Chaos: A Guide to Inner Stillness
                        </h2>

                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-8 pb-6 border-b border-[var(--color-border)]">
                            <span>By Pastor Michael</span>
                            <span>•</span>
                            <span>December 15, 2024</span>
                            <span>•</span>
                            <span>5 min read</span>
                        </div>

                        <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
                            In a world that never seems to slow down, finding peace can feel like chasing after the wind.
                            Our calendars are packed, our phones are constantly buzzing, and our minds race from one worry
                            to the next. But what if I told you that peace isn&apos;t found in the absence of chaos—but in
                            the midst of it?
                        </p>

                        <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mt-8 mb-4">
                            The Myth of the Perfect Moment
                        </h3>
                        <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
                            Many of us live with an unspoken belief: &quot;I&apos;ll find peace when things calm down.&quot;
                            When the project is done. When the kids are older. When we have more money. But here&apos;s
                            the hard truth: life doesn&apos;t calm down. It just keeps moving. And if we&apos;re waiting
                            for the perfect moment of stillness to find peace, we&apos;ll be waiting forever.
                        </p>

                        <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 py-2 my-6 bg-[var(--color-primary)]/10 rounded-r">
                            <p className="text-[var(--color-text-light)] italic">
                                &quot;Peace I leave with you; my peace I give you. I do not give to you as the world gives.
                                Do not let your hearts be troubled and do not be afraid.&quot;
                            </p>
                            <cite className="text-sm text-[var(--color-text-muted)] mt-2 block">— John 14:27</cite>
                        </blockquote>

                        <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mt-8 mb-4">
                            A Different Kind of Peace
                        </h3>
                        <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
                            Jesus offers us something radically different. His peace isn&apos;t dependent on circumstances—it
                            transcends them. It&apos;s the kind of peace that can exist in the eye of a storm, anchored not
                            in what we see around us, but in Who we know is with us.
                        </p>

                        <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mt-8 mb-4">
                            Three Steps to Finding Peace Today
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 text-[var(--color-text-light)] mb-6">
                            <li className="leading-relaxed">
                                <strong>Acknowledge the storm.</strong> Don&apos;t pretend everything is fine. Name what&apos;s
                                causing chaos in your life.
                            </li>
                            <li className="leading-relaxed">
                                <strong>Anchor in faith.</strong> Ground yourself in God&apos;s promises. Remember who He is
                                and what He has done.
                            </li>
                            <li className="leading-relaxed">
                                <strong>Act with intention.</strong> Peace is a choice we make daily. Create space for stillness.
                            </li>
                        </ol>

                        <div className="bg-[var(--color-secondary)]/10 p-6 rounded-[var(--radius-default)] my-8 border border-[var(--color-secondary)]/20">
                            <p className="font-medium text-[var(--color-text-light)] mb-2">
                                This Week&apos;s Challenge
                            </p>
                            <p className="text-[var(--color-text-light)]">
                                Set aside 10 minutes each day for intentional stillness. Turn off your phone, find a quiet
                                space, and simply breathe while focusing on God&apos;s presence.
                            </p>
                        </div>
                    </article>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                        <p className="text-sm text-[var(--color-text-muted)]">
                            This article was generated from a sermon by Pastor Michael at Grace Community Church.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
