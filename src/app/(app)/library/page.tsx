"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

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
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                variants={headerVariants}
                initial="hidden"
                animate="visible"
            >
                <div>
                    <h1 className="font-display text-3xl font-bold text-[var(--color-text-light)]">
                        Sermon Library
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {sermons.length} sermons uploaded
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <motion.div
                        className="relative"
                        whileFocus={{ scale: 1.02 }}
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                        <Input
                            type="text"
                            placeholder="Search sermons..."
                            className="pl-10 w-64 transition-all focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                    <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-[var(--radius-default)]">
                        <motion.button
                            onClick={() => setView("grid")}
                            className={`p-2 rounded-[var(--radius-sm)] transition-colors ${view === "grid"
                                ? "bg-[var(--color-primary)] text-[var(--color-base)]"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Grid className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                            onClick={() => setView("list")}
                            className={`p-2 rounded-[var(--radius-sm)] transition-colors ${view === "list"
                                ? "bg-[var(--color-primary)] text-[var(--color-base)]"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <List className="h-4 w-4" />
                        </motion.button>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Sermon
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Grid View */}
            <AnimatePresence mode="wait">
                {view === "grid" && (
                    <motion.div
                        key="grid"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {filteredSermons.map((sermon, index) => (
                            <motion.div
                                key={sermon.id}
                                variants={itemVariants}
                                layout
                            >
                                <Link href={`/sermon/${sermon.id}`}>
                                    <motion.div
                                        whileHover={{
                                            y: -4,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <Card className="group cursor-pointer overflow-hidden hover:border-[var(--color-secondary)] hover:shadow-[0_0_20px_rgba(243,154,157,0.3)] transition-all duration-300">
                                            <div className="relative aspect-video bg-[var(--color-base)]">
                                                {/* Thumbnail placeholder */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                                                <motion.div
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    initial={false}
                                                >
                                                    <motion.div
                                                        className="h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Play className="h-5 w-5 text-[var(--color-base)] ml-0.5" />
                                                    </motion.div>
                                                </motion.div>
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
                                                <h3 className="font-semibold text-[var(--color-text-light)] mb-1 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
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
                                                        <motion.span
                                                            className="text-[var(--color-primary)] font-medium"
                                                            initial={{ scale: 1 }}
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            {sermon.clips} clips
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* List View */}
                {view === "list" && (
                    <motion.div
                        key="list"
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {filteredSermons.map((sermon, index) => (
                            <motion.div
                                key={sermon.id}
                                variants={itemVariants}
                                layout
                            >
                                <Link href={`/sermon/${sermon.id}`}>
                                    <motion.div
                                        whileHover={{
                                            x: 4,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <Card className="group cursor-pointer hover:border-[var(--color-secondary)] hover:shadow-[0_0_20px_rgba(243,154,157,0.3)] transition-all duration-300">
                                            <div className="flex items-center gap-6 p-5">
                                                {/* Thumbnail */}
                                                <div className="relative w-44 aspect-video bg-[var(--color-base)] rounded-[var(--radius-sm)] overflow-hidden shrink-0 group-hover:ring-2 ring-[var(--color-primary)]/30 transition-all">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                                                    <motion.div
                                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <motion.div
                                                            className="h-10 w-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <Play className="h-4 w-4 text-[var(--color-base)] ml-0.5" />
                                                        </motion.div>
                                                    </motion.div>
                                                    <div className="absolute bottom-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-xs text-white font-mono">
                                                        {sermon.duration}
                                                    </div>
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-semibold text-[var(--color-text-light)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
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
                                                    <div className="flex items-center gap-6 mt-3 text-sm text-[var(--color-text-muted)]">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {sermon.date}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {sermon.duration}
                                                        </span>
                                                        {sermon.clips > 0 && (
                                                            <span className="text-[var(--color-primary)] font-medium">
                                                                {sermon.clips} clips generated
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <motion.button
                                                    className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </motion.button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredSermons.length === 0 && (
                <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                        <Search className="h-8 w-8 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No sermons found
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        Try adjusting your search query
                    </p>
                </motion.div>
            )}
        </div>
    );
}
