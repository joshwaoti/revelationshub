"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Library, Settings, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/RevelationsLogo";

const navItems = [
    { href: "/library", icon: Library, label: "Library" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/settings/brand-kit", icon: Palette, label: "Brand Kit" },
];

export function GlobalSidebar() {
    const pathname = usePathname();

    return (
        <motion.aside
            className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-base)] px-3 sm:inset-y-0 sm:left-0 sm:right-auto sm:h-auto sm:w-16 sm:flex-col sm:justify-start sm:border-r sm:border-t-0 sm:px-0 sm:py-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Logo */}
            <Link href="/library" className="mb-8 hidden sm:block">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <LogoMark className="h-10 w-10" />
                </motion.div>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-1 items-center justify-around gap-2 sm:flex-none sm:flex-col sm:justify-start">
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
                                    "group relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-default)] transition-all duration-150 sm:h-10 sm:w-10",
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
                                        className="absolute bottom-0 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-t-full bg-[var(--color-primary)] sm:-left-[1px] sm:bottom-auto sm:top-1/2 sm:h-5 sm:w-[3px] sm:-translate-x-0 sm:-translate-y-1/2 sm:rounded-r-full"
                                        layoutId="activeIndicator"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                {/* Tooltip */}
                                <motion.span
                                    className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-light)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block"
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
