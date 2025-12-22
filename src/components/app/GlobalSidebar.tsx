"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Settings, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/library", icon: Library, label: "Library" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/settings/brand-kit", icon: Palette, label: "Brand Kit" },
];

export function GlobalSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-16 bg-[var(--color-base)] border-r border-[var(--color-border)] flex flex-col items-center py-4 z-40">
            {/* Logo */}
            <Link href="/library" className="mb-8">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" />
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-[var(--radius-default)] transition-all duration-150 group relative",
                                isActive
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)]"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {/* Tooltip */}
                            <span className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text-light)] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[var(--color-border)]">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
