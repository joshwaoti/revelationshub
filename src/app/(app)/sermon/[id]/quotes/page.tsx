"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Download,
    Share2,
    RefreshCw,
    Quote,
    Palette,
    Type,
} from "lucide-react";

// Mock quotes data
const quotes = [
    {
        id: 1,
        text: "Peace is not the absence of chaos, but the presence of God in the midst of it.",
        timestamp: "14:23",
        style: "minimal",
    },
    {
        id: 2,
        text: "When we surrender control, we gain freedom.",
        timestamp: "22:15",
        style: "gradient",
    },
    {
        id: 3,
        text: "The storm may rage, but the anchor holds.",
        timestamp: "28:40",
        style: "minimal",
    },
    {
        id: 4,
        text: "Faith isn't feeling better, it's trusting deeper.",
        timestamp: "35:12",
        style: "bold",
    },
];

const styleOptions = [
    { id: "minimal", name: "Minimal", bg: "bg-white", text: "text-gray-900" },
    { id: "gradient", name: "Gradient", bg: "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]", text: "text-white" },
    { id: "bold", name: "Bold", bg: "bg-[var(--color-base)]", text: "text-[var(--color-text-light)]" },
    { id: "brand", name: "Brand", bg: "bg-blue-600", text: "text-white" },
];

export default function ImageQuotesPage() {
    const [selectedQuote, setSelectedQuote] = useState(quotes[0]);
    const [selectedStyle, setSelectedStyle] = useState("minimal");
    const [customText, setCustomText] = useState("");

    const currentStyle = styleOptions.find(s => s.id === selectedStyle) || styleOptions[0];

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Image Quotes
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Create shareable quote graphics from your sermon
                    </p>
                </div>
                <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Quote List + Customization */}
                <div className="space-y-4">
                    {/* Quote Selection */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-[var(--color-text-light)] mb-3 flex items-center gap-2">
                                <Quote className="h-4 w-4 text-[var(--color-primary)]" />
                                AI-Extracted Quotes
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {quotes.map((quote) => (
                                    <button
                                        key={quote.id}
                                        onClick={() => {
                                            setSelectedQuote(quote);
                                            setCustomText(quote.text);
                                        }}
                                        className={`w-full text-left p-3 rounded-[var(--radius-default)] transition-all text-sm ${selectedQuote?.id === quote.id
                                                ? "bg-[var(--color-primary)]/20 border border-[var(--color-primary)]"
                                                : "bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/10"
                                            }`}
                                    >
                                        <p className="text-[var(--color-text-light)] line-clamp-2">
                                            &quot;{quote.text}&quot;
                                        </p>
                                        <span className="text-xs text-[var(--color-text-muted)] font-mono">
                                            @ {quote.timestamp}
                                        </span>
                                    </button>
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
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`p-3 rounded-[var(--radius-default)] border-2 transition-all ${selectedStyle === style.id
                                                ? "border-[var(--color-primary)]"
                                                : "border-transparent"
                                            }`}
                                    >
                                        <div className={`h-12 rounded-[var(--radius-sm)] ${style.bg} mb-2`} />
                                        <span className="text-xs text-[var(--color-text-muted)]">{style.name}</span>
                                    </button>
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
                                <Badge variant="ai">1:1 Instagram</Badge>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {/* Preview */}
                            <div className={`aspect-square rounded-[var(--radius-default)] ${currentStyle.bg} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                                {selectedStyle === "gradient" && (
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
                                )}
                                <Quote className={`h-8 w-8 mb-4 ${currentStyle.text} opacity-30`} />
                                <p className={`text-lg sm:text-xl font-semibold leading-relaxed ${currentStyle.text} relative z-10`}>
                                    &quot;{customText || selectedQuote?.text}&quot;
                                </p>
                                <div className="mt-6 pt-4 border-t border-current/20 w-full">
                                    <p className={`text-sm ${currentStyle.text} opacity-70`}>
                                        Grace Community Church
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download Image
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share to Social
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
