"use client";

import { useState } from "react";
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

// Mock carousel slides
const initialSlides = [
    {
        id: 1,
        title: "Finding Peace in Chaos",
        subtitle: "Key Takeaways from Sunday's Message",
        type: "cover",
    },
    {
        id: 2,
        content: "Peace is not the absence of chaos, but the presence of God in the midst of it.",
        type: "quote",
    },
    {
        id: 3,
        content: "Three steps to finding inner peace:\n\n1. Acknowledge the storm\n2. Anchor in faith\n3. Act with intention",
        type: "list",
    },
    {
        id: 4,
        content: "When we surrender control, we gain freedom. This week, practice letting go of one thing you can't control.",
        type: "action",
    },
    {
        id: 5,
        title: "Join us next Sunday",
        subtitle: "Continuing our series on Inner Strength",
        type: "cta",
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

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Social Carousel
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Create swipeable carousels for Instagram & LinkedIn
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>
                    <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Slide List - Left */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[var(--color-text-light)]">
                                    Slides ({slides.length})
                                </h3>
                                <Button variant="ghost" size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-default)] transition-all text-left ${currentSlide === index
                                                ? "bg-[var(--color-primary)]/20 border border-[var(--color-primary)]"
                                                : "bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/10"
                                            }`}
                                    >
                                        <GripVertical className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Delete slide logic
                                            }}
                                            className="p-1 text-[var(--color-text-muted)] hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview - Right */}
                <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
                    <Card className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="ai">1:1 Carousel</Badge>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--color-text-muted)]">
                                        {currentSlide + 1} / {slides.length}
                                    </span>
                                </div>
                            </div>

                            {/* Slide Preview */}
                            <div className="relative">
                                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-default)] p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />

                                    {slides[currentSlide]?.type === "cover" && (
                                        <>
                                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 relative z-10">
                                                {slides[currentSlide].title}
                                            </h2>
                                            <p className="text-sm text-white/80 relative z-10">
                                                {slides[currentSlide].subtitle}
                                            </p>
                                            <div className="absolute bottom-6 flex gap-1.5">
                                                {slides.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-4 bg-white" : "w-1.5 bg-white/40"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {slides[currentSlide]?.type === "quote" && (
                                        <p className="text-lg sm:text-xl font-semibold text-white relative z-10">
                                            &quot;{slides[currentSlide].content}&quot;
                                        </p>
                                    )}

                                    {slides[currentSlide]?.type === "list" && (
                                        <div className="text-left text-white relative z-10 whitespace-pre-line text-sm sm:text-base">
                                            {slides[currentSlide].content}
                                        </div>
                                    )}

                                    {slides[currentSlide]?.type === "action" && (
                                        <p className="text-base sm:text-lg text-white relative z-10">
                                            {slides[currentSlide].content}
                                        </p>
                                    )}

                                    {slides[currentSlide]?.type === "cta" && (
                                        <>
                                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 relative z-10">
                                                {slides[currentSlide].title}
                                            </h2>
                                            <p className="text-sm text-white/80 relative z-10">
                                                {slides[currentSlide].subtitle}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => goToSlide(currentSlide - 1)}
                                    disabled={currentSlide === 0}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-light)] disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => goToSlide(currentSlide + 1)}
                                    disabled={currentSlide === slides.length - 1}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-surface)] text-[var(--color-text-light)] disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download All Slides
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Share2 className="h-4 w-4 mr-2" />
                            Schedule Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
