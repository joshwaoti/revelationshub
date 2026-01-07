"use client";

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
} from "lucide-react";

const summaries = {
    paragraph: `In this powerful sermon, Pastor Michael explores how to find inner peace even when life feels chaotic. He begins by acknowledging that modern life is filled with constant noise and distraction, and challenges the common belief that peace will come "when things calm down." Drawing from John 14:27, he presents Jesus' different definition of peace—not as the absence of chaos, but as the presence of God in the midst of it. The sermon outlines three practical steps: acknowledging the storm without denial, anchoring in faith through God's promises, and acting with intention by making peace a daily choice. Members are challenged to set aside 10 minutes daily for intentional stillness.`,

    bullets: [
        "Modern life is filled with constant noise and distraction",
        "We often mistake busyness for purpose",
        'Peace is not the absence of chaos, but the presence of God in the midst of it',
        "Jesus offers a different kind of peace (John 14:27)",
        "Three steps: Acknowledge the storm, Anchor in faith, Act with intention",
        "Weekly challenge: 10 minutes of intentional stillness daily",
    ],

    social: `Finding peace in chaos isn't about waiting for life to calm down—it's about discovering God's presence right in the middle of the storm. 🌊

This Sunday, Pastor Michael shared 3 powerful steps:
1️⃣ Acknowledge the storm
2️⃣ Anchor in faith  
3️⃣ Act with intention

What's one thing you can surrender to God today?

#InnerStrength #FindingPeace #SundaySermon`,

    hashtags: ["#FindingPeace", "#InnerStrength", "#SundaySermon", "#FaithOverFear", "#ChurchLife", "#SermonNotes", "#ChristianFaith", "#PastorMichael"],
};

export default function SummariesPage() {
    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Summaries
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Auto-generated summaries in multiple formats
                    </p>
                </div>
                <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate All
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paragraph Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                                Paragraph Summary
                            </CardTitle>
                            <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                            {summaries.paragraph}
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
                            <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {summaries.bullets.map((bullet, index) => (
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
                            <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-[var(--color-surface)] rounded-[var(--radius-default)] p-4">
                            <pre className="text-sm text-[var(--color-text-light)] whitespace-pre-wrap font-sans">
                                {summaries.social}
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
                            <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {summaries.hashtags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="cursor-pointer hover:bg-[var(--color-primary)]/10">
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
        </div>
    );
}
