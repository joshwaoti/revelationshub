"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Copy, FileText, Clock } from "lucide-react";

const outlineSections = [
    {
        time: "0:00 - 5:00",
        title: "Introduction",
        points: [
            "Welcome and opening prayer",
            "Series context: 'Inner Strength'",
            "Today's theme: Finding peace in chaos",
        ],
    },
    {
        time: "5:00 - 15:00",
        title: "The Problem: Chaos Everywhere",
        points: [
            "Modern life is filled with constant noise and distraction",
            "We often mistake busyness for purpose",
            "The world's definition of peace: absence of problems",
        ],
        scripture: "John 16:33",
    },
    {
        time: "15:00 - 28:00",
        title: "God's Definition of Peace",
        points: [
            "Peace is not the absence of chaos, but the presence of God",
            "Jesus promised a different kind of peace (John 14:27)",
            "Illustration: The eye of the storm",
        ],
        scripture: "John 14:27",
    },
    {
        time: "28:00 - 38:00",
        title: "Three Steps to Finding Peace",
        points: [
            "1. Acknowledge the storm - Don't deny your circumstances",
            "2. Anchor in faith - Ground yourself in God's promises",
            "3. Act with intention - Choose peace as a daily practice",
        ],
        scripture: "Philippians 4:6-7",
    },
    {
        time: "38:00 - 42:00",
        title: "Application & Closing",
        points: [
            "Weekly challenge: 10 minutes of intentional stillness daily",
            "Small group discussion this week",
            "Closing prayer",
        ],
    },
];

export default function SermonOutlinePage() {
    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Sermon Outline
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Finding Peace in Chaos • 42:15
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
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
                    <div className="border-b border-[var(--color-border)] pb-6 mb-6 mt-6 sm:mt-0">
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Sermon Outline</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)]">
                            Finding Peace in Chaos
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--color-text-muted)]">
                            <span>Pastor Michael</span>
                            <span>•</span>
                            <span>December 15, 2024</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                42:15
                            </span>
                        </div>
                    </div>

                    {/* Outline Sections */}
                    <div className="space-y-6">
                        {outlineSections.map((section, index) => (
                            <div key={index} className="group">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-3">
                                    <Badge variant="outline" className="w-fit font-mono text-xs">
                                        {section.time}
                                    </Badge>
                                    <h3 className="font-display text-lg font-semibold text-[var(--color-text-light)]">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className="ml-0 sm:ml-[100px]">
                                    <ul className="space-y-2 mb-3">
                                        {section.points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-light)]">
                                                <span className="text-[var(--color-secondary)] mt-1">•</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    {section.scripture && (
                                        <p className="text-sm text-[var(--color-text-muted)] italic border-l-2 border-[var(--color-secondary)] pl-3">
                                            Key Scripture: {section.scripture}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
                            <span>Generated by RevelationsHub AI</span>
                            <span>Grace Community Church</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
