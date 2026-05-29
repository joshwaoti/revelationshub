"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenMockup } from "./ScreenMockup";
import {
    Wand2,
    BookOpen,
    Image,
    FileText,
    Mic,
    MessageSquare,
} from "lucide-react";

// Feature definitions
const features = [
    {
        id: "magic-clips",
        icon: Wand2,
        title: "Magic Clips",
        description:
            "Automatically identifies the most engaging moments and creates vertical clips ready for social media.",
        color: "var(--color-primary)",
    },
    {
        id: "discussion-guides",
        icon: BookOpen,
        title: "Discussion Guides",
        description:
            "Generate small group discussion questions and study guides from your sermon content.",
        color: "var(--color-secondary)",
    },
    {
        id: "image-quotes",
        icon: Image,
        title: "Image Quotes",
        description:
            "Create shareable quote graphics with your church branding automatically applied.",
        color: "var(--color-primary)",
    },
    {
        id: "blog-posts",
        icon: FileText,
        title: "Blog Posts",
        description:
            "Transform your spoken word into written blog articles with one click.",
        color: "var(--color-success)",
    },
    {
        id: "podcast-audio",
        icon: Mic,
        title: "Podcast Audio",
        description:
            "Extract clean audio and create podcast episodes from your sermons.",
        color: "var(--color-success)",
    },
    {
        id: "social-carousel",
        icon: MessageSquare,
        title: "Social Carousel",
        description:
            "Generate swipeable carousel posts that break down key points for Instagram and LinkedIn.",
        color: "var(--color-primary)",
    },
];

const podcastWaveHeights = Array.from({ length: 40 }, (_, i) =>
    8 + ((i * 11) % 21)
);

// Animation for mockup content
const contentVariants = {
    initial: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
    animate: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.4 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        filter: "blur(4px)",
        transition: { duration: 0.3 },
    },
};

