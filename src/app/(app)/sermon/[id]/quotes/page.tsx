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
    Share2,
    RefreshCw,
    Quote,
    Palette,
    Type,
    ChevronLeft,
    Loader2,
    Sparkles,
    Upload,
    X,
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
    shareImageBlob,
} from "@/lib/canvas-export";

// Gradient options: Tailwind classes for the live preview + hex stops for
// the canvas export so the PNG matches the preview exactly.
const gradientOptions = [
    { id: "rose", name: "Rose", bg: "from-rose-400 via-pink-500 to-purple-600", stops: ["#fb7185", "#ec4899", "#9333ea"] },
    { id: "amber", name: "Sunset", bg: "from-amber-400 via-orange-500 to-red-500", stops: ["#fbbf24", "#f97316", "#ef4444"] },
    { id: "cyan", name: "Ocean", bg: "from-cyan-400 via-teal-500 to-emerald-600", stops: ["#22d3ee", "#14b8a6", "#059669"] },
    { id: "violet", name: "Violet", bg: "from-violet-400 via-purple-500 to-indigo-600", stops: ["#a78bfa", "#a855f7", "#4f46e5"] },
    { id: "fuchsia", name: "Pink", bg: "from-fuchsia-400 via-pink-500 to-rose-500", stops: ["#e879f9", "#ec4899", "#f43f5e"] },
    { id: "blue", name: "Blue", bg: "from-blue-400 via-indigo-500 to-violet-600", stops: ["#60a5fa", "#6366f1", "#7c3aed"] },
];

const styleOptions = [
    { id: "gradient", name: "Gradient", type: "gradient" },
    { id: "minimal", name: "Minimal", type: "minimal" },
    { id: "bold", name: "Bold Dark", type: "bold" },
    { id: "light", name: "Light", type: "light" },
];

interface QuoteRenderConfig {
    text: string;
    attribution: string;
    styleId: string;
    gradientStops: string[];
    backgroundImage: HTMLImageElement | null;
}

