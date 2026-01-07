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
    Quote,
    Palette,
    Type,
} from "lucide-react";

// Mock quotes data with colorful gradients matching the landing page
const quotes = [
    {
        id: 1,
        text: "Peace is not the absence of chaos, but the presence of God in the midst of it.",
        timestamp: "14:23",
        bg: "from-rose-400 via-pink-500 to-purple-600",
    },
    {
        id: 2,
        text: "When we surrender control, we gain freedom.",
        timestamp: "22:15",
        bg: "from-amber-400 via-orange-500 to-red-500",
    },
    {
        id: 3,
        text: "The storm may rage, but the anchor holds.",
        timestamp: "28:40",
        bg: "from-cyan-400 via-teal-500 to-emerald-600",
    },
    {
        id: 4,
        text: "Faith isn't feeling better, it's trusting deeper.",
        timestamp: "35:12",
        bg: "from-violet-400 via-purple-500 to-indigo-600",
    },
    {
        id: 5,
        text: "God's love is the foundation of everything we do.",
        timestamp: "41:08",
        bg: "from-fuchsia-400 via-pink-500 to-rose-500",
    },
    {
        id: 6,
        text: "Let your light shine before others.",
        timestamp: "48:22",
        bg: "from-blue-400 via-indigo-500 to-violet-600",
    },
];

const styleOptions = [
    { id: "gradient", name: "Gradient", type: "gradient" },
    { id: "minimal", name: "Minimal", type: "minimal" },
    { id: "bold", name: "Bold Dark", type: "bold" },
    { id: "light", name: "Light", type: "light" },
];

export default function ImageQuotesPage() {
    const [selectedQuote, setSelectedQuote] = useState(quotes[0]);
    const [selectedStyle, setSelectedStyle] = useState("gradient");
    const [customText, setCustomText] = useState("");

    const getPreviewStyles = () => {
        switch (selectedStyle) {
            case "minimal":
                return {
                    bg: "bg-white",
                    text: "text-gray-900",
                    decorations: false,
                };
            case "bold":
                return {
                    bg: "bg-gray-900",
                    text: "text-white",
                    decorations: false,
                };
            case "light":
                return {
                    bg: "bg-gradient-to-br from-gray-50 to-gray-100",
                    text: "text-gray-800",
                    decorations: false,
                };
            default:
                return {
                    bg: `bg-gradient-to-br ${selectedQuote.bg}`,
                    text: "text-white",
                    decorations: true,
                };
        }
    };

    const styles = getPreviewStyles();

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
                        Image Quotes
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Create shareable quote graphics from your sermon
                    </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate New
                    </Button>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Quote List + Customization */}
                <div className="space-y-4">
                    {/* Quote Selection */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                <Quote className="h-4 w-4 text-[var(--color-primary)]" />
                                Extracted Quotes
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {quotes.map((quote, index) => (
                                    <motion.button
                                        key={quote.id}
                                        onClick={() => {
                                            setSelectedQuote(quote);
                                            setCustomText(quote.text);
                                        }}
                                        className={`w-full text-left p-3 rounded-[var(--radius-default)] transition-all text-sm ${selectedQuote?.id === quote.id
                                            ? "bg-[var(--color-primary)]/20 border border-[var(--color-primary)]"
                                            : "bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/10"
                                            }`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 bg-gradient-to-r ${quote.bg}`} />
                                            <div className="flex-1">
                                                <p className="text-[var(--color-text-light)] line-clamp-2">
                                                    &quot;{quote.text}&quot;
                                                </p>
                                                <span className="text-xs text-[var(--color-text-muted)] font-mono">
                                                    @ {quote.timestamp}
                                                </span>
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
                                value={customText || selectedQuote?.text || ""}
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {styleOptions.map((style) => (
                                    <motion.button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`p-3 rounded-[var(--radius-default)] border-2 transition-all ${selectedStyle === style.id
                                            ? "border-[var(--color-primary)]"
                                            : "border-transparent hover:border-[var(--color-border)]"
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className={`h-12 rounded-[var(--radius-sm)] mb-2 ${style.type === "gradient"
                                            ? `bg-gradient-to-br ${selectedQuote.bg}`
                                            : style.type === "minimal"
                                                ? "bg-white border border-gray-200"
                                                : style.type === "bold"
                                                    ? "bg-gray-900"
                                                    : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100"
                                            }`} />
                                        <span className="text-xs text-[var(--color-text-muted)]">{style.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Preview */}
                <div className="space-y-4">
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="outline">1:1 Instagram</Badge>
                                <div className="flex gap-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" size="sm">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                            {/* Preview */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedQuote.id + selectedStyle}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className={`aspect-square rounded-[var(--radius-default)] ${styles.bg} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl`}
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
                                        className={`text-lg sm:text-xl font-semibold leading-relaxed ${styles.text} relative z-10`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        &quot;{customText || selectedQuote?.text}&quot;
                                    </motion.p>
                                    <motion.div
                                        className="mt-6 pt-4 border-t border-current/20 w-full relative z-10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center ${styles.decorations ? "bg-white/30" : "bg-gray-200"}`}>
                                                <svg className={`w-4 h-4 ${styles.text}`} fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11 2v5H6v2h5v14h2V9h5V7h-5V2z" />
                                                </svg>
                                            </div>
                                            <p className={`text-sm ${styles.text} ${styles.decorations ? "" : "opacity-70"}`}>
                                                Grace Community Church
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Download Image
                            </Button>
                        </motion.div>
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="outline" className="w-full">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share to Social
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
