"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Upload,
    Grid,
    List,
    MoreVertical,
    Play,
    Clock,
    Calendar,
} from "lucide-react";
import Link from "next/link";

// Mock data for sermon library
const sermons = [
    {
        id: "1",
        title: "Finding Peace in Chaos",
        series: "Inner Strength",
        speaker: "Pastor Michael",
        date: "Dec 15, 2024",
        duration: "42:15",
        status: "ready" as const,
        thumbnail: "/api/placeholder/320/180",
        clips: 5,
    },
    {
        id: "2",
        title: "The Power of Forgiveness",
        series: "Healing Hearts",
        speaker: "Pastor Sarah",
        date: "Dec 8, 2024",
        duration: "38:22",
        status: "processing" as const,
        thumbnail: "/api/placeholder/320/180",
        clips: 0,
    },
    {
        id: "3",
        title: "Walking in Faith",
        series: "Journey of Faith",
        speaker: "Pastor Michael",
        date: "Dec 1, 2024",
        duration: "45:10",
        status: "ready" as const,
        thumbnail: "/api/placeholder/320/180",
        clips: 8,
    },
    {
        id: "4",
        title: "Love Your Neighbor",
        series: "Community",
        speaker: "Pastor David",
        date: "Nov 24, 2024",
        duration: "35:48",
        status: "ready" as const,
        thumbnail: "/api/placeholder/320/180",
        clips: 4,
    },
    {
        id: "5",
        title: "Gratitude in All Things",
        series: "Thanksgiving",
        speaker: "Pastor Sarah",
        date: "Nov 17, 2024",
        duration: "40:05",
        status: "ready" as const,
        thumbnail: "/api/placeholder/320/180",
        clips: 6,
    },
    {
        id: "6",
        title: "The Light Within",
        series: "Inner Strength",
        speaker: "Pastor Michael",
        date: "Nov 10, 2024",
        duration: "43:30",
        status: "ready" as const,
        thumbnail: "/api/placeholder/320/180",
        clips: 7,
    },
];

export default function LibraryPage() {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSermons = sermons.filter(
        (sermon) =>
            sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sermon.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-[var(--color-text-light)]">
                        Sermon Library
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {sermons.length} sermons uploaded
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                        <Input
                            type="text"
                            placeholder="Search sermons..."
                            className="pl-10 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-[var(--radius-default)]">
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 rounded-[var(--radius-sm)] transition-colors ${view === "grid"
                                    ? "bg-[var(--color-primary)] text-[var(--color-base)]"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]"
                                }`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`p-2 rounded-[var(--radius-sm)] transition-colors ${view === "list"
                                    ? "bg-[var(--color-primary)] text-[var(--color-base)]"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]"
                                }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Sermon
                    </Button>
                </div>
            </div>

            {/* Grid View */}
            {view === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSermons.map((sermon) => (
                        <Link key={sermon.id} href={`/sermon/${sermon.id}`}>
                            <Card className="group cursor-pointer overflow-hidden hover:border-[var(--color-secondary)] hover:shadow-[0_0_20px_rgba(243,154,157,0.3)] transition-all duration-300">
                                <div className="relative aspect-video bg-[var(--color-base)]">
                                    {/* Thumbnail placeholder */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                                            <Play className="h-5 w-5 text-[var(--color-base)] ml-0.5" />
                                        </div>
                                    </div>
                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2">
                                        <Badge
                                            variant={sermon.status === "ready" ? "success" : "processing"}
                                        >
                                            {sermon.status === "ready" ? "Ready" : "Processing"}
                                        </Badge>
                                    </div>
                                    {/* Duration */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-mono">
                                        {sermon.duration}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-[var(--color-text-light)] mb-1 line-clamp-1">
                                        {sermon.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-muted)] mb-2">
                                        {sermon.series} • {sermon.speaker}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {sermon.date}
                                        </span>
                                        {sermon.clips > 0 && (
                                            <span className="text-[var(--color-primary)]">
                                                {sermon.clips} clips
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* List View */}
            {view === "list" && (
                <div className="space-y-2">
                    {filteredSermons.map((sermon) => (
                        <Link key={sermon.id} href={`/sermon/${sermon.id}`}>
                            <Card className="group cursor-pointer hover:border-[var(--color-secondary)] hover:shadow-[0_0_20px_rgba(243,154,157,0.3)] transition-all duration-300">
                                <div className="flex items-center gap-4 p-4">
                                    {/* Thumbnail */}
                                    <div className="relative w-40 aspect-video bg-[var(--color-base)] rounded-[var(--radius-sm)] overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                                        <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs text-white font-mono">
                                            {sermon.duration}
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[var(--color-text-light)] mb-1">
                                                    {sermon.title}
                                                </h3>
                                                <p className="text-sm text-[var(--color-text-muted)]">
                                                    {sermon.series} • {sermon.speaker}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={sermon.status === "ready" ? "success" : "processing"}
                                            >
                                                {sermon.status === "ready" ? "Ready" : "Processing"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {sermon.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {sermon.duration}
                                            </span>
                                            {sermon.clips > 0 && (
                                                <span className="text-[var(--color-primary)]">
                                                    {sermon.clips} clips generated
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
