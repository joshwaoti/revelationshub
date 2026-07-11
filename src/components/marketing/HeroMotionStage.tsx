"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    LayoutGrid,
    Wand2,
    MessageSquare,
    Image as ImageIcon,
    BookOpen,
    Heart,
    FileText,
    Type,
    FileEdit,
    Mic,
    List,
    Play,
    Sparkles,
    Calendar,
    Quote,
    ScrollText,
} from "lucide-react";

// The app's real light-theme tokens, hardcoded so the mockup always shows
// the product's actual colors regardless of the marketing page theme.
const ui = {
    sidebar: "#ffeaec",
    main: "#fdf8f9",
    card: "#ffffff",
    ink: "#301a4b",
    muted: "#548a94",
    primary: "#6db1bf",
    secondary: "#f39a9d",
    border: "rgba(48, 26, 75, 0.08)",
    ready: "#3d9a67",
    readyBg: "rgba(61, 154, 103, 0.14)",
};

const sidebarSections = [
    {
        title: "SOCIAL MEDIA",
        items: [
            { icon: Wand2, label: "Magic Clips" },
            { icon: MessageSquare, label: "Ask the Transcript" },
            { icon: ImageIcon, label: "Image Quotes" },
            { icon: LayoutGrid, label: "Social Carousel" },
        ],
    },
    {
        title: "DISCIPLESHIP",
        items: [
            { icon: BookOpen, label: "Discussion Guide" },
            { icon: Heart, label: "Devotionals" },
            { icon: FileText, label: "Sermon Outline" },
        ],
    },
    {
        title: "MORE CONTENT",
        items: [
            { icon: Type, label: "Transcription" },
            { icon: FileEdit, label: "Blog Post" },
            { icon: Mic, label: "Podcast Audio" },
            { icon: List, label: "Summaries" },
        ],
    },
];

const contentStatus = [
    { icon: LayoutGrid, label: "Carousel" },
    { icon: BookOpen, label: "Discussion Guide" },
    { icon: Heart, label: "Devotional" },
    { icon: FileEdit, label: "Blog Post" },
    { icon: ScrollText, label: "Outline" },
];

const contentStats = [
    { icon: Wand2, label: "Clips Generated", value: "12" },
    { icon: Quote, label: "Quotes", value: "7" },
    { icon: FileText, label: "Has Transcript", value: "Yes" },
];

