"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Play,
    Download,
    Share2,
    Edit,
    RefreshCw,
} from "lucide-react";

// Mock clips data
const clips = [
    {
        id: 1,
        title: "The eye of the storm - finding calm within",
        duration: "0:45",
        score: 95,
        status: "ready" as const,
        timestamp: "14:23",
    },
    {
        id: 2,
        title: "Peace is a choice we make daily",
        duration: "0:52",
        score: 88,
        status: "ready" as const,
        timestamp: "22:15",
    },
    {
        id: 3,
        title: "Letting go of control brings freedom",
        duration: "0:38",
        score: 82,
        status: "ready" as const,
        timestamp: "28:40",
    },
    {
        id: 4,
        title: "Finding stillness in movement",
        duration: "0:41",
        score: 79,
        status: "ready" as const,
        timestamp: "35:12",
    },
    {
        id: 5,
        title: "The power of surrender",
        duration: "0:48",
        score: 75,
        status: "processing" as const,
        timestamp: "38:55",
    },
];

export default function ClipsPage() {
    const [selectedClip, setSelectedClip] = useState(clips[0]);

    return (
        <div className="h-[calc(100vh-48px)] flex gap-6">
            {/* Left Column - Clip List */}
            <div className="w-80 shrink-0 space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold text-[var(--color-text-light)]">
                        Generated Clips
                    </h2>
                    <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Regenerate
                    </Button>
                </div>
                {clips.map((clip) => (
                    <Card
                        key={clip.id}
                        onClick={() => setSelectedClip(clip)}
                        className={`cursor-pointer transition-all ${selectedClip?.id === clip.id
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                : "hover:border-[var(--color-primary)]/50"
                            }`}
                    >
                        <div className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm text-[var(--color-text-light)] line-clamp-2">
                                    {clip.title}
                                </p>
                                <Badge
                                    variant={clip.status === "ready" ? "success" : "processing"}
                                    className="shrink-0"
                                >
                                    {clip.status === "ready" ? `${clip.score}%` : "..."}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                <span className="font-mono">{clip.duration}</span>
                                <span>@ {clip.timestamp}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Right Column - Preview */}
            <div className="flex-1 flex flex-col">
                {selectedClip && (
                    <>
                        {/* Video Preview */}
                        <div className="flex-1 flex items-center justify-center bg-[var(--color-base)] rounded-[var(--radius-default)] overflow-hidden">
                            <div className="w-full max-w-sm aspect-[9/16] relative bg-[var(--color-base)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center hover:scale-105 transition-transform">
                                        <Play className="h-7 w-7 text-[var(--color-base)] ml-1" />
                                    </button>
                                </div>
                                {/* Mock caption overlay */}
                                <div className="absolute bottom-16 left-4 right-4 text-center">
                                    <p className="text-lg font-bold text-white drop-shadow-lg">
                                        &quot;Peace is not the absence of chaos...&quot;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Clip Details & Actions */}
                        <div className="mt-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-display text-xl font-semibold text-[var(--color-text-light)] mb-1">
                                        {selectedClip.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                                        <span className="font-mono">{selectedClip.duration}</span>
                                        <span>Starting at {selectedClip.timestamp}</span>
                                        <Badge variant="ai">AI Score: {selectedClip.score}%</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button variant="outline">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Clip
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
