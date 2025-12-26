"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
        <motion.aside
            className="fixed left-0 top-0 bottom-0 w-16 bg-[var(--color-base)] border-r border-[var(--color-border)] flex flex-col items-center py-4 z-40"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Logo */}
            <Link href="/library" className="mb-8">
                <motion.div
                    className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-[var(--radius-default)] transition-all duration-150 group relative",
                                    isActive
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-surface)]"
                                )}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <item.icon className="h-5 w-5" />
                                </motion.div>
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-primary)] rounded-r-full"
                                        layoutId="activeIndicator"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                {/* Tooltip */}
                                <motion.span
                                    className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-light)] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[var(--color-border)] shadow-lg"
                                    initial={{ x: -5, opacity: 0 }}
                                    whileHover={{ x: 0, opacity: 1 }}
                                >
                                    {item.label}
                                </motion.span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>
        </motion.aside>
    );
}
