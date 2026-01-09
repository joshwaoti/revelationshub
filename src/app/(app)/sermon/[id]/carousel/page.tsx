"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Sparkles,
    Image,
    GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useGenerateContent } from "@/hooks/use-generate-content";

// Gradient options for slides
const gradientOptions = [
    "from-rose-400 via-pink-500 to-purple-600",
    "from-amber-400 via-orange-500 to-red-500",
    "from-cyan-400 via-teal-500 to-emerald-600",
    "from-violet-400 via-purple-500 to-indigo-600",
    "from-fuchsia-400 via-pink-500 to-rose-500",
    "from-blue-400 via-indigo-500 to-purple-600",
    "from-green-400 via-emerald-500 to-teal-600",
];

export default function SocialCarouselPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch generated content
    const generatedContent = useQuery(
        api.generatedContent.getBySermon,
        sermon?._id ? { sermonId: sermon._id } : "skip"
    );

    const carousel = generatedContent?.find(c => c.type === "carousel" && c.status === "ready");
    const isProcessing = generatedContent?.some(c => c.type === "carousel" && c.status === "processing");

    const [currentSlide, setCurrentSlide] = useState(0);

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["carousel"]);
        }
    };

    // Parse content
    const parseContent = (content: string) => {
        try {
            const parsed = JSON.parse(content);
            return parsed.slides || [];
        } catch {
            return [];
        }
    };

    // Loading state
    if (sermon === undefined || generatedContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const slides = carousel ? parseContent(carousel.content) : [];

    const goToSlide = (index: number) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlide(index);
        }
    };

    const currentBg = gradientOptions[currentSlide % gradientOptions.length];

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <motion.div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <Link href={`/sermon/${sermonId}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                            Social Carousel
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Create swipeable carousels for Instagram & LinkedIn
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            {isGenerating ? "Generating..." : "Regenerate"}
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

            {/* No content state */}
            {slides.length === 0 && !isProcessing && (
                <div className="text-center py-16">
                    <Image className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No Carousel Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Create a social media carousel from your sermon
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Carousel"}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && slides.length === 0 && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating Carousel...
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        This may take a few moments
                    </p>
                </div>
            )}

            {/* Content */}
            {slides.length > 0 && (
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
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {slides.map((slide: any, index: number) => (
                                        <motion.button
                                            key={index}
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
                                            <GripVertical className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                                            <div className={`w-3 h-3 rounded-full shrink-0 bg-gradient-to-r ${gradientOptions[index % gradientOptions.length]}`} />
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
                                                        className="text-lg sm:text-2xl font-bold text-white mb-3 relative z-10"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        {slides[currentSlide]?.title}
                                                    </motion.h2>
                                                    <motion.p
                                                        className="text-white/90 text-sm sm:text-base relative z-10"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        {slides[currentSlide]?.subtitle}
                                                    </motion.p>
                                                </>
                                            )}

                                            {(slides[currentSlide]?.type === "quote" ||
                                                slides[currentSlide]?.type === "list" ||
                                                slides[currentSlide]?.type === "action") && (
                                                    <motion.p
                                                        className="text-white text-sm sm:text-lg font-medium leading-relaxed whitespace-pre-line relative z-10"
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        {slides[currentSlide]?.content}
                                                    </motion.p>
                                                )}

                                            {slides[currentSlide]?.type === "cta" && (
                                                <>
                                                    <motion.h2
                                                        className="text-lg sm:text-2xl font-bold text-white mb-3 relative z-10"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        {slides[currentSlide]?.title}
                                                    </motion.h2>
                                                    <motion.p
                                                        className="text-white/90 text-sm sm:text-base relative z-10"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        {slides[currentSlide]?.subtitle}
                                                    </motion.p>
                                                </>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Navigation Arrows */}
                                    <motion.button
                                        onClick={() => goToSlide(currentSlide - 1)}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-[var(--color-base)] shadow-lg flex items-center justify-center disabled:opacity-50"
                                        disabled={currentSlide === 0}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <ChevronLeft className="h-5 w-5 text-[var(--color-text-light)]" />
                                    </motion.button>
                                    <motion.button
                                        onClick={() => goToSlide(currentSlide + 1)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-[var(--color-base)] shadow-lg flex items-center justify-center disabled:opacity-50"
                                        disabled={currentSlide === slides.length - 1}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <ChevronRight className="h-5 w-5 text-[var(--color-text-light)]" />
                                    </motion.button>
                                </div>

                                {/* Slide dots */}
                                <div className="flex justify-center gap-2 mt-4">
                                    {slides.map((_: any, index: number) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-2 rounded-full transition-all ${currentSlide === index
                                                ? "w-6 bg-[var(--color-primary)]"
                                                : "w-2 bg-[var(--color-text-muted)]/30"
                                                }`}
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
