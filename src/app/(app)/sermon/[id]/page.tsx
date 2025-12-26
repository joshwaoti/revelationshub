"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Play,
    Sparkles,
    Wand2,
    Clock,
    Calendar,
    User,
    BookOpen,
} from "lucide-react";
import Link from "next/link";

// Mock sermon data
const sermon = {
    id: "1",
    title: "Finding Peace in Chaos",
    series: "Inner Strength",
    speaker: "Pastor Michael",
    date: "Dec 15, 2024",
    duration: "42:15",
    status: "ready",
    description:
        "In this powerful message, Pastor Michael explores how to find inner peace even when life feels overwhelming. Drawing from Scripture and real-world experiences, discover practical steps to cultivate calm in the midst of chaos.",
};

// Mock clips data
const clips = [
    { id: 1, title: "The eye of the storm", duration: "0:45", score: 95 },
    { id: 2, title: "Peace is a choice", duration: "0:52", score: 88 },
    { id: 3, title: "Letting go of control", duration: "0:38", score: 82 },
    { id: 4, title: "Finding stillness", duration: "0:41", score: 79 },
];

// Mock AI insights
const insights = [
    { label: "Key Theme", value: "Inner Peace" },
    { label: "Scripture References", value: "3 passages" },
    { label: "Stories/Illustrations", value: "4 identified" },
    { label: "Viral Potential", value: "High" },
];

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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

export default function SermonDashboardPage() {
    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                variants={headerVariants}
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text-light)]">
                            {sermon.title}
                        </h1>
                        <Badge variant="success">Ready</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {sermon.speaker}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {sermon.series}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {sermon.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {sermon.duration}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Watch Full Sermon
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="secondary">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Content
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player - Large */}
                <motion.div
                    className="lg:col-span-2 lg:row-span-2"
                    variants={itemVariants}
                >
                    <Card className="overflow-hidden h-full">
                        <div className="relative aspect-video bg-[var(--color-base)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.button
                                    className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Play className="h-7 w-7 text-[var(--color-base)] ml-1" />
                                </motion.button>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[var(--color-primary)] rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: "33%" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-white/80 font-mono">
                                    <span>14:23</span>
                                    <span>{sermon.duration}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* AI Insights */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
                                </motion.div>
                                AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {insights.map((insight, index) => (
                                    <motion.div
                                        key={insight.label}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <span className="text-sm text-[var(--color-text-muted)]">
                                            {insight.label}
                                        </span>
                                        <span className="text-sm font-medium text-[var(--color-text-light)]">
                                            {insight.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Description */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                {sermon.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Clips */}
                <motion.div
                    className="lg:col-span-2"
                    variants={itemVariants}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-[var(--color-primary)]" />
                                    Top Clips
                                </CardTitle>
                                <Link
                                    href={`/sermon/${sermon.id}/clips`}
                                    className="text-sm text-[var(--color-primary)] hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {clips.map((clip, index) => (
                                    <motion.div
                                        key={clip.id}
                                        className="group cursor-pointer"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        whileHover={{ y: -4 }}
                                    >
                                        <div className="relative aspect-[9/16] bg-[var(--color-base)] rounded-[var(--radius-default)] overflow-hidden mb-2 group-hover:ring-2 ring-[var(--color-primary)]/30 transition-all">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30" />
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
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="ai" className="text-[10px] px-1.5 py-0.5">
                                                    {clip.score}%
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                                                {clip.duration}
                                            </div>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-light)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                                            {clip.title}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href={`/sermon/${sermon.id}/clips`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Wand2 className="h-4 w-4 mr-2 text-[var(--color-primary)]" />
                                            Generate More Clips
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href={`/sermon/${sermon.id}/discussion-guide`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <BookOpen className="h-4 w-4 mr-2 text-[var(--color-secondary)]" />
                                            Create Discussion Guide
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href={`/sermon/${sermon.id}/transcription`}>
                                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Calendar className="h-4 w-4 mr-2 text-[var(--color-success)]" />
                                            View Transcription
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
