"use client";

import { use, useRef, useState } from "react";
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
    Image as ImageIcon,
    Upload,
    X,
    Check,
    Palette,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useGenerateContent } from "@/hooks/use-generate-content";
import {
    wrapCanvasText,
    drawCoverImage,
    drawLegibilityOverlay,
    downloadBlob,
    loadImageFromFile,
} from "@/lib/canvas-export";

type CarouselSlide = {
    type?: "cover" | "quote" | "list" | "action" | "cta" | string;
    title?: string;
    subtitle?: string;
    content?: string;
};

// Curated background themes: designed gradients + solid editorial looks.
// "image" mode uses the user's own photo with a legibility overlay.
interface Theme {
    id: string;
    name: string;
    css: string;
    stops: string[];
    accent: string;
    darkText?: boolean;
}

const THEMES: Theme[] = [
    {
        id: "midnight",
        name: "Midnight",
        css: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)",
        stops: ["#0f172a", "#1e293b", "#334155"],
        accent: "#facc15",
    },
    {
        id: "royal",
        name: "Royal",
        css: "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #6d28d9 100%)",
        stops: ["#312e81", "#4c1d95", "#6d28d9"],
        accent: "#fbbf24",
    },
    {
        id: "ember",
        name: "Ember",
        css: "linear-gradient(135deg, #7c2d12 0%, #b45309 55%, #d97706 100%)",
        stops: ["#7c2d12", "#b45309", "#d97706"],
        accent: "#fef3c7",
    },
    {
        id: "forest",
        name: "Forest",
        css: "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)",
        stops: ["#064e3b", "#065f46", "#047857"],
        accent: "#a7f3d0",
    },
    {
        id: "rose",
        name: "Rose",
        css: "linear-gradient(135deg, #881337 0%, #9f1239 55%, #be123c 100%)",
        stops: ["#881337", "#9f1239", "#be123c"],
        accent: "#fecdd3",
    },
    {
        id: "paper",
        name: "Paper",
        css: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
        stops: ["#fafaf9", "#f5f5f4"],
        accent: "#b45309",
        darkText: true,
    },
];

const SLIDE_LABELS: Record<string, string> = {
    cover: "Cover",
    quote: "Quote",
    list: "Key Points",
    action: "Action",
    cta: "Call to Action",
};

