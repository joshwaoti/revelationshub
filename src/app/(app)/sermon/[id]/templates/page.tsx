"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Check,
    Sparkles,
    Crown,
    Play,
} from "lucide-react";

// 15 Video Templates for YouTube Shorts
const videoTemplates = [
    {
        id: "sermon-classic",
        name: "Sermon Classic",
        category: "Classic",
        premium: false,
        font: { family: "Inter", weight: "bold", size: "lg" },
        textColor: "text-white",
        textPosition: "bottom-center",
        textShadow: true,
        frame: { type: "none", color: "" },
        overlay: "bg-gradient-to-t from-black/70 via-transparent to-transparent",
        animation: "fade",
    },
    {
        id: "bold-impact",
        name: "Bold Impact",
        category: "Modern",
        premium: false,
        font: { family: "Impact", weight: "bold", size: "xl" },
        textColor: "text-white",
        textPosition: "center",
        textShadow: true,
        frame: { type: "none", color: "" },
        overlay: "bg-black/40",
        animation: "scale",
    },
    {
        id: "gradient-pop",
        name: "Gradient Pop",
        category: "Modern",
        premium: false,
        font: { family: "Outfit", weight: "bold", size: "lg" },
        textColor: "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent",
        textPosition: "bottom-center",
        textShadow: false,
        frame: { type: "none", color: "" },
        overlay: "bg-gradient-to-t from-black/80 to-transparent",
        animation: "slide-up",
    },
    {
        id: "minimal-clean",
        name: "Minimal Clean",
        category: "Minimal",
        premium: false,
        font: { family: "Inter", weight: "medium", size: "md" },
        textColor: "text-white/90",
        textPosition: "bottom-left",
        textShadow: false,
        frame: { type: "none", color: "" },
        overlay: "bg-gradient-to-t from-black/50 to-transparent",
        animation: "fade",
    },
    {
        id: "karaoke-highlight",
        name: "Karaoke",
        category: "Animated",
        premium: false,
        font: { family: "Outfit", weight: "bold", size: "lg" },
        textColor: "text-white",
        textPosition: "bottom-center",
        textShadow: true,
        frame: { type: "none", color: "" },
        overlay: "bg-gradient-to-t from-black/60 to-transparent",
        animation: "karaoke",
        highlight: "text-yellow-400",
    },
    {
        id: "neon-glow",
        name: "Neon Glow",
        category: "Effects",
        premium: true,
        font: { family: "Outfit", weight: "bold", size: "lg" },
        textColor: "text-cyan-400",
        textPosition: "center",
        textShadow: false,
        frame: { type: "none", color: "" },
        overlay: "bg-black/50",
        animation: "pulse",
        glow: "drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]",
    },
    {
        id: "vintage-film",
        name: "Vintage Film",
        category: "Artistic",
        premium: true,
        font: { family: "Playfair Display", weight: "normal", size: "lg" },
        textColor: "text-amber-100",
        textPosition: "bottom-center",
        textShadow: true,
        frame: { type: "border", color: "border-4 border-amber-100/30" },
        overlay: "bg-amber-900/20",
        animation: "typewriter",
        filter: "sepia",
    },
    {
        id: "cinematic-bars",
        name: "Cinematic",
        category: "Professional",
        premium: false,
        font: { family: "Inter", weight: "semibold", size: "md" },
        textColor: "text-white",
        textPosition: "bottom-center",
        textShadow: true,
        frame: { type: "letterbox", color: "bg-black" },
        overlay: "",
        animation: "fade",
    },
    {
        id: "social-viral",
        name: "Viral Style",
        category: "Social",
        premium: false,
        font: { family: "Inter", weight: "black", size: "xl" },
        textColor: "text-white",
        textPosition: "center",
        textShadow: true,
        frame: { type: "none", color: "" },
        overlay: "bg-gradient-to-t from-rose-500/30 via-transparent to-cyan-500/30",
        animation: "bounce",
    },
    {
        id: "scripture-frame",
        name: "Scripture Frame",
        category: "Classic",
        premium: false,
        font: { family: "Playfair Display", weight: "normal", size: "lg" },
        textColor: "text-white",
        textPosition: "center",
        textShadow: true,
        frame: { type: "ornate", color: "border-2 border-white/30" },
        overlay: "bg-black/40",
        animation: "fade",
    },
    {
        id: "modern-split",
        name: "Modern Split",
        category: "Modern",
        premium: true,
        font: { family: "Outfit", weight: "bold", size: "lg" },
        textColor: "text-white",
        textPosition: "right-panel",
        textShadow: false,
        frame: { type: "split", color: "bg-gradient-to-r from-transparent to-black/80" },
        overlay: "",
        animation: "slide-left",
    },
    {
        id: "podcast-wave",
        name: "Podcast Wave",
        category: "Audio",
        premium: true,
        font: { family: "Inter", weight: "medium", size: "md" },
        textColor: "text-white",
        textPosition: "bottom-center",
        textShadow: true,
        frame: { type: "wave", color: "" },
        overlay: "bg-gradient-to-t from-black/70 to-black/30",
        animation: "wave",
    },
    {
        id: "fire-revival",
        name: "Fire Revival",
        category: "Effects",
        premium: true,
        font: { family: "Impact", weight: "bold", size: "xl" },
        textColor: "text-orange-500",
        textPosition: "center",
        textShadow: false,
        frame: { type: "none", color: "" },
        overlay: "bg-gradient-to-t from-red-900/50 via-orange-900/30 to-transparent",
        animation: "fire",
        glow: "drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]",
    },
    {
        id: "clean-subtitle",
        name: "Clean Subtitle",
        category: "Minimal",
        premium: false,
        font: { family: "Inter", weight: "medium", size: "md" },
        textColor: "text-white",
        textPosition: "bottom-center",
        textShadow: false,
        frame: { type: "none", color: "" },
        overlay: "",
        animation: "fade",
        background: "bg-black/70 px-4 py-2 rounded-lg",
    },
    {
        id: "glory-light",
        name: "Glory Light",
        category: "Artistic",
        premium: true,
        font: { family: "Playfair Display", weight: "normal", size: "lg" },
        textColor: "text-amber-200",
        textPosition: "center",
        textShadow: true,
        frame: { type: "vignette", color: "" },
        overlay: "bg-gradient-radial from-amber-500/20 via-transparent to-black/50",
        animation: "glow",
        glow: "drop-shadow-[0_0_40px_rgba(251,191,36,0.4)]",
    },
];

