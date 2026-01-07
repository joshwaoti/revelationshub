"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Download,
    Share2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Plus,
    GripVertical,
    Trash2,
} from "lucide-react";

// Mock carousel slides with colorful gradients
const initialSlides = [
    {
        id: 1,
        title: "Finding Peace in Chaos",
        subtitle: "Key Takeaways from Sunday's Message",
        type: "cover",
        bg: "from-rose-400 via-pink-500 to-purple-600",
    },
    {
        id: 2,
        content: "Peace is not the absence of chaos, but the presence of God in the midst of it.",
        type: "quote",
        bg: "from-amber-400 via-orange-500 to-red-500",
    },
    {
        id: 3,
        content: "Three steps to finding inner peace:\n\n1. Acknowledge the storm\n2. Anchor in faith\n3. Act with intention",
        type: "list",
        bg: "from-cyan-400 via-teal-500 to-emerald-600",
    },
    {
        id: 4,
        content: "When we surrender control, we gain freedom. This week, practice letting go of one thing you can't control.",
        type: "action",
        bg: "from-violet-400 via-purple-500 to-indigo-600",
    },
    {
        id: 5,
        title: "Join us next Sunday",
        subtitle: "Continuing our series on Inner Strength",
        type: "cta",
        bg: "from-fuchsia-400 via-pink-500 to-rose-500",
    },
];

export default function SocialCarouselPage() {
    const [slides, setSlides] = useState(initialSlides);
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToSlide = (index: number) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlide(index);
        }
    };

    const currentBg = slides[currentSlide]?.bg || "from-[var(--color-primary)] to-[var(--color-secondary)]";

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <motion.div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Social Carousel
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Create swipeable carousels for Instagram & LinkedIn
                    </p>
                </div>
                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Slide List - Left */}
                <motion.div
                    className="lg:col-span-1 order-2 lg:order-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[var(--color-text-light)]">
                                    Slides ({slides.length})
                                </h3>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {slides.map((slide, index) => (
                                    <motion.button
                                        key={slide.id}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-default)] transition-all text-left ${currentSlide === index
                                            ? "bg-[var(--color-primary)]/20 border border-[var(--color-primary)]"
                                            : "bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/10"
                                            }`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <GripVertical className="h-4 w-4 text-[var(--color-text-muted)] shrink-0 cursor-grab" />
                                        <div className={`w-3 h-3 rounded-full shrink-0 bg-gradient-to-r ${slide.bg}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {slide.type}
                                                </Badge>
                                                <span className="text-xs text-[var(--color-text-muted)]">
                                                    {index + 1}/{slides.length}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-light)] line-clamp-1">
                                                {slide.title || slide.content?.slice(0, 30) + "..."}
                                            </p>
                                        </div>
                                        <motion.button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            className="p-1 text-[var(--color-text-muted)] hover:text-red-500"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                    </motion.button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Preview - Right */}
                <motion.div
                    className="lg:col-span-2 order-1 lg:order-2 space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="outline">1:1 Carousel</Badge>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--color-text-muted)]">
                                        {currentSlide + 1} / {slides.length}
                                    </span>
                                </div>
                            </div>

                            {/* Slide Preview */}
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.3 }}
                                        className={`aspect-square max-w-md mx-auto bg-gradient-to-br ${currentBg} rounded-[var(--radius-default)] p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl`}
                                    >
                                        {/* Decorative shapes */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
                                        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
                                        <div className="absolute top-1/3 right-4 w-12 h-12 rounded-full bg-white/5" />

                                        {slides[currentSlide]?.type === "cover" && (
                                            <>
                                                <motion.h2
                                                    className="text-xl sm:text-2xl font-bold text-white mb-2 relative z-10"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    {slides[currentSlide].title}
                                                </motion.h2>
                                                <motion.p
                                                    className="text-sm text-white/80 relative z-10"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    {slides[currentSlide].subtitle}
                                                </motion.p>
                                                <div className="absolute bottom-6 flex gap-1.5">
                                                    {slides.map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-4 bg-white" : "w-1.5 bg-white/40"
                                                                }`}
                                                            whileHover={{ scale: 1.2 }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {slides[currentSlide]?.type === "quote" && (
                                            <motion.p
                                                className="text-lg sm:text-xl font-semibold text-white relative z-10"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                &quot;{slides[currentSlide].content}&quot;
                                            </motion.p>
                                        )}

                                        {slides[currentSlide]?.type === "list" && (
                                            <motion.div
                                                className="text-left text-white relative z-10 whitespace-pre-line text-sm sm:text-base"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                {slides[currentSlide].content}
                                            </motion.div>
                                        )}

                                        {slides[currentSlide]?.type === "action" && (
                                            <motion.p
                                                className="text-base sm:text-lg text-white relative z-10"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                {slides[currentSlide].content}
                                            </motion.p>
                                        )}

                                        {slides[currentSlide]?.type === "cta" && (
                                            <>
                                                <motion.h2
                                                    className="text-xl sm:text-2xl font-bold text-white mb-4 relative z-10"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    {slides[currentSlide].title}
                                                </motion.h2>
                                                <motion.p
                                                    className="text-sm text-white/80 relative z-10"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    {slides[currentSlide].subtitle}
                                                </motion.p>
                                            </>
                                        )}

                                        {/* Slide number indicator */}
                                        <div className="absolute bottom-3 right-3 bg-black/20 rounded-full px-2 py-0.5">
                                            <span className="text-white/80 text-xs">{currentSlide + 1}/{slides.length}</span>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                <motion.button
                                    onClick={() => goToSlide(currentSlide - 1)}
                                    disabled={currentSlide === 0}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-light)] disabled:opacity-30 shadow-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    onClick={() => goToSlide(currentSlide + 1)}
                                    disabled={currentSlide === slides.length - 1}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-light)] disabled:opacity-30 shadow-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Download All Slides
                            </Button>
                        </motion.div>
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="outline" className="w-full">
                                <Share2 className="h-4 w-4 mr-2" />
                                Schedule Post
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
