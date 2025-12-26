"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScreenMockupProps {
    children: ReactNode;
    variant: "desktop" | "mobile";
    className?: string;
}

export function ScreenMockup({
    children,
    variant,
    className = "",
}: ScreenMockupProps) {
    if (variant === "desktop") {
        return (
            <motion.div
                className={`relative ${className}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Browser Chrome */}
                <div className="bg-[var(--color-surface)] rounded-t-xl border border-[var(--color-border)] border-b-0 p-3">
                    <div className="flex items-center gap-2">
                        {/* Traffic Lights */}
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                        </div>
                        {/* URL Bar */}
                        <div className="flex-1 mx-4">
                            <div className="bg-[var(--color-base)] rounded-md px-3 py-1.5 text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span>revelationshub.com</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Screen Content */}
                <div className="bg-[var(--color-base)] rounded-b-xl border border-[var(--color-border)] border-t-0 overflow-hidden aspect-[16/10] relative">
                    {children}
                </div>
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-primary)]/20 rounded-2xl blur-2xl -z-10 opacity-50" />
            </motion.div>
        );
    }

    // Mobile Mockup
    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Phone Frame */}
            <div className="bg-[var(--color-surface)] rounded-[2.5rem] p-3 border-4 border-[var(--color-border)] shadow-2xl">
                {/* Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 bg-[var(--color-surface)] rounded-full z-10" />

                {/* Screen */}
                <div className="bg-[var(--color-base)] rounded-[2rem] overflow-hidden aspect-[9/19] relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-10 px-6 flex items-center justify-between text-xs text-[var(--color-text-muted)] z-10">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" />
                            </svg>
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                            </svg>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="pt-12 h-full">{children}</div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[var(--color-text-muted)] rounded-full opacity-50" />
            </div>
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-primary)]/20 rounded-3xl blur-2xl -z-10 opacity-50" />
        </motion.div>
    );
}
