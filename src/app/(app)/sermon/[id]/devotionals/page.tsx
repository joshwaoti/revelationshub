"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Share2, Calendar, Heart } from "lucide-react";

const devotionalDays = [
    { day: "Monday", title: "Finding Stillness", scripture: "Psalm 46:10" },
    { day: "Tuesday", title: "Trusting the Process", scripture: "Proverbs 3:5-6" },
    { day: "Wednesday", title: "Peace in Prayer", scripture: "Philippians 4:6-7" },
    { day: "Thursday", title: "Surrender & Freedom", scripture: "Matthew 11:28-30" },
    { day: "Friday", title: "Walking by Faith", scripture: "2 Corinthians 5:7" },
];

export default function DevotionalsPage() {
    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Weekly Devotional
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Based on &quot;Finding Peace in Chaos&quot;
                    </p>
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

            {/* Content Card */}
            <Card className="max-w-3xl mx-auto">
                <CardContent className="p-6 sm:p-10 relative">
                    <Button variant="default" size="sm" className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>

                    {/* Title */}
                    <div className="text-center border-b border-[var(--color-border)] pb-6 mb-8 mt-6 sm:mt-0">
                        <div className="inline-flex items-center gap-2 text-[var(--color-secondary)] mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">5-Day Devotional</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)]">
                            Finding Peace in Chaos
                        </h2>
                        <p className="text-[var(--color-text-muted)] mt-2">
                            A journey through stillness, trust, and surrender
                        </p>
                    </div>

                    {/* Devotional Days */}
                    <div className="space-y-6">
                        {devotionalDays.map((day, index) => (
                            <div key={day.day} className="group">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        {index < devotionalDays.length - 1 && (
                                            <div className="w-0.5 h-full min-h-[60px] bg-[var(--color-primary)]/20 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                                            <span className="text-sm font-medium text-[var(--color-primary)]">
                                                {day.day}
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
                                                Today, we focus on {day.title.toLowerCase()}. Take 10 minutes to read {day.scripture}
                                                and reflect on how this applies to your current circumstances.
                                                What is God speaking to you through this passage?
                                            </p>
                                            <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                                                <p className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    Prayer Focus
                                                </p>
                                                <p className="text-sm text-[var(--color-text-light)] mt-1 italic">
                                                    &quot;Lord, help me to embrace {day.title.toLowerCase()} in my daily walk with You...&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Created with RevelationsHub • Grace Community Church
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
