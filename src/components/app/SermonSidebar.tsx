"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wand2,
    Image,
    LayoutGrid,
    BookOpen,
    Heart,
    FileText,
    Type,
    FileEdit,
    Mic,
    List,
    ArrowLeft,
    Film,
    Layers,
    Menu,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sidebarSections = [
    {
        title: "Social Media",
        iconColor: "var(--color-primary)",
        items: [
            { href: "clips", icon: Wand2, label: "Magic Clips" },
            { href: "quotes", icon: Image, label: "Image Quotes" },
            { href: "carousel", icon: LayoutGrid, label: "Social Carousel" },
        ],
    },
    {
        title: "Discipleship",
        iconColor: "var(--color-secondary)",
        items: [
            { href: "discussion-guide", icon: BookOpen, label: "Discussion Guide" },
            { href: "devotionals", icon: Heart, label: "Devotionals" },
            { href: "outline", icon: FileText, label: "Sermon Outline" },
        ],
    },
    {
        title: "More Content",
        iconColor: "var(--color-success)",
        items: [
            { href: "transcription", icon: Type, label: "Transcription" },
            { href: "blog", icon: FileEdit, label: "Blog Post" },
            { href: "podcast", icon: Mic, label: "Podcast Audio" },
            { href: "summaries", icon: List, label: "Summaries" },
        ],
    },
    {
        title: "Editor",
        iconColor: "var(--color-primary)",
        items: [
            { href: "editor", icon: Film, label: "Video Editor" },
            { href: "templates", icon: Layers, label: "Templates" },
        ],
    },
];

// Animation variants
const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.03 },
    }),
};

export function SermonSidebar() {
    const pathname = usePathname();
    const params = useParams();
    const sermonId = params.id;
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)]">
                <Link
                    href="/library"
                    className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors text-sm group"
                >
                    <motion.div
                        whileHover={{ x: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </motion.div>
                    Back to Library
                </Link>
            </div>

            {/* Overview Link */}
            <div className="p-2">
                <Link
                    href={`/sermon/${sermonId}`}
                    onClick={() => setMobileOpen(false)}
                >
                    <motion.div
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-default)] transition-all duration-150 relative",
                            pathname === `/sermon/${sermonId}`
                                ? "bg-[var(--color-surface)] text-[var(--color-text-light)]"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)]/50"
                        )}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {pathname === `/sermon/${sermonId}` && (
                            <motion.div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[var(--color-primary)] rounded-r-full"
                                layoutId="sermonActiveIndicator"
                            />
                        )}
                        <LayoutGrid className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                        <span>Overview</span>
                    </motion.div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {sidebarSections.map((section, sectionIndex) => (
                    <motion.div
                        key={section.title}
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.1 }}
                    >
                        <h3 className="px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item, itemIndex) => {
                                const fullPath = `/sermon/${sermonId}/${item.href}`;
                                const isActive = pathname === fullPath;
                                return (
                                    <motion.div
                                        key={item.href}
                                        custom={sectionIndex * 3 + itemIndex}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <Link
                                            href={fullPath}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <motion.div
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-default)] transition-all duration-150 relative",
                                                    isActive
                                                        ? "bg-[var(--color-surface)] text-[var(--color-text-light)]"
                                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)]/50"
                                                )}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                                                        style={{ backgroundColor: section.iconColor }}
                                                        layoutId="sermonActiveIndicator"
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                )}
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <item.icon
                                                        className="h-4 w-4"
                                                        style={{ color: section.iconColor }}
                                                    />
                                                </motion.div>
                                                <span className="text-sm">{item.label}</span>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <motion.button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-3 left-3 z-50 p-2 rounded-[var(--radius-default)] bg-[var(--color-surface)] text-[var(--color-text-light)] lg:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {mobileOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <Menu className="h-5 w-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-base)] border-r border-[var(--color-border)] flex-col z-40"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
            >
                {sidebarContent}
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-base)] border-r border-[var(--color-border)] flex flex-col z-40 lg:hidden"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
