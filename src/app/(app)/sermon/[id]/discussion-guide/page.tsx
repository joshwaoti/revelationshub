"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Printer, Share2 } from "lucide-react";

export default function DiscussionGuidePage() {
    return (
        <div className="min-h-screen bg-[var(--color-scripture-bg)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)] dark:text-[var(--color-text-light)]">
                        Discussion Guide
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Finding Peace in Chaos • December 15, 2024
                    </p>
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

            {/* Paper Canvas */}
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-[var(--color-surface)] rounded-[var(--radius-default)] shadow-lg p-6 sm:p-10 min-h-[600px] relative">
                    {/* Regenerate Button */}
                    <Button
                        variant="default"
                        size="sm"
                        className="absolute top-3 right-3 sm:top-4 sm:right-4"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>

                    {/* Document Content */}
                    <div className="space-y-6 sm:space-y-8 mt-8 sm:mt-0">
                        {/* Title */}
                        <div className="text-center border-b border-[var(--color-success)]/30 pb-6">
                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[var(--color-text-light)] mb-2">
                                Finding Peace in Chaos
                            </h2>
                            <p className="text-gray-600 dark:text-[var(--color-text-muted)]">
                                Small Group Discussion Guide
                            </p>
                        </div>

                        {/* Opening */}
                        <section>
                            <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">
                                    1
                                </span>
                                Opening Prayer
                            </h3>
                            <p className="text-gray-700 dark:text-[var(--color-text-light)] leading-relaxed italic">
                                &quot;Lord, as we gather together, open our hearts and minds to receive
                                Your wisdom. Help us to find peace in Your presence, even when
                                life feels chaotic. Guide our discussion and draw us closer to
                                You. Amen.&quot;
                            </p>
                        </section>

                        {/* Key Scripture */}
                        <section>
                            <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">
                                    2
                                </span>
                                Key Scripture
                            </h3>
                            <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 py-2 bg-[var(--color-primary)]/5 rounded-r">
                                <p className="text-gray-700 dark:text-[var(--color-text-light)] italic">
                                    &quot;Peace I leave with you; my peace I give you. I do not give to
                                    you as the world gives. Do not let your hearts be troubled and
                                    do not be afraid.&quot;
                                </p>
                                <cite className="text-sm text-gray-500 dark:text-[var(--color-text-muted)] mt-2 block">
                                    — John 14:27 (NIV)
                                </cite>
                            </blockquote>
                        </section>

                        {/* Discussion Questions */}
                        <section>
                            <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-4 flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">
                                    3
                                </span>
                                Discussion Questions
                            </h3>
                            <ol className="space-y-3 sm:space-y-4 list-decimal list-inside text-gray-700 dark:text-[var(--color-text-light)]">
                                <li className="leading-relaxed">
                                    <span className="font-medium">Icebreaker:</span> What&apos;s one
                                    thing that has felt &quot;chaotic&quot; in your life recently?
                                </li>
                                <li className="leading-relaxed">
                                    Pastor Michael described peace as &quot;the eye of the storm.&quot;
                                    What does this metaphor mean to you personally?
                                </li>
                                <li className="leading-relaxed">
                                    Read John 14:27 again. How is the peace Jesus offers different
                                    from what the world offers?
                                </li>
                                <li className="leading-relaxed">
                                    What are some practical steps you can take this week to
                                    cultivate inner peace?
                                </li>
                                <li className="leading-relaxed">
                                    How can we support each other in finding peace during
                                    difficult seasons?
                                </li>
                            </ol>
                        </section>

                        {/* Application */}
                        <section>
                            <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">
                                    4
                                </span>
                                Weekly Challenge
                            </h3>
                            <div className="bg-[var(--color-secondary)]/10 p-4 rounded-[var(--radius-default)]">
                                <p className="text-gray-700 dark:text-[var(--color-text-light)] leading-relaxed">
                                    This week, set aside 10 minutes each day for intentional
                                    stillness. Turn off your phone, find a quiet space, and simply
                                    breathe while focusing on God&apos;s presence.
                                </p>
                            </div>
                        </section>

                        {/* Closing */}
                        <section>
                            <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[var(--color-success)] text-white text-sm flex items-center justify-center shrink-0">
                                    5
                                </span>
                                Closing Prayer
                            </h3>
                            <p className="text-gray-700 dark:text-[var(--color-text-light)] leading-relaxed italic">
                                &quot;Father, thank You for the gift of peace that surpasses all
                                understanding. Help us to be peacemakers in
                                our homes, workplaces, and communities. Amen.&quot;
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