export function HeroMotionStage() {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion();

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        const node = stageRef.current;
        if (!node || reducedMotion) return;

        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        node.style.setProperty("--pointer-x", `${x * 100}%`);
        node.style.setProperty("--pointer-y", `${y * 100}%`);
        node.style.setProperty("--tilt-x", `${(0.5 - y) * 6}deg`);
        node.style.setProperty("--tilt-y", `${(x - 0.5) * 8}deg`);
    }

    function resetPointer() {
        const node = stageRef.current;
        if (!node) return;

        node.style.setProperty("--tilt-x", "0deg");
        node.style.setProperty("--tilt-y", "0deg");
    }

    return (
        <div
            ref={stageRef}
            className="hero-motion-stage relative mx-auto max-w-5xl"
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
        >
            <div className="pointer-events-none absolute inset-0 hero-sheen" />

            {/* Browser chrome */}
            <div className="hero-desktop-frame group relative min-w-0 rounded-[1.6rem] border p-2 shadow-2xl" style={{ backgroundColor: ui.card, borderColor: "rgba(48, 26, 75, 0.12)" }}>
                <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: ui.border }}>
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                    <div className="ml-3 flex-1 rounded-md px-3 py-1 text-left text-[10px]" style={{ backgroundColor: ui.main, color: ui.muted }}>
                        app.revelationshub.com/sermon/hope-has-a-voice
                    </div>
                </div>

                {/* The app itself: sermon sidebar · Overview screen */}
                <div className="relative flex aspect-[16/10] overflow-hidden rounded-[1rem] text-left" style={{ backgroundColor: ui.main }}>
                    {/* Sermon sidebar */}
                    <div className="hidden w-[8.5rem] shrink-0 flex-col gap-1 px-2 py-2.5 sm:flex md:w-40" style={{ backgroundColor: ui.sidebar }}>
                        <span className="flex items-center gap-1 px-1.5 text-[8px] font-medium" style={{ color: ui.ink }}>
                            <ArrowLeft className="size-2" /> Back to Library
                        </span>
                        <span
                            className="mt-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[9.5px] font-semibold shadow-sm"
                            style={{ backgroundColor: ui.card, color: ui.ink, boxShadow: `inset 2.5px 0 0 ${ui.primary}, 0 1px 3px rgba(48,26,75,0.08)` }}
                        >
                            <LayoutGrid className="size-2.5" style={{ color: ui.primary }} /> Overview
                        </span>
                        {sidebarSections.map((section) => (
                            <div key={section.title} className="mt-1.5">
                                <p className="px-2 pb-1 text-[7px] font-bold tracking-[0.12em]" style={{ color: ui.muted }}>
                                    {section.title}
                                </p>
                                {section.items.map((item, i) => (
                                    <span key={item.label} className="flex items-center gap-1.5 rounded px-2 py-[3.5px] text-[9px]" style={{ color: ui.ink }}>
                                        <item.icon className="size-2.5" style={{ color: i % 2 === 0 ? ui.secondary : ui.primary }} />
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Overview content */}
                    <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
                        {/* Header */}
                        <div className="mb-2.5 flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="font-display text-[13px] font-bold leading-tight sm:text-[15px]" style={{ color: ui.ink }}>
                                        Hope Has a Voice — Sunday Service
                                    </p>
                                    <span className="rounded-full px-1.5 py-px text-[7.5px] font-bold text-white" style={{ backgroundColor: ui.ready }}>
                                        Ready
                                    </span>
                                </div>
                                <p className="mt-0.5 flex items-center gap-1 text-[8px]" style={{ color: ui.muted }}>
                                    <Calendar className="size-2" /> Jan 10, 2026 · 48:12
                                </p>
                            </div>
                            <motion.span
                                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[8.5px] font-semibold text-white"
                                style={{ backgroundColor: ui.secondary }}
                                animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles className="size-2.5" /> Generate All Content
                            </motion.span>
                        </div>

                        <div className="flex min-h-0 flex-1 gap-2.5 sm:gap-3">
                            {/* Video + clips */}
                            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                                <div className="relative overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: ui.border, aspectRatio: "16/9" }}>
                                    <Image
                                        src="/marketing-thumbnails/stage.svg"
                                        alt="Sermon video preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.span
                                            className="flex size-8 items-center justify-center rounded-full sm:size-10"
                                            style={{ backgroundColor: "rgba(255, 234, 236, 0.9)" }}
                                            animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Play className="ml-0.5 size-3.5 sm:size-4" style={{ color: ui.ink, fill: ui.ink }} />
                                        </motion.span>
                                    </div>
                                </div>

                                {/* Clips strip */}
                                <div className="flex-1 rounded-xl border p-2 shadow-sm sm:p-2.5" style={{ backgroundColor: ui.card, borderColor: ui.border }}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <p className="flex items-center gap-1 text-[9px] font-bold" style={{ color: ui.ink }}>
                                            <Wand2 className="size-2.5" style={{ color: ui.secondary }} /> Clips (3)
                                        </p>
                                        <span className="text-[8px] font-medium" style={{ color: ui.primary }}>View all</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {["Hope speaks louder", "Faith finds its voice", "What healing requires"].map((title, i) => (
                                            <div key={title} className="overflow-hidden rounded-lg border" style={{ borderColor: ui.border }}>
                                                <div className="relative h-7 sm:h-9" style={{ background: `linear-gradient(15${i * 3}deg, ${ui.primary}55, ${ui.secondary}55)` }}>
                                                    <Play className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2" style={{ color: ui.ink, fill: ui.ink, opacity: 0.7 }} />
                                                </div>
                                                <p className="truncate px-1 py-0.5 text-[7px] font-medium" style={{ color: ui.ink }}>{title}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right column: stats + status */}
                            <div className="hidden w-[9.5rem] shrink-0 flex-col gap-2.5 sm:flex md:w-44">
                                <div className="rounded-xl border p-2.5 shadow-sm" style={{ backgroundColor: ui.card, borderColor: ui.border }}>
                                    <p className="mb-1.5 flex items-center gap-1 text-[9px] font-bold" style={{ color: ui.ink }}>
                                        <Sparkles className="size-2.5" style={{ color: ui.secondary }} /> Content Stats
                                    </p>
                                    {contentStats.map((stat) => (
                                        <div key={stat.label} className="flex items-center justify-between py-[3px]">
                                            <span className="flex items-center gap-1 text-[8.5px]" style={{ color: ui.muted }}>
                                                <stat.icon className="size-2.5" style={{ color: ui.primary }} />
                                                {stat.label}
                                            </span>
                                            <span className="text-[8.5px] font-bold" style={{ color: ui.ink }}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1 rounded-xl border p-2.5 shadow-sm" style={{ backgroundColor: ui.card, borderColor: ui.border }}>
                                    <p className="mb-1.5 text-[9px] font-bold" style={{ color: ui.ink }}>Content Status</p>
                                    {contentStatus.map((item, i) => (
                                        <div key={item.label} className="flex items-center justify-between py-[3px]">
                                            <span className="flex items-center gap-1 text-[8.5px]" style={{ color: ui.muted }}>
                                                <item.icon className="size-2.5" style={{ color: ui.primary }} />
                                                {item.label}
                                            </span>
                                            <motion.span
                                                className="rounded-full px-1.5 py-px text-[7px] font-bold"
                                                style={{ backgroundColor: ui.readyBg, color: ui.ready }}
                                                initial={reducedMotion ? undefined : { opacity: 0, scale: 0.7 }}
                                                whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.5 + i * 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                Ready
                                            </motion.span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