// Animated Demo Components
function MagicClipsDemo() {
    const [progress, setProgress] = useState(0);
    const [currentClip, setCurrentClip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    setCurrentClip((c) => (c + 1) % 3);
                    return 0;
                }
                return p + 2;
            });
        }, 80);
        return () => clearInterval(interval);
    }, []);

    const clips = [
        { time: "2:34", title: "The Power of Faith" },
        { time: "8:12", title: "Finding Hope" },
        { time: "15:45", title: "Living with Purpose" },
    ];

    return (
        <div className="p-4 h-full flex flex-col">
            {/* Video Timeline */}
            <div className="bg-[var(--color-surface)] rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-[var(--color-text-light)]">
                        Analyzing sermon...
                    </span>
                </div>
                {/* Timeline */}
                <div className="relative h-12 bg-[var(--color-base)] rounded overflow-hidden">
                    {/* Waveform visualization */}
                    <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1 bg-[var(--color-primary)]/60 rounded-full"
                                animate={{
                                    height: `${20 + Math.sin(i * 0.5 + progress * 0.1) * 15}px`,
                                }}
                                transition={{ duration: 0.1 }}
                            />
                        ))}
                    </div>
                    {/* Progress indicator */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-0.5 bg-[var(--color-secondary)] z-10"
                        style={{ left: `${progress}%` }}
                    />
                    {/* Clip markers */}
                    {clips.map((clip, i) => (
                        <motion.div
                            key={i}
                            className="absolute top-0 bottom-0 w-8 bg-[var(--color-secondary)]/30 border-l-2 border-[var(--color-secondary)]"
                            style={{ left: `${20 + i * 30}%` }}
                            animate={{ opacity: currentClip === i ? 1 : 0.5 }}
                        />
                    ))}
                </div>
            </div>

            {/* Generated Clips */}
            <div className="flex-1 overflow-hidden">
                <span className="text-xs text-[var(--color-text-muted)] mb-2 block">
                    Clips Found
                </span>
                <div className="space-y-2">
                    {clips.map((clip, i) => (
                        <motion.div
                            key={i}
                            className="bg-[var(--color-surface)] rounded-lg p-3 flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: i <= currentClip ? 1 : 0.3,
                                x: 0,
                                scale: currentClip === i ? 1.02 : 1,
                            }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                                <Wand2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--color-text-light)]">
                                    {clip.title}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {clip.time}
                                </p>
                            </div>
                            {i <= currentClip && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                                >
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DiscussionGuidesDemo() {
    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleLines((v) => (v >= 5 ? 0 : v + 1));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const lines = [
        { type: "heading", text: "Discussion Questions" },
        { type: "question", text: "1. What does it mean to have faith in difficult times?" },
        { type: "question", text: "2. How can we apply today's message to our daily lives?" },
        { type: "question", text: "3. Share a time when you experienced God's presence." },
        { type: "question", text: "4. What steps can we take to grow in faith this week?" },
    ];

    return (
        <div className="p-4 h-full">
            <div className="bg-[var(--color-surface)] rounded-lg p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-[var(--color-secondary)]" />
                    <span className="text-sm font-medium text-[var(--color-text-light)]">
                        Small Group Guide
                    </span>
                </div>
                <div className="space-y-3">
                    {lines.map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: i < visibleLines ? 1 : 0,
                                y: i < visibleLines ? 0 : 10,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {line.type === "heading" ? (
                                <h4 className="text-lg font-semibold text-[var(--color-text-light)] border-b border-[var(--color-border)] pb-2">
                                    {line.text}
                                </h4>
                            ) : (
                                <p className="text-sm text-[var(--color-text-muted)] pl-2">
                                    {line.text}
                                </p>
                            )}
                        </motion.div>
                    ))}
                    {/* Typing indicator */}
                    {visibleLines < 5 && (
                        <motion.div
                            className="flex gap-1 pl-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.span
                                className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                            />
                            <motion.span
                                className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            />
                            <motion.span
                                className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ImageQuotesDemo() {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((q) => (q + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const quotes = [
        { text: "Faith is taking the first step even when you don't see the whole staircase.", bg: "from-rose-400 via-pink-500 to-purple-600" },
        { text: "God's love is the foundation of everything we do.", bg: "from-amber-400 via-orange-500 to-red-500" },
        { text: "Let your light shine before others.", bg: "from-cyan-400 via-teal-500 to-emerald-600" },
    ];

    return (
        <div className="p-4 h-full flex items-center justify-center relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-[var(--color-primary)] blur-2xl" />
                <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-[var(--color-secondary)] blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[var(--color-primary)] blur-3xl" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                    transition={{ duration: 0.5 }}
                    className={`relative rounded-2xl p-6 max-w-[240px] shadow-2xl overflow-hidden bg-gradient-to-br ${quotes[quoteIndex].bg}`}
                >
                    {/* Decorative shapes in background */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-2 w-8 h-8 rounded-full bg-white/5" />

                    {/* Quote marks */}
                    <span className="absolute top-2 left-3 text-4xl text-white/30 font-serif">
                        &ldquo;
                    </span>
                    <p className="text-white text-center text-sm font-medium leading-relaxed pt-4 relative z-10">
                        {quotes[quoteIndex].text}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 relative z-10">
                        {/* Church logo placeholder with cross */}
                        <div className="w-6 h-6 rounded bg-white/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11 2v5H6v2h5v14h2V9h5V7h-5V2z" />
                            </svg>
                        </div>
                        <span className="text-white/90 text-xs font-medium">Grace Community</span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function BlogPostDemo() {
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCharCount((c) => (c >= 200 ? 0 : c + 3));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const text = `Today's sermon explored the profound meaning of faith in our modern world. As we gathered together, Pastor shared a powerful message about finding hope in uncertain times. The scripture from Hebrews 11:1 reminds us that "faith is the substance of things hoped for..."`;

    return (
        <div className="p-4 h-full">
            <div className="bg-[var(--color-surface)] rounded-lg p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-[var(--color-success)]" />
                    <span className="text-sm font-medium text-[var(--color-text-light)]">
                        Blog Draft
                    </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-light)] mb-3">
                    Finding Faith in Uncertain Times
                </h3>
                <div className="relative">
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {text.slice(0, charCount)}
                        <motion.span
                            className="inline-block w-0.5 h-4 bg-[var(--color-primary)] ml-0.5"
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                        />
                    </p>
                </div>
            </div>
        </div>
    );
}

function PodcastDemo() {
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsPlaying((p) => !p);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 h-full flex flex-col relative">
            {/* Subtle Background with Sound Waves */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5" />
                {/* Animated sound wave rings */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-primary)]/10"
                        initial={{ width: 80, height: 80, opacity: 0.5 }}
                        animate={{
                            width: [80, 200],
                            height: [80, 200],
                            opacity: [0.3, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                        }}
                    />
                ))}
            </div>

            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center relative z-10">
                <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-2xl relative"
                >
                    {/* Album art decoration */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] shadow-inner flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[var(--color-text-muted)]" />
                    </div>
                    {/* Mic icon overlay */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center shadow-lg">
                        <Mic className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                </motion.div>
            </div>

            {/* Audio controls */}
            <div className="bg-[var(--color-surface)] rounded-lg p-4 relative z-10">
                <div className="text-center mb-3">
                    <p className="text-sm font-medium text-[var(--color-text-light)]">
                        Sunday Service Podcast
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">Episode 47</p>
                </div>

                {/* Waveform */}
                <div className="flex items-center justify-center gap-[2px] h-8 mb-3">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-[var(--color-primary)] rounded-full"
                            animate={{
                                height: isPlaying
                                    ? `${podcastWaveHeights[i]}px`
                                    : "4px",
                            }}
                            transition={{ duration: 0.15 }}
                        />
                    ))}
                </div>

                {/* Play controls */}
                <div className="flex items-center justify-center gap-4">
                    <button className="text-[var(--color-text-muted)]">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                    </button>
                    <motion.button
                        className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                        whileTap={{ scale: 0.95 }}
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </motion.button>
                    <button className="text-[var(--color-text-muted)]">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

function SocialCarouselDemo() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((s) => (s + 1) % 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const slides = [
        { title: "Key Point #1", text: "Faith moves mountains", bg: "from-rose-400 via-pink-500 to-purple-600" },
        { title: "Key Point #2", text: "Love conquers all", bg: "from-amber-400 via-orange-500 to-red-500" },
        { title: "Key Point #3", text: "Hope never fades", bg: "from-cyan-400 via-teal-500 to-emerald-600" },
        { title: "Key Point #4", text: "Grace is sufficient", bg: "from-violet-400 via-purple-500 to-indigo-600" },
    ];

    return (
        <div className="p-4 h-full flex flex-col">
            {/* Carousel */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.4 }}
                        className={`absolute inset-4 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${slides[currentSlide].bg}`}
                    >
                        {/* Decorative shapes */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/10" />
                        <div className="absolute top-1/2 right-2 w-8 h-8 rounded-full bg-white/5" />

                        <span className="text-white/70 text-xs mb-2 relative z-10">
                            {slides[currentSlide].title}
                        </span>
                        <p className="text-white text-xl font-bold text-center relative z-10">
                            {slides[currentSlide].text}
                        </p>

                        {/* Slide number indicator */}
                        <div className="absolute bottom-3 right-3 bg-black/20 rounded-full px-2 py-0.5">
                            <span className="text-white/80 text-xs">{currentSlide + 1}/4</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 py-4">
                {slides.map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        animate={{
                            backgroundColor:
                                i === currentSlide
                                    ? "var(--color-primary)"
                                    : "var(--color-text-muted)",
                            scale: i === currentSlide ? 1.2 : 1,
                        }}
                    />
                ))}
            </div>

            {/* Instagram UI */}
            <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                <div className="flex gap-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </div>
        </div>
    );
}

// Feature demo component mapping
const featureDemos: Record<string, React.ComponentType> = {
    "magic-clips": MagicClipsDemo,
    "discussion-guides": DiscussionGuidesDemo,
    "image-quotes": ImageQuotesDemo,
    "blog-posts": BlogPostDemo,
    "podcast-audio": PodcastDemo,
    "social-carousel": SocialCarouselDemo,
};

export function FeatureShowcase() {
    const [activeFeature, setActiveFeature] = useState(features[0].id);
    const [isMobile, setIsMobile] = useState(false);
    const mockupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleFeatureClick = (featureId: string) => {
        setActiveFeature(featureId);
        // On mobile, scroll to the mockup when a feature is clicked
        if (isMobile && mockupRef.current) {
            mockupRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const ActiveDemo = featureDemos[activeFeature];

    return (
        <section id="features" className="py-24 bg-[var(--color-surface)] overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-4"
                    >
                        One Sermon. Endless Content.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto"
                    >
                        Upload once, and autogenerate clips, guides, graphics, and more—all
                        with your church&apos;s branding.
                    </motion.p>
                </div>

                {/* Features Layout */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Feature Tabs */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-3 order-2 lg:order-1"
                    >
                        {features.map((feature) => {
                            const isActive = activeFeature === feature.id;
                            return (
                                <motion.button
                                    key={feature.id}
                                    onClick={() => handleFeatureClick(feature.id)}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive
                                        ? "bg-[var(--color-base)]"
                                        : "hover:bg-[var(--color-base)]/50"
                                        }`}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFeature"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]"
                                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                        />
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isActive ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" : ""
                                                }`}
                                            style={
                                                !isActive
                                                    ? { backgroundColor: `${feature.color}20` }
                                                    : undefined
                                            }
                                        >
                                            <feature.icon
                                                className="h-6 w-6"
                                                style={{ color: isActive ? "white" : feature.color }}
                                            />
                                        </div>
                                        <div>
                                            <h3
                                                className={`font-display text-lg font-semibold mb-1 transition-colors ${isActive
                                                    ? "text-[var(--color-text-light)]"
                                                    : "text-[var(--color-text-muted)]"
                                                    }`}
                                            >
                                                {feature.title}
                                            </h3>
                                            <p
                                                className={`text-sm transition-colors ${isActive
                                                    ? "text-[var(--color-text-muted)]"
                                                    : "text-[var(--color-text-muted)]/60"
                                                    }`}
                                            >
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    {/* Screen Mockup */}
                    <motion.div
                        ref={mockupRef}
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2 scroll-mt-24"
                    >
                        <ScreenMockup variant={isMobile ? "mobile" : "desktop"}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeFeature}
                                    variants={contentVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="h-full"
                                >
                                    <ActiveDemo />
                                </motion.div>
                            </AnimatePresence>
                        </ScreenMockup>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
