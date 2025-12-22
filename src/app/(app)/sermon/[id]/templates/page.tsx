"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Check,
    Palette,
    Type as TypeIcon,
    Sparkles,
    Crown,
} from "lucide-react";

const captionStyles = [
    { id: "bold-white", name: "Bold White", preview: "bold", premium: false },
    { id: "gradient-pop", name: "Gradient Pop", preview: "gradient", premium: false },
    { id: "minimal", name: "Minimal", preview: "minimal", premium: false },
    { id: "karaoke", name: "Karaoke", preview: "karaoke", premium: false },
    { id: "neon", name: "Neon Glow", preview: "neon", premium: true },
    { id: "typewriter", name: "Typewriter", preview: "typewriter", premium: true },
];

const brandTemplates = [
    { id: "default", name: "Default", colors: ["#6db1bf", "#f39a9d"] },
    { id: "custom", name: "Your Brand", colors: ["#0066CC", "#FF6600"] },
];

export default function TemplatesPage() {
    const [selectedCaption, setSelectedCaption] = useState("bold-white");
    const [selectedBrand, setSelectedBrand] = useState("default");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Templates
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Customize captions and branding for your clips
                    </p>
                </div>
                <Button size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Apply to All Clips
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Caption Styles */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-[var(--color-text-light)] mb-4 flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-[var(--color-primary)]" />
                            Caption Styles
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {captionStyles.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedCaption(style.id)}
                                    className={`relative p-3 rounded-[var(--radius-default)] border-2 transition-all ${selectedCaption === style.id
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        }`}
                                >
                                    {style.premium && (
                                        <Crown className="absolute top-1 right-1 h-4 w-4 text-[var(--color-secondary)]" />
                                    )}
                                    {/* Preview */}
                                    <div className="h-16 bg-[var(--color-base)] rounded-[var(--radius-sm)] mb-2 flex items-center justify-center">
                                        {style.preview === "bold" && (
                                            <span className="text-white font-bold text-xs">Peace is...</span>
                                        )}
                                        {style.preview === "gradient" && (
                                            <span className="text-xs font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                                Peace is...
                                            </span>
                                        )}
                                        {style.preview === "minimal" && (
                                            <span className="text-white/80 text-xs">Peace is...</span>
                                        )}
                                        {style.preview === "karaoke" && (
                                            <span className="text-xs">
                                                <span className="text-[var(--color-secondary)]">Peace</span>
                                                <span className="text-white/50"> is...</span>
                                            </span>
                                        )}
                                        {style.preview === "neon" && (
                                            <span className="text-xs text-[var(--color-primary)] drop-shadow-[0_0_10px_var(--color-primary)]">
                                                Peace is...
                                            </span>
                                        )}
                                        {style.preview === "typewriter" && (
                                            <span className="text-xs text-white font-mono">Peace is_</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-[var(--color-text-light)]">{style.name}</span>
                                    {selectedCaption === style.id && (
                                        <Check className="absolute top-2 left-2 h-4 w-4 text-[var(--color-primary)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Brand Templates */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-[var(--color-text-light)] mb-4 flex items-center gap-2">
                            <Palette className="h-4 w-4 text-[var(--color-secondary)]" />
                            Brand Templates
                        </h3>
                        <div className="space-y-3">
                            {brandTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedBrand(template.id)}
                                    className={`w-full p-4 rounded-[var(--radius-default)] border-2 transition-all flex items-center gap-4 ${selectedBrand === template.id
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        }`}
                                >
                                    <div className="flex gap-1">
                                        {template.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="h-8 w-8 rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-[var(--color-text-light)]">{template.name}</p>
                                        {template.id === "custom" && (
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                From your Brand Kit
                                            </p>
                                        )}
                                    </div>
                                    {selectedBrand === template.id && (
                                        <Check className="h-5 w-5 text-[var(--color-primary)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full mt-4">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Edit Brand Kit
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-[var(--color-text-light)] mb-4">
                            Preview
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="w-48 aspect-[9/16] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-default)] relative overflow-hidden">
                                <div className="absolute bottom-8 left-4 right-4 text-center">
                                    {selectedCaption === "bold-white" && (
                                        <p className="text-sm font-bold text-white drop-shadow-lg">
                                            &quot;Peace is not the absence of chaos...&quot;
                                        </p>
                                    )}
                                    {selectedCaption === "gradient-pop" && (
                                        <p className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                                            &quot;Peace is not the absence of chaos...&quot;
                                        </p>
                                    )}
                                    {selectedCaption === "minimal" && (
                                        <p className="text-sm text-white/90">
                                            &quot;Peace is not the absence of chaos...&quot;
                                        </p>
                                    )}
                                </div>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                    <Badge variant="outline" className="text-[10px] bg-black/30 text-white border-white/30">
                                        {selectedCaption} + {selectedBrand}
                                    </Badge>
                                </div>
                            </div>

                            <div className="text-center sm:text-left">
                                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                                    This preview shows how your clips will look with the selected
                                    caption style and brand template.
                                </p>
                                <Button>Apply Template</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