// Render one slide to a 1080x1080 canvas and return a PNG blob
async function renderSlidePng(
    slide: CarouselSlide,
    theme: Theme,
    backgroundImage: HTMLImageElement | null,
    index: number,
    total: number
): Promise<Blob | null> {
    const SIZE = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const useImage = Boolean(backgroundImage);
    const darkText = !useImage && Boolean(theme.darkText);

    // Background
    if (useImage && backgroundImage) {
        drawCoverImage(ctx, backgroundImage, SIZE);
        drawLegibilityOverlay(ctx, SIZE);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        const stops = theme.stops;
        stops.forEach((stop, i) => {
            gradient.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), stop);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SIZE, SIZE);

        // Subtle decorative circles
        ctx.fillStyle = darkText ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.arc(SIZE - 80, 60, 190, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(70, SIZE - 60, 150, 0, Math.PI * 2);
        ctx.fill();
    }

    const textColor = darkText ? "#1c1917" : "#ffffff";
    const mutedColor = darkText ? "rgba(28,25,23,0.65)" : "rgba(255,255,255,0.75)";
    const accent = theme.accent;
    const PAD = 110;
    const maxWidth = SIZE - PAD * 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const drawCentered = (
        blocks: Array<{ text: string; font: string; color: string; lineHeight: number; spacingAfter?: number }>
    ) => {
        // Measure total height
        const measured = blocks.map((block) => {
            ctx.font = block.font;
            const lines = wrapCanvasText(ctx, block.text, maxWidth);
            return { ...block, lines, height: lines.length * block.lineHeight };
        });
        const totalHeight = measured.reduce(
            (sum, b) => sum + b.height + (b.spacingAfter ?? 0),
            0
        );
        let y = (SIZE - totalHeight) / 2;

        for (const block of measured) {
            ctx.font = block.font;
            ctx.fillStyle = block.color;
            for (const line of block.lines) {
                ctx.fillText(line, SIZE / 2, y + block.lineHeight / 2, maxWidth);
                y += block.lineHeight;
            }
            y += block.spacingAfter ?? 0;
        }
    };

    const type = slide.type || "quote";

    if (type === "cover" || type === "cta") {
        drawCentered([
            {
                text: (slide.title || "").toUpperCase(),
                font: "800 76px Georgia, 'Times New Roman', serif",
                color: textColor,
                lineHeight: 92,
                spacingAfter: 30,
            },
            ...(slide.subtitle
                ? [{
                    text: slide.subtitle,
                    font: "400 40px Arial, sans-serif",
                    color: mutedColor,
                    lineHeight: 56,
                }]
                : []),
        ]);
        // Accent rule
        ctx.fillStyle = accent;
        ctx.fillRect(SIZE / 2 - 60, SIZE - 170, 120, 8);
    } else if (type === "quote") {
        // Big quotation mark
        ctx.font = "700 200px Georgia, serif";
        ctx.fillStyle = accent;
        ctx.fillText("“", SIZE / 2, 190);
        drawCentered([
            {
                text: slide.content || "",
                font: "600 56px Georgia, serif",
                color: textColor,
                lineHeight: 78,
            },
        ]);
    } else {
        // list / action - left aligned reads better for multi-line
        ctx.textAlign = "left";
        ctx.font = "700 34px Arial, sans-serif";
        ctx.fillStyle = accent;
        ctx.fillText((SLIDE_LABELS[type] || type).toUpperCase(), PAD, 170);

        ctx.font = "500 44px Arial, sans-serif";
        const lines = wrapCanvasText(ctx, slide.content || slide.title || "", maxWidth);
        const lineHeight = 66;
        let y = 280;
        ctx.fillStyle = textColor;
        for (const line of lines) {
            if (y > SIZE - 160) break;
            ctx.fillText(line, PAD, y, maxWidth);
            y += lineHeight;
        }
        ctx.textAlign = "center";
    }

    // Slide progress dots
    const dotY = SIZE - 70;
    const dotGap = 26;
    const dotsWidth = (total - 1) * dotGap;
    for (let i = 0; i < total; i++) {
        ctx.beginPath();
        ctx.arc(SIZE / 2 - dotsWidth / 2 + i * dotGap, dotY, i === index ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = i === index ? accent : (darkText ? "rgba(28,25,23,0.3)" : "rgba(255,255,255,0.4)");
        ctx.fill();
    }

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export default function SocialCarouselPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only carousel content for this page.
    const carouselContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "carousel" } : "skip"
    );

    const carousel = carouselContent?.find(c => c.status === "ready");
    const isProcessing = carouselContent?.some(c => c.status === "processing");

    const [currentSlide, setCurrentSlide] = useState(0);
    const [themeId, setThemeId] = useState<string>(THEMES[0].id);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
    const usingImage = Boolean(backgroundImageUrl);
    const darkText = !usingImage && Boolean(theme.darkText);

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const isPodcast = sermon?.videoType === "podcast";

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["carousel"]);
        }
    };

    // Parse content
    const parseContent = (content: string): CarouselSlide[] => {
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed.slides) ? parsed.slides : [];
        } catch {
            return [];
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            toast.error("Image must be under 15MB");
            return;
        }
        try {
            const { image, dataUrl } = await loadImageFromFile(file);
            backgroundImageRef.current = image;
            setBackgroundImageUrl(dataUrl);
            toast.success("Background image applied to all slides");
        } catch {
            toast.error("Couldn't load that image");
        }
    };

    const clearImage = () => {
        backgroundImageRef.current = null;
        setBackgroundImageUrl(null);
    };

    // Loading state - skeleton
    if (sermon === undefined || carouselContent === undefined) {
        return (
            <div className="min-h-[calc(100vh-48px)] animate-pulse space-y-6">
                <div className="h-8 w-72 rounded-lg bg-[var(--color-surface)]" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-80 rounded-xl bg-[var(--color-surface)]" />
                    <div className="lg:col-span-2 aspect-square max-w-md mx-auto w-full rounded-xl bg-[var(--color-surface)]" />
                </div>
            </div>
        );
    }

    const slides = carousel ? parseContent(carousel.content) : [];

    const goToSlide = (index: number) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlide(index);
        }
    };

    const handleExport = async (only?: number) => {
        if (slides.length === 0) return;
        setIsExporting(true);
        try {
            const indices = only !== undefined ? [only] : slides.map((_, i) => i);
            for (const i of indices) {
                const blob = await renderSlidePng(
                    slides[i],
                    theme,
                    backgroundImageRef.current,
                    i,
                    slides.length
                );
                if (!blob) continue;
                downloadBlob(blob, `carousel_slide_${i + 1}.png`);
                // Give the browser a beat between downloads
                if (indices.length > 1) await new Promise((r) => setTimeout(r, 350));
            }
            toast.success(
                indices.length > 1
                    ? `Exported ${indices.length} slides at 1080×1080`
                    : "Slide exported at 1080×1080"
            );
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export failed. Try a different browser if this persists.");
        } finally {
            setIsExporting(false);
        }
    };

    const slide = slides[currentSlide];

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
                            Swipeable carousel for Instagram &amp; LinkedIn, generated from your {isPodcast ? "episode" : "sermon"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
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
                    <Button size="sm" onClick={() => handleExport()} disabled={isExporting || slides.length === 0}>
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        {isExporting ? "Exporting…" : "Export All"}
                    </Button>
                </div>
            </motion.div>

            {/* No content state */}
            {slides.length === 0 && !isProcessing && (
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-8 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
                        <ImageIcon className="h-7 w-7 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No carousel yet
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
                        Turn this {isPodcast ? "episode" : "sermon"} into a 5-slide swipeable post —
                        cover, key quote, takeaways, action step, and call to action.
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
                <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-8 py-14 text-center">
                    <div className="relative mx-auto mb-4 h-14 w-14">
                        <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 animate-ping" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                            <Loader2 className="h-7 w-7 text-[var(--color-primary)] animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Writing your carousel…
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Pulling the strongest quote and takeaways from the transcript
                    </p>
                </div>
            )}

            {/* Content */}
            {slides.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: slides + design controls */}
                    <motion.div
                        className="lg:col-span-1 order-2 lg:order-1 space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Design panel */}
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <h3 className="flex items-center gap-2 font-semibold text-[var(--color-text-light)]">
                                    <Palette className="h-4 w-4 text-[var(--color-primary)]" />
                                    Design
                                </h3>

                                {/* Theme swatches */}
                                <div>
                                    <p className="text-xs text-[var(--color-text-muted)] mb-2">Theme</p>
                                    <div className="grid grid-cols-6 gap-2">
                                        {THEMES.map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                title={t.name}
                                                onClick={() => setThemeId(t.id)}
                                                className={`relative aspect-square rounded-lg border-2 transition-all ${themeId === t.id && !usingImage
                                                    ? "border-[var(--color-primary)] scale-105"
                                                    : "border-transparent hover:scale-105"
                                                    }`}
                                                style={{ background: t.css }}
                                            >
                                                {themeId === t.id && !usingImage && (
                                                    <Check className={`absolute inset-0 m-auto h-4 w-4 ${t.darkText ? "text-stone-800" : "text-white"}`} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* User image background */}
                                <div>
                                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                                        Your own background
                                    </p>
                                    {backgroundImageUrl ? (
                                        <div className="relative overflow-hidden rounded-lg">
                                            <img
                                                src={backgroundImageUrl}
                                                alt="Custom background"
                                                className="h-20 w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                    Replace
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={clearImage}>
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] px-3 py-3 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/60 hover:text-[var(--color-text-light)] transition-colors"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Upload a photo (church, studio, speaker…)
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                            e.target.value = "";
                                        }}
                                    />
                                    <p className="mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                                        We add a dark overlay automatically so text stays readable.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Slide list */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[var(--color-text-light)]">
                                        Slides ({slides.length})
                                    </h3>
                                </div>
                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                                    {slides.map((s, index) => (
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
                                            <div
                                                className="h-9 w-9 shrink-0 rounded-md"
                                                style={{
                                                    background: usingImage
                                                        ? `url(${backgroundImageUrl}) center/cover`
                                                        : theme.css,
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {SLIDE_LABELS[s.type || ""] || s.type}
                                                    </Badge>
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        {index + 1}/{slides.length}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[var(--color-text-light)] line-clamp-1">
                                                    {s.title || `${s.content?.slice(0, 40) || "Slide"}`}
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
                                    <Badge variant="outline">1080 × 1080</Badge>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-[var(--color-text-muted)]">
                                            {currentSlide + 1} / {slides.length}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleExport(currentSlide)}
                                            disabled={isExporting}
                                        >
                                            <Download className="h-4 w-4 mr-1.5" />
                                            This slide
                                        </Button>
                                    </div>
                                </div>

                                {/* Slide Preview */}
                                <div className="relative">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${currentSlide}-${themeId}-${usingImage}`}
                                            initial={{ opacity: 0, x: 60 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -60 }}
                                            transition={{ duration: 0.25 }}
                                            className="aspect-square max-w-md mx-auto rounded-[var(--radius-default)] p-8 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl"
                                            style={{
                                                background: usingImage
                                                    ? `linear-gradient(180deg, rgba(8,10,20,0.45) 0%, rgba(8,10,20,0.62) 55%, rgba(8,10,20,0.8) 100%), url(${backgroundImageUrl}) center/cover`
                                                    : theme.css,
                                            }}
                                        >
                                            {/* Decorative shapes (non-image themes only) */}
                                            {!usingImage && (
                                                <>
                                                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${darkText ? "bg-black/5" : "bg-white/10"}`} />
                                                    <div className={`absolute -bottom-8 -left-8 w-28 h-28 rounded-full ${darkText ? "bg-black/5" : "bg-white/10"}`} />
                                                </>
                                            )}

                                            {(slide?.type === "cover" || slide?.type === "cta") && (
                                                <>
                                                    <motion.h2
                                                        className={`font-display text-xl sm:text-3xl font-extrabold uppercase tracking-tight mb-3 relative z-10 ${darkText ? "text-stone-900" : "text-white"}`}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.15 }}
                                                    >
                                                        {slide?.title}
                                                    </motion.h2>
                                                    {slide?.subtitle && (
                                                        <motion.p
                                                            className={`text-sm sm:text-base relative z-10 ${darkText ? "text-stone-600" : "text-white/85"}`}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.25 }}
                                                        >
                                                            {slide?.subtitle}
                                                        </motion.p>
                                                    )}
                                                    <div
                                                        className="absolute bottom-10 left-1/2 -translate-x-1/2 h-1.5 w-16 rounded-full"
                                                        style={{ backgroundColor: theme.accent }}
                                                    />
                                                </>
                                            )}

                                            {slide?.type === "quote" && (
                                                <>
                                                    <span
                                                        className="font-serif text-7xl leading-none relative z-10"
                                                        style={{ color: theme.accent }}
                                                    >
                                                        “
                                                    </span>
                                                    <motion.p
                                                        className={`font-serif text-base sm:text-xl font-medium leading-relaxed relative z-10 ${darkText ? "text-stone-900" : "text-white"}`}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.15 }}
                                                    >
                                                        {slide?.content}
                                                    </motion.p>
                                                </>
                                            )}

                                            {(slide?.type === "list" || slide?.type === "action") && (
                                                <div className="w-full text-left relative z-10">
                                                    <p
                                                        className="text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-3"
                                                        style={{ color: theme.accent }}
                                                    >
                                                        {SLIDE_LABELS[slide.type]}
                                                    </p>
                                                    <motion.p
                                                        className={`text-sm sm:text-lg font-medium leading-relaxed whitespace-pre-line ${darkText ? "text-stone-900" : "text-white"}`}
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.15 }}
                                                    >
                                                        {slide?.content}
                                                    </motion.p>
                                                </div>
                                            )}

                                            {/* Progress dots */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {slides.map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded-full transition-all"
                                                        style={{
                                                            width: i === currentSlide ? 8 : 5,
                                                            height: i === currentSlide ? 8 : 5,
                                                            backgroundColor: i === currentSlide
                                                                ? theme.accent
                                                                : darkText ? "rgba(28,25,23,0.3)" : "rgba(255,255,255,0.4)",
                                                        }}
                                                    />
                                                ))}
                                            </div>
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
                                    {slides.map((_, index) => (
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
