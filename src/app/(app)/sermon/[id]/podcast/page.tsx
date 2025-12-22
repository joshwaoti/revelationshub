"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Mic,
    Music,
    Clock,
} from "lucide-react";
import { useState } from "react";

export default function PodcastAudioPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Podcast Audio
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Clean audio extracted from your sermon
                    </p>
                </div>
                <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download MP3
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Audio Player */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        {/* Cover Art */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[var(--radius-default)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shrink-0">
                                <Mic className="h-12 w-12 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="font-display text-xl font-bold text-[var(--color-text-light)] mb-1">
                                    Finding Peace in Chaos
                                </h2>
                                <p className="text-[var(--color-text-muted)] mb-2">
                                    Pastor Michael • Grace Community Church
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <Badge variant="outline">Inner Strength Series</Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        42:15
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Waveform Placeholder */}
                        <div className="h-20 sm:h-24 bg-[var(--color-surface)] rounded-[var(--radius-default)] mb-6 flex items-center justify-center overflow-hidden relative">
                            {/* Mock waveform */}
                            <div className="flex items-center gap-0.5 h-full w-full px-4">
                                {Array.from({ length: 100 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-[var(--color-primary)] rounded-full"
                                        style={{
                                            height: `${20 + Math.sin(i * 0.3) * 40 + Math.random() * 20}%`,
                                            opacity: i < 35 ? 1 : 0.4,
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="absolute left-[35%] top-0 bottom-0 w-0.5 bg-[var(--color-secondary)]" />
                        </div>

                        {/* Time */}
                        <div className="flex justify-between text-sm font-mono text-[var(--color-text-muted)] mb-4">
                            <span>14:45</span>
                            <span>42:15</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]">
                                <SkipBack className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="h-14 w-14 rounded-full bg-[var(--color-primary)] text-[var(--color-base)] flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause className="h-6 w-6" />
                                ) : (
                                    <Play className="h-6 w-6 ml-1" />
                                )}
                            </button>
                            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]">
                                <SkipForward className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] ml-4">
                                <Volume2 className="h-5 w-5" />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-[var(--color-text-light)] mb-4 flex items-center gap-2">
                            <Music className="h-4 w-4 text-[var(--color-success)]" />
                            Export Options
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full p-4 rounded-[var(--radius-default)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-[var(--color-text-light)]">High Quality MP3</span>
                                    <Badge variant="outline">320 kbps</Badge>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">Best for podcast platforms</p>
                            </button>
                            <button className="w-full p-4 rounded-[var(--radius-default)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-[var(--color-text-light)]">Standard MP3</span>
                                    <Badge variant="outline">128 kbps</Badge>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">Smaller file size</p>
                            </button>
                            <button className="w-full p-4 rounded-[var(--radius-default)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-[var(--color-text-light)]">WAV Lossless</span>
                                    <Badge variant="outline">16-bit</Badge>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">For professional editing</p>
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                            <h4 className="text-sm font-medium text-[var(--color-text-light)] mb-3">
                                Audio Enhancements
                            </h4>
                            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    Remove background noise
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    Normalize volume levels
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded" />
                                    Remove &quot;um&quot; and &quot;uh&quot;
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
