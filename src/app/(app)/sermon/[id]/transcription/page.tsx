"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Copy,
    Search,
    Edit3,
    Check,
    Clock,
} from "lucide-react";

// Mock transcript data
const transcriptSegments = [
    { start: "00:00", end: "00:45", text: "Good morning, everyone. Thank you so much for being here. Today, we're continuing our series called Inner Strength, and I want to talk to you about something that I think every single person in this room can relate to.", speaker: "Pastor Michael" },
    { start: "00:45", end: "01:30", text: "How many of you would say that life feels chaotic right now? Raise your hand. Yeah, I see those hands. You know, I think one of the biggest lies we tell ourselves is that peace will come when life calms down.", speaker: "Pastor Michael" },
    { start: "01:30", end: "02:15", text: "But here's the truth: life doesn't calm down. It just keeps moving. And if we're waiting for the perfect moment of stillness to find peace, we're going to be waiting forever.", speaker: "Pastor Michael" },
    { start: "02:15", end: "03:00", text: "Today, I want to share with you a different perspective. Peace is not the absence of chaos. Peace is the presence of God in the midst of chaos. Let me say that again.", speaker: "Pastor Michael" },
    { start: "03:00", end: "03:45", text: "Peace is not the absence of chaos. Peace is the presence of God in the midst of chaos. And that changes everything.", speaker: "Pastor Michael" },
    { start: "03:45", end: "04:30", text: "Turn with me to John chapter 14, verse 27. Jesus is speaking to his disciples, and he says something profound. He says, 'Peace I leave with you; my peace I give you.'", speaker: "Pastor Michael" },
];

export default function TranscriptionPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const filteredSegments = transcriptSegments.filter(segment =>
        segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Transcription
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Full sermon transcript • 42:15
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search transcript..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-default)] bg-[var(--color-surface)] text-[var(--color-text-light)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
            </div>

            {/* Transcript */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                        {filteredSegments.map((segment, index) => (
                            <div
                                key={index}
                                className="group p-3 sm:p-4 rounded-[var(--radius-default)] hover:bg-[var(--color-primary)]/5 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button className="text-xs font-mono text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded hover:bg-[var(--color-primary)]/20 transition-colors">
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            {segment.start}
                                        </button>
                                        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                                            {segment.speaker}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {editingId === index ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    defaultValue={segment.text}
                                                    className="w-full h-24 p-3 rounded-[var(--radius-default)] bg-[var(--color-surface)] text-[var(--color-text-light)] border border-[var(--color-primary)] focus:outline-none resize-none text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => setEditingId(null)}>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Save
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                                {searchQuery ? (
                                                    <span dangerouslySetInnerHTML={{
                                                        __html: segment.text.replace(
                                                            new RegExp(`(${searchQuery})`, 'gi'),
                                                            '<mark class="bg-[var(--color-secondary)]/30 px-0.5 rounded">$1</mark>'
                                                        )
                                                    }} />
                                                ) : segment.text}
                                            </p>
                                        )}
                                    </div>
                                    {editingId !== index && (
                                        <button
                                            onClick={() => setEditingId(index)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all shrink-0"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
