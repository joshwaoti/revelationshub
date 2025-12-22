"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
                scrolled ? "py-2 px-4 sm:px-6" : "py-4 px-0"
            )}
        >
            <nav
                className={cn(
                    "mx-auto transition-all duration-500 ease-out",
                    scrolled
                        ? "max-w-5xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-full shadow-lg px-4 sm:px-6 py-2"
                        : "max-w-7xl px-4 sm:px-6"
                )}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div
                            className={cn(
                                "rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300",
                                scrolled ? "h-7 w-7" : "h-8 w-8"
                            )}
                        />
                        <span
                            className={cn(
                                "font-display font-bold text-[var(--color-text-light)] transition-all duration-300",
                                scrolled ? "text-lg" : "text-xl"
                            )}
                        >
                            RevelationsHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        <Link
                            href="#features"
                            className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors text-sm"
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors text-sm"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/blog"
                            className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors text-sm"
                        >
                            Blog
                        </Link>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/sign-in">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            className="p-2 text-[var(--color-text-light)] rounded-full hover:bg-[var(--color-surface)]"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div
                        className={cn(
                            "md:hidden mt-4 pb-4 pt-4 animate-fade-in",
                            scrolled
                                ? "border-t border-[var(--color-border)]"
                                : "border-t border-[var(--color-border)]"
                        )}
                    >
                        <div className="flex flex-col gap-3">
                            <Link
                                href="#features"
                                className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/blog"
                                className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Blog
                            </Link>
                            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[var(--color-border)]">
                                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