const categories = ["All", "Classic", "Modern", "Minimal", "Animated", "Effects", "Professional", "Social", "Artistic", "Audio"];

export default function TemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(videoTemplates[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isPlaying, setIsPlaying] = useState(false);

    const filteredTemplates = videoTemplates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getTextPositionClass = (position: string) => {
        switch (position) {
            case "center": return "items-center justify-center";
            case "bottom-center": return "items-end justify-center pb-8";
            case "bottom-left": return "items-end justify-start pb-8 pl-4";
            case "top-center": return "items-start justify-center pt-8";
            case "right-panel": return "items-center justify-end pr-4";
            default: return "items-end justify-center pb-8";
        }
    };

    const getFontSizeClass = (size: string) => {
        switch (size) {
            case "sm": return "text-xs";
            case "md": return "text-sm";
            case "lg": return "text-base";
            case "xl": return "text-lg";
            default: return "text-sm";
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
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                        Video Templates
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Choose a style for your sermon clips
                    </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="sm">
                        <Check className="h-4 w-4 mr-2" />
                        Apply to All Clips
                    </Button>
                </motion.div>
            </motion.div>

            {/* Search & Filter */}
            <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <Input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {categories.slice(0, 6).map((category) => (
                        <motion.button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Template Grid */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredTemplates.map((template, index) => (
                                    <motion.button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setIsPlaying(true);
                                            setTimeout(() => setIsPlaying(false), 2000);
                                        }}
                                        className={`relative rounded-[var(--radius-default)] border-2 transition-all overflow-hidden ${selectedTemplate.id === template.id
                                            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                            }`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {template.premium && (
                                            <div className="absolute top-1 right-1 z-10">
                                                <Crown className="h-4 w-4 text-amber-400" />
                                            </div>
                                        )}
                                        {selectedTemplate.id === template.id && (
                                            <motion.div
                                                className="absolute top-1 left-1 z-10 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check className="h-3 w-3 text-white" />
                                            </motion.div>
                                        )}

                                        {/* Preview Thumbnail */}
                                        <div className={`aspect-[9/16] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] relative flex ${getTextPositionClass(template.textPosition)}`}>
                                            {/* Frame effects */}
                                            {template.frame.type === "letterbox" && (
                                                <>
                                                    <div className="absolute top-0 left-0 right-0 h-4 bg-black" />
                                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-black" />
                                                </>
                                            )}
                                            {template.frame.type === "border" && (
                                                <div className={`absolute inset-2 ${template.frame.color}`} />
                                            )}
                                            {template.frame.type === "vignette" && (
                                                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
                                            )}

                                            {/* Overlay */}
                                            {template.overlay && (
                                                <div className={`absolute inset-0 ${template.overlay}`} />
                                            )}

                                            {/* Text Preview */}
                                            <div className={`relative z-10 px-2 text-center ${template.background || ""}`}>
                                                <span className={`${getFontSizeClass(template.font.size)} font-${template.font.weight} ${template.textColor} ${template.textShadow ? "drop-shadow-lg" : ""} ${template.glow || ""}`}>
                                                    Peace is...
                                                </span>
                                            </div>
                                        </div>

                                        {/* Template Name */}
                                        <div className="p-2 bg-[var(--color-surface)]">
                                            <p className="text-xs font-medium text-[var(--color-text-light)] truncate">
                                                {template.name}
                                            </p>
                                            <p className="text-[10px] text-[var(--color-text-muted)]">
                                                {template.category}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Preview Panel */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[var(--color-text-light)]">
                                    Preview
                                </h3>
                                <Badge variant={selectedTemplate.premium ? "secondary" : "outline"}>
                                    {selectedTemplate.premium ? (
                                        <><Crown className="h-3 w-3 mr-1" /> Premium</>
                                    ) : (
                                        "Free"
                                    )}
                                </Badge>
                            </div>

                            {/* Large Preview */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedTemplate.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`aspect-[9/16] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-default)] relative overflow-hidden flex ${getTextPositionClass(selectedTemplate.textPosition)}`}
                                >
                                    {/* Frame effects */}
                                    {selectedTemplate.frame.type === "letterbox" && (
                                        <>
                                            <div className="absolute top-0 left-0 right-0 h-6 bg-black" />
                                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-black" />
                                        </>
                                    )}
                                    {selectedTemplate.frame.type === "border" && (
                                        <div className={`absolute inset-3 ${selectedTemplate.frame.color} rounded`} />
                                    )}
                                    {selectedTemplate.frame.type === "vignette" && (
                                        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
                                    )}

                                    {/* Overlay */}
                                    {selectedTemplate.overlay && (
                                        <div className={`absolute inset-0 ${selectedTemplate.overlay}`} />
                                    )}

                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.button
                                            className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsPlaying(!isPlaying)}
                                        >
                                            <Play className="h-6 w-6 text-white ml-1" />
                                        </motion.button>
                                    </div>

                                    {/* Text Preview with animation */}
                                    <motion.div
                                        className={`relative z-10 px-4 text-center w-full ${selectedTemplate.background || ""}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <motion.p
                                            className={`text-sm font-${selectedTemplate.font.weight} ${selectedTemplate.textColor} ${selectedTemplate.textShadow ? "drop-shadow-lg" : ""} ${selectedTemplate.glow || ""} leading-relaxed`}
                                            animate={isPlaying ? {
                                                scale: [1, 1.02, 1],
                                                opacity: [1, 0.9, 1],
                                            } : {}}
                                            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                                        >
                                            &quot;Peace is not the absence of chaos, but the presence of God in the midst of it.&quot;
                                        </motion.p>
                                    </motion.div>

                                    {/* Template name badge */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                        <Badge variant="outline" className="text-[10px] bg-black/30 text-white border-white/30">
                                            {selectedTemplate.name}
                                        </Badge>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Template Details */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-muted)]">Font</span>
                                    <span className="text-[var(--color-text-light)]">{selectedTemplate.font.family}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-muted)]">Position</span>
                                    <span className="text-[var(--color-text-light)] capitalize">{selectedTemplate.textPosition.replace("-", " ")}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-muted)]">Animation</span>
                                    <span className="text-[var(--color-text-light)] capitalize">{selectedTemplate.animation}</span>
                                </div>
                                {selectedTemplate.frame.type !== "none" && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--color-text-muted)]">Frame</span>
                                        <span className="text-[var(--color-text-light)] capitalize">{selectedTemplate.frame.type}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Apply Template
                        </Button>
                    </motion.div>

                    {selectedTemplate.premium && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Crown className="h-5 w-5 text-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-text-light)]">
                                                Premium Template
                                            </p>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                Upgrade to unlock all premium templates
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
