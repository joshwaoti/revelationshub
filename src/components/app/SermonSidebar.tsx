"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
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
                    className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Library
                </Link>
            </div>

            {/* Overview Link */}
            <div className="p-2">
                <Link
                    href={`/sermon/${sermonId}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-default)] transition-all duration-150",
                        pathname === `/sermon/${sermonId}`
                            ? "bg-[var(--color-surface)] text-[var(--color-text-light)]"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)]/50"
                    )}
                >
                    <LayoutGrid className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                    <span>Overview</span>
                </Link>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {sidebarSections.map((section) => (
                    <div key={section.title} className="mb-4">
                        <h3 className="px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                            {section.title}
                        </h3>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const fullPath = `/sermon/${sermonId}/${item.href}`;
                                const isActive = pathname === fullPath;
                                return (
                                    <Link
                                        key={item.href}
                                        href={fullPath}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-default)] transition-all duration-150",
                                            isActive
                                                ? "bg-[var(--color-surface)] text-[var(--color-text-light)]"
                                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)]/50"
                                        )}
                                    >
                                        <item.icon
                                            className="h-4 w-4"
                                            style={{ color: section.iconColor }}
                                        />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-3 left-3 z-50 p-2 rounded-[var(--radius-default)] bg-[var(--color-surface)] text-[var(--color-text-light)] lg:hidden"
            >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-base)] border-r border-[var(--color-border)] flex-col z-40">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-base)] border-r border-[var(--color-border)] flex flex-col z-40 lg:hidden transition-transform duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
