"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Scissors,
    Undo,
    Redo,
    ZoomIn,
    ZoomOut,
    Save,
    Wand2,
    Crop,
    Type,
    Layers,
} from "lucide-react";

// Mock timeline tracks
const tracks = [
    { id: "video", name: "Video", type: "video", color: "var(--color-primary)" },
    { id: "audio", name: "Audio", type: "audio", color: "var(--color-success)" },
    { id: "captions", name: "Captions", type: "text", color: "var(--color-secondary)" },
];

export default function VideoEditorPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(14.23);
    const totalTime = 45.0;

    return (
        <div className="min-h-[calc(100vh-48px)] flex flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-2 bg-[var(--color-surface)] rounded-[var(--radius-default)]">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="Undo">
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Redo">
                        <Redo className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
                    <Button variant="ghost" size="sm" title="Cut">
                        <Scissors className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Crop">
                        <Crop className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Add Text">
                        <Type className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
                    <Button variant="ghost" size="sm" title="Zoom Out">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Zoom In">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Layers className="h-4 w-4 mr-2" />
                        Templates
                    </Button>
                    <Button variant="outline" size="sm">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Auto-Edit
                    </Button>
                    <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Video Preview */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Preview Panel */}
                    <Card className="flex-1">
                        <CardContent className="p-4">
                            <div className="aspect-video bg-[var(--color-base)] rounded-[var(--radius-default)] relative overflow-hidden">
                                {/* Video Preview */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />

                                {/* Play/Pause Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-6 w-6 text-white" />
                                        ) : (
                                            <Play className="h-6 w-6 text-white ml-1" />
                                        )}
                                    </button>
                                </div>

                                {/* Caption Overlay */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-[90%]">
                                    <p className="text-lg font-bold text-white text-center drop-shadow-lg bg-black/50 px-4 py-2 rounded">
                                        Peace is not the absence of chaos...
                                    </p>
                                </div>

                                {/* Aspect Ratio Badge */}
                                <div className="absolute top-3 right-3">
                                    <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                                        9:16
                                    </Badge>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="mt-4 flex items-center gap-4">
                                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]">
                                    <SkipBack className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-4 w-4" />
                                    ) : (
                                        <Play className="h-4 w-4 ml-0.5" />
                                    )}
                                </button>
                                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]">
                                    <SkipForward className="h-4 w-4" />
                                </button>
                                <div className="flex-1 mx-4">
                                    <div className="h-1 bg-[var(--color-border)] rounded-full relative">
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-[var(--color-primary)] rounded-full"
                                            style={{ width: `${(currentTime / totalTime) * 100}%` }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-[var(--color-primary)] rounded-full"
                                            style={{ left: `${(currentTime / totalTime) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-mono text-[var(--color-text-muted)] min-w-[80px]">
                                    {Math.floor(currentTime)}:{String(Math.floor((currentTime % 1) * 60)).padStart(2, "0")} / {Math.floor(totalTime)}:00
                                </span>
                                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]">
                                    <Volume2 className="h-4 w-4" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {/* Time Ruler */}
                                <div className="flex items-center gap-1 ml-20 text-xs text-[var(--color-text-muted)] font-mono">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="flex-1 text-center">{i * 5}s</div>
                                    ))}
                                </div>

                                {/* Tracks */}
                                {tracks.map((track) => (
                                    <div key={track.id} className="flex items-center gap-2">
                                        <div className="w-20 text-sm text-[var(--color-text-muted)] shrink-0">
                                            {track.name}
                                        </div>
                                        <div className="flex-1 h-10 bg-[var(--color-surface)] rounded relative overflow-hidden">
                                            {/* Track Content */}
                                            <div
                                                className="absolute inset-y-1 rounded"
                                                style={{
                                                    left: "5%",
                                                    width: "90%",
                                                    backgroundColor: `${track.color}30`,
                                                    borderLeft: `3px solid ${track.color}`,
                                                }}
                                            >
                                                {track.type === "audio" && (
                                                    <div className="flex items-center h-full px-2 gap-0.5">
                                                        {Array.from({ length: 50 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-0.5 bg-[var(--color-success)]"
                                                                style={{ height: `${30 + Math.random() * 50}%` }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Playhead */}
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                                                style={{ left: `${(currentTime / totalTime) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Properties Panel */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-[var(--color-text-light)] mb-4">
                            Properties
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                    Aspect Ratio
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["9:16", "1:1", "16:9"].map((ratio) => (
                                        <button
                                            key={ratio}
                                            className={`p-2 text-sm rounded-[var(--radius-sm)] border transition-colors ${ratio === "9:16"
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                                                }`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                    Caption Style
                                </label>
                                <select className="w-full h-10 rounded-[var(--radius-default)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-light)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                                    <option>Bold White</option>
                                    <option>Gradient Pop</option>
                                    <option>Minimal</option>
                                    <option>Karaoke</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                    Smart Reframe
                                </label>
                                <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        Face tracking
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        Smart crop
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--color-border)]">
                                <Button className="w-full">
                                    Export Clip
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