// Render the quote graphic to a 1080x1080 canvas and return a PNG blob
async function renderQuotePng(config: QuoteRenderConfig): Promise<Blob | null> {
    const SIZE = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const useImage = Boolean(config.backgroundImage);
    let textColor = "#ffffff";
    let mutedColor = "rgba(255,255,255,0.75)";
    let decorations = false;

    // Background
    if (useImage && config.backgroundImage) {
        drawCoverImage(ctx, config.backgroundImage, SIZE);
        drawLegibilityOverlay(ctx, SIZE);
    } else if (config.styleId === "minimal") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, SIZE, SIZE);
        textColor = "#111827";
        mutedColor = "rgba(17,24,39,0.6)";
    } else if (config.styleId === "bold") {
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, SIZE, SIZE);
    } else if (config.styleId === "light") {
        const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        gradient.addColorStop(0, "#f9fafb");
        gradient.addColorStop(1, "#f3f4f6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SIZE, SIZE);
        textColor = "#1f2937";
        mutedColor = "rgba(31,41,55,0.6)";
    } else {
        // gradient (default)
        const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        config.gradientStops.forEach((stop, i) => {
            gradient.addColorStop(
                config.gradientStops.length === 1 ? 0 : i / (config.gradientStops.length - 1),
                stop
            );
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SIZE, SIZE);
        decorations = true;
    }

    // Decorative circles (gradient style only)
    if (decorations) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.arc(SIZE - 60, 50, 170, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(60, SIZE - 40, 140, 0, Math.PI * 2);
        ctx.fill();
    }

    const PAD = 120;
    const maxWidth = SIZE - PAD * 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Measure quote text, shrinking the font until it fits comfortably
    let fontSize = 62;
    let lines: string[] = [];
    for (; fontSize >= 34; fontSize -= 4) {
        ctx.font = `600 ${fontSize}px Georgia, 'Times New Roman', serif`;
        lines = wrapCanvasText(ctx, `“${config.text}”`, maxWidth);
        const lineHeight = fontSize * 1.4;
        if (lines.length * lineHeight <= SIZE - 460) break;
    }
    const lineHeight = fontSize * 1.4;
    const blockHeight = lines.length * lineHeight;

    // Quote mark
    ctx.font = "700 170px Georgia, serif";
    ctx.fillStyle = mutedColor;
    ctx.fillText("“", SIZE / 2, (SIZE - blockHeight) / 2 - 90);

    // Quote text
    ctx.font = `600 ${fontSize}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = textColor;
    let y = (SIZE - blockHeight) / 2 + lineHeight / 2;
    for (const line of lines) {
        ctx.fillText(line, SIZE / 2, y, maxWidth);
        y += lineHeight;
    }

    // Divider + attribution
    const attribution = config.attribution.trim();
    if (attribution) {
        const dividerY = Math.min(SIZE - 150, y + 30);
        ctx.strokeStyle = mutedColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(SIZE / 2 - 50, dividerY);
        ctx.lineTo(SIZE / 2 + 50, dividerY);
        ctx.stroke();

        ctx.font = "500 34px Arial, sans-serif";
        ctx.fillStyle = mutedColor;
        ctx.fillText(attribution, SIZE / 2, dividerY + 52, maxWidth);
    }

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export default function ImageQuotesPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only quote content for this page.
    const quoteContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "quote" } : "skip"
    );

    const quotes = quoteContent?.filter(c => c.status === "ready") || [];
    const processingQuotes = quoteContent?.filter(c => c.status === "processing") || [];

    const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0);
    const [selectedStyle, setSelectedStyle] = useState("gradient");
    const [selectedGradient, setSelectedGradient] = useState("rose");
    const [customText, setCustomText] = useState("");
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const isPodcast = sermon?.videoType === "podcast";
    const usingImage = Boolean(backgroundImageUrl);

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["quotes"]);
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
            toast.success("Background image applied");
        } catch {
            toast.error("Couldn't load that image");
        }
    };

    const clearImage = () => {
        backgroundImageRef.current = null;
        setBackgroundImageUrl(null);
    };

    // Loading state - skeleton
    if (sermon === undefined || quoteContent === undefined) {
        return (
            <div className="min-h-[calc(100vh-48px)] animate-pulse space-y-6">
                <div className="h-8 w-64 rounded-lg bg-[var(--color-surface)]" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="h-56 rounded-xl bg-[var(--color-surface)]" />
                        <div className="h-32 rounded-xl bg-[var(--color-surface)]" />
                    </div>
                    <div className="aspect-square rounded-xl bg-[var(--color-surface)]" />
                </div>
            </div>
        );
    }

    // Parse quote content (stored as JSON string)
    const parseQuoteContent = (content: string) => {
        try {
            const parsed = JSON.parse(content);
            return parsed.text || parsed.quote || content;
        } catch {
            return content;
        }
    };

    const selectedQuote = quotes[selectedQuoteIndex];
    const currentQuoteText = customText || (selectedQuote ? parseQuoteContent(selectedQuote.content) : "");
    const attribution = sermon?.speaker || sermon?.title || "";

    const getPreviewStyles = () => {
        const gradient = gradientOptions.find(g => g.id === selectedGradient)?.bg || gradientOptions[0].bg;

        if (usingImage) {
            return { bg: "", text: "text-white", decorations: false };
        }

        switch (selectedStyle) {
            case "minimal":
                return { bg: "bg-white", text: "text-gray-900", decorations: false };
            case "bold":
                return { bg: "bg-gray-900", text: "text-white", decorations: false };
            case "light":
                return { bg: "bg-gradient-to-br from-gray-50 to-gray-100", text: "text-gray-800", decorations: false };
            default:
                return { bg: `bg-gradient-to-br ${gradient}`, text: "text-white", decorations: true };
        }
    };

    const styles = getPreviewStyles();

    const renderCurrentQuote = async (): Promise<Blob | null> => {
        return renderQuotePng({
            text: currentQuoteText,
            attribution,
            styleId: selectedStyle,
            gradientStops: gradientOptions.find((g) => g.id === selectedGradient)?.stops || gradientOptions[0].stops,
            backgroundImage: backgroundImageRef.current,
        });
    };

    const handleDownload = async () => {
        if (!currentQuoteText) {
            toast.error("Select a quote first");
            return;
        }
        setIsExporting(true);
        try {
            const blob = await renderCurrentQuote();
            if (!blob) throw new Error("Render failed");
            downloadBlob(blob, `quote_${selectedQuoteIndex + 1}.png`);
            toast.success("Quote exported at 1080×1080");
        } catch (error) {
            console.error("Quote export failed:", error);
            toast.error("Export failed. Try a different browser if this persists.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = async () => {
        if (!currentQuoteText) {
            toast.error("Select a quote first");
            return;
        }
        setIsExporting(true);
        try {
            const blob = await renderCurrentQuote();
            if (!blob) throw new Error("Render failed");

            const result = await shareImageBlob(blob, "quote.png", currentQuoteText);
            if (result === "unsupported") {
                // No file sharing (desktop browsers): download + copy the text
                downloadBlob(blob, `quote_${selectedQuoteIndex + 1}.png`);
                await navigator.clipboard.writeText(`"${currentQuoteText}"${attribution ? ` — ${attribution}` : ""}`);
                toast.success("Image downloaded & quote text copied", {
                    description: "Sharing images directly needs a mobile browser.",
                });
            } else if (result === "failed") {
                toast.error("Sharing failed. Try downloading instead.");
            }
        } catch (error) {
            console.error("Quote share failed:", error);
            toast.error("Sharing failed. Try downloading instead.");
        } finally {
            setIsExporting(false);
        }
    };

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
                            Image Quotes
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Create shareable quote graphics from your {isPodcast ? "episode" : "sermon"}
                        </p>
                    </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate New"}
                    </Button>
                </motion.div>
            </motion.div>

            {/* No quotes state */}
            {quotes.length === 0 && processingQuotes.length === 0 && (
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 px-8 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
                        <Quote className="h-7 w-7 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No quotes yet
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
                        Pull the most shareable lines from this {isPodcast ? "episode" : "sermon"} and
                        turn them into Instagram-ready graphics.
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Quotes"}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {quotes.length === 0 && processingQuotes.length > 0 && (
                <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-8 py-14 text-center">
                    <div className="relative mx-auto mb-4 h-14 w-14">
                        <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 animate-ping" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                            <Loader2 className="h-7 w-7 text-[var(--color-primary)] animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Finding your best lines…
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Scanning the transcript for the most quotable moments
                    </p>
                </div>
            )}

            {quotes.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Quote List + Customization */}
                    <div className="space-y-4">
                        {/* Quote Selection */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                    <Quote className="h-4 w-4 text-[var(--color-primary)]" />
                                    Extracted Quotes ({quotes.length})
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {quotes.map((quote, index) => (
                                        <motion.button
                                            key={quote._id}
                                            onClick={() => {
                                                setSelectedQuoteIndex(index);
                                                setCustomText(parseQuoteContent(quote.content));
                                            }}
                                            className={`w-full text-left p-3 rounded-[var(--radius-default)] transition-all text-sm ${selectedQuoteIndex === index
                                                ? "bg-[var(--color-primary)]/20 border border-[var(--color-primary)]"
                                                : "bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/10"
                                                }`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 bg-gradient-to-r ${gradientOptions[index % gradientOptions.length].bg}`} />
                                                <div className="flex-1">
                                                    <p className="text-[var(--color-text-light)] line-clamp-2">
                                                        &quot;{parseQuoteContent(quote.content)}&quot;
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Text */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                    <Type className="h-4 w-4 text-[var(--color-secondary)]" />
                                    Edit Quote
                                </h3>
                                <textarea
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    className="w-full h-24 rounded-[var(--radius-default)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-light)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                    placeholder="Edit your quote text..."
                                />
                            </CardContent>
                        </Card>

                        {/* Style Options */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-[var(--color-success)]" />
                                    Style
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                    {styleOptions.map((style) => (
                                        <motion.button
                                            key={style.id}
                                            onClick={() => {
                                                setSelectedStyle(style.id);
                                                clearImage();
                                            }}
                                            className={`p-3 rounded-[var(--radius-default)] border-2 transition-all ${selectedStyle === style.id && !usingImage
                                                ? "border-[var(--color-primary)]"
                                                : "border-transparent hover:border-[var(--color-border)]"
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div
                                                className={`h-12 rounded-[var(--radius-sm)] mb-2 ${style.type === "gradient"
                                                    ? `bg-gradient-to-br ${gradientOptions.find(g => g.id === selectedGradient)?.bg}`
                                                    : style.type === "minimal"
                                                        ? "bg-white border border-gray-200"
                                                        : style.type === "bold"
                                                            ? "bg-gray-900"
                                                            : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100"
                                                    }`}
                                            />
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                {style.name}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Gradient selector */}
                                {selectedStyle === "gradient" && !usingImage && (
                                    <div className="space-y-2 mb-4">
                                        <label className="text-xs text-[var(--color-text-muted)]">
                                            Gradient Color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {gradientOptions.map((gradient) => (
                                                <button
                                                    key={gradient.id}
                                                    onClick={() => setSelectedGradient(gradient.id)}
                                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient.bg} ${selectedGradient === gradient.id
                                                        ? "ring-2 ring-offset-2 ring-[var(--color-primary)]"
                                                        : ""
                                                        }`}
                                                    title={gradient.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                    </div>

                    {/* Right: Preview */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="outline">1080 × 1080</Badge>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleDownload} disabled={isExporting}>
                                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleShare} disabled={isExporting}>
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {/* Preview */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${selectedQuoteIndex}-${selectedStyle}-${selectedGradient}-${usingImage}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className={`aspect-square rounded-[var(--radius-default)] ${styles.bg} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl`}
                                        style={usingImage ? {
                                            background: `linear-gradient(180deg, rgba(8,10,20,0.45) 0%, rgba(8,10,20,0.62) 55%, rgba(8,10,20,0.8) 100%), url(${backgroundImageUrl}) center/cover`,
                                        } : undefined}
                                    >
                                        {/* Decorative shapes for gradient style */}
                                        {styles.decorations && (
                                            <>
                                                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
                                                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
                                                <div className="absolute top-1/3 right-4 w-12 h-12 rounded-full bg-white/5" />
                                            </>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Quote className={`h-8 w-8 mb-4 ${styles.text} opacity-30`} />
                                        </motion.div>
                                        <motion.p
                                            className={`font-serif text-lg sm:text-xl font-semibold leading-relaxed ${styles.text} relative z-10`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            &quot;{currentQuoteText || "Select a quote to preview"}&quot;
                                        </motion.p>
                                        {attribution && (
                                            <motion.div
                                                className="mt-6 pt-4 border-t border-current/20 relative z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <p className={`text-sm ${styles.text} opacity-70`}>
                                                    {attribution}
                                                </p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button className="w-full" onClick={handleDownload} disabled={isExporting}>
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    {isExporting ? "Exporting…" : "Download Image"}
                                </Button>
                            </motion.div>
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outline" className="w-full" onClick={handleShare} disabled={isExporting}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share to Social
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
