"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    Library,
    Settings,
    ArrowLeft,
    LayoutGrid,
    Wand2,
    MessageSquare,
    Image as ImageIcon,
    BookOpen,
    Heart,
    FileText,
    Play,
    Download,
    Share2,
    Flame,
    Loader2,
} from "lucide-react";
import { LogoMark } from "@/components/brand/RevelationsLogo";
import { cn } from "@/lib/utils";

// The app's real dark-theme tokens, hardcoded so the mockup always shows
// the product's actual colors regardless of the marketing page theme.
const ui = {
    base: "#301a4b",
    surface: "#231238",
    primary: "#6db1bf",
    secondary: "#f39a9d",
    textLight: "#ffeaec",
    textMuted: "#8fa6c9",
    border: "rgba(109, 177, 191, 0.2)",
};

const sidebarSections = [
    {
        title: "SOCIAL MEDIA",
        items: [
            { icon: Wand2, label: "Magic Clips", active: true },
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
];

const clips = [
    {
        title: "Hope speaks louder than fear",
        duration: "0:42",
        startsAt: "12:04",
        score: 94,
        category: "Encouragement",
        selected: true,
    },
    {
        title: "The night faith found its voice",
        duration: "0:38",
        startsAt: "27:31",
        score: 88,
        category: "Story",
    },
    {
        title: "What healing actually requires",
        duration: "0:51",
        startsAt: "41:17",
        score: 82,
        category: "Teaching",
    },
];

const captionWords = ["Hope", "speaks", "louder", "than", "fear"];

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
            <div className="hero-desktop-frame group relative min-w-0 rounded-[1.6rem] border border-white/15 p-2 shadow-2xl" style={{ backgroundColor: ui.base }}>
                <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: ui.border }}>
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                    <div className="ml-3 flex-1 rounded-md bg-white/[0.06] px-3 py-1 text-left text-[10px]" style={{ color: `${ui.textLight}99` }}>
                        app.revelationshub.com/sermon/hope-has-a-voice/clips
                    </div>
                </div>

                {/* The app itself: global rail · sermon sidebar · Magic Clips */}
                <div className="relative flex aspect-[16/10] overflow-hidden rounded-[1rem] text-left" style={{ backgroundColor: ui.surface }}>
                    {/* Global icon rail */}
                    <div className="flex w-9 shrink-0 flex-col items-center gap-3 border-r py-2.5 sm:w-11" style={{ backgroundColor: ui.base, borderColor: ui.border }}>
                        <LogoMark className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="mt-1.5 flex size-5 items-center justify-center rounded-md sm:size-6" style={{ backgroundColor: ui.primary }}>
                            <Library className="size-3" style={{ color: ui.base }} />
                        </span>
                        <span className="flex size-5 items-center justify-center rounded-md sm:size-6" style={{ color: ui.textMuted }}>
                            <Settings className="size-3" />
                        </span>
                    </div>

                    {/* Sermon sidebar */}
                    <div className="hidden w-32 shrink-0 flex-col gap-1 border-r px-2 py-2.5 sm:flex md:w-36" style={{ backgroundColor: ui.base, borderColor: ui.border }}>
                        <span className="flex items-center gap-1 text-[8px]" style={{ color: ui.textMuted }}>
                            <ArrowLeft className="size-2" /> Back to Library
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 rounded px-1.5 py-1 text-[9px]" style={{ color: ui.textLight }}>
                            <LayoutGrid className="size-2.5" style={{ color: ui.primary }} /> Overview
                        </span>
                        {sidebarSections.map((section) => (
                            <div key={section.title} className="mt-1">
                                <p className="px-1.5 pb-0.5 text-[7px] font-semibold tracking-wider" style={{ color: ui.textMuted }}>
                                    {section.title}
                                </p>
                                {section.items.map((item) => (
                                    <span
                                        key={item.label}
                                        className="flex items-center gap-1.5 rounded px-1.5 py-[3px] text-[9px]"
                                        style={
                                            item.active
                                                ? { backgroundColor: ui.surface, color: ui.textLight, boxShadow: `inset 2px 0 0 ${ui.primary}` }
                                                : { color: ui.textMuted }
                                        }
                                    >
                                        <item.icon className="size-2.5" style={{ color: item.active ? ui.primary : ui.secondary }} />
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Magic Clips content */}
                    <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-3.5">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="truncate text-[11px] font-semibold sm:text-xs" style={{ color: ui.textLight }}>
                                Clips · Hope Has a Voice
                            </p>
                            <span className="rounded-full px-2 py-0.5 text-[8px] font-semibold" style={{ backgroundColor: `${ui.primary}1f`, color: ui.primary }}>
                                3 ready
                            </span>
                        </div>

                        <div className="flex min-h-0 flex-1 gap-2.5 sm:gap-3">
                            {/* Clip list */}
                            <div className="flex w-[46%] flex-col gap-1.5 sm:w-[44%]">
                                {clips.map((clip) => (
                                    <div
                                        key={clip.title}
                                        className="rounded-lg border p-1.5 sm:p-2"
                                        style={
                                            clip.selected
                                                ? { borderColor: ui.primary, backgroundColor: `${ui.primary}14` }
                                                : { borderColor: ui.border, backgroundColor: `${ui.base}66` }
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="text-[9px] font-medium leading-tight sm:text-[10px]" style={{ color: ui.textLight }}>
                                                {clip.title}
                                            </p>
                                            <span className="flex shrink-0 items-center gap-0.5 rounded-full border px-1 text-[7px] font-bold" style={{ borderColor: "rgba(251, 146, 60, 0.3)", color: "#fb923c", backgroundColor: "rgba(249, 115, 22, 0.1)" }}>
                                                <Flame className="size-2" />
                                                {clip.score}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[7.5px] sm:text-[8px]" style={{ color: ui.textMuted }}>
                                            {clip.duration} long · starts at {clip.startsAt}
                                            <span className="ml-1 rounded-full px-1 py-px text-[7px]" style={{ backgroundColor: `${ui.primary}1a`, color: ui.primary }}>
                                                {clip.category}
                                            </span>
                                        </p>
                                    </div>
                                ))}

                                {/* Rendering clip with shimmer */}
                                <div className="relative overflow-hidden rounded-lg border p-1.5 sm:p-2" style={{ borderColor: ui.border, backgroundColor: `${ui.base}66` }}>
                                    {!reducedMotion && (
                                        <motion.div
                                            className="pointer-events-none absolute inset-0"
                                            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                    <p className="flex items-center gap-1 text-[9px] sm:text-[10px]" style={{ color: ui.textLight }}>
                                        <Loader2 className={cn("size-2.5", !reducedMotion && "animate-spin")} style={{ color: ui.primary }} />
                                        Rendering clip…
                                    </p>
                                    <p className="mt-0.5 text-[7.5px] sm:text-[8px]" style={{ color: ui.primary }}>
                                        Adding captions…
                                    </p>
                                </div>
                            </div>

                            {/* Vertical video preview */}
                            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5">
                                <div className="relative h-full max-h-full overflow-hidden rounded-lg" style={{ aspectRatio: "9/16", backgroundColor: ui.base }}>
                                    <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${ui.primary}4d, ${ui.secondary}4d)` }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="flex size-6 items-center justify-center rounded-full sm:size-8" style={{ backgroundColor: ui.primary }}>
                                            <Play className="ml-0.5 size-2.5 sm:size-3.5" style={{ color: ui.base, fill: ui.base }} />
                                        </span>
                                    </div>
                                    {/* Karaoke captions */}
                                    <div className="absolute inset-x-1 bottom-2 flex flex-wrap items-center justify-center gap-x-1 text-center">
                                        {captionWords.map((word, i) => (
                                            <motion.span
                                                key={word}
                                                className="text-[8px] font-extrabold uppercase sm:text-[10px]"
                                                style={{ color: ui.textLight, textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                                                animate={
                                                    reducedMotion
                                                        ? undefined
                                                        : { color: [ui.textLight, ui.primary, ui.textLight] }
                                                }
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Infinity,
                                                    repeatDelay: captionWords.length * 0.5 - 0.5,
                                                    delay: i * 0.5,
                                                }}
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] font-semibold" style={{ backgroundColor: ui.primary, color: ui.base }}>
                                        <Download className="size-2" /> Download
                                    </span>
                                    <span className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[8px] font-semibold" style={{ borderColor: ui.border, color: ui.textLight }}>
                                        <Share2 className="size-2" /> Share
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
