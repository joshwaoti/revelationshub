"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LogoLockup } from "@/components/brand/RevelationsLogo";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // IntersectionObserver for active section highlighting
    useEffect(() => {
        const sections = ["workflow", "tour", "features", "trust"];
        const observerOptions = {
            root: null,
            rootMargin: "-30% 0px -50% 0px", // triggers when section occupies middle-ish of viewport
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach((id) => {
                const el = document.getElementById(id);
                if (el) observer.unobserve(el);
            });
        };
    }, []);

    const navLinks = [
        { href: "#workflow", label: "Workflow", id: "workflow" },
        { href: "#tour", label: "Product Tour", id: "tour" },
        { href: "#features", label: "Features", id: "features" },
        { href: "#trust", label: "Reliability", id: "trust" },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
                scrolled ? "py-2.5 px-4 sm:px-6" : "py-5 px-0"
            )}
        >
            <nav
                className={cn(
                    "mx-auto transition-all duration-500 ease-out",
                    scrolled
                        ? "max-w-5xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-full shadow-lg px-4 sm:px-6 py-2"
                        : "max-w-7xl px-4 sm:px-6 bg-transparent"
                )}
            >
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <LogoLockup
                            markClassName={cn("transition-all duration-300", scrolled ? "h-7 w-7" : "h-8 w-8")}
                            textClassName={cn("transition-all duration-300", scrolled ? "text-lg" : "text-xl")}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        {navLinks.map((link) => {
                            const isActive = activeSection === link.id;
                            return (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors relative py-1",
                                        isActive 
                                            ? "text-[var(--color-primary)] font-semibold" 
                                            : "text-[var(--color-text-light)]/80 hover:text-[var(--color-primary)]"
                                    )}
                                >
                                    {link.label}
                                    {isActive && (
                                        <motion.span 
                                            layoutId="activeNavLine"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-[var(--color-text-light)]/80 hover:text-[var(--color-primary)] transition-colors py-1"
                        >
                            Pricing
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
                            <Button size="sm" className="shadow-md shadow-[var(--color-primary)]/10 hover:shadow-[var(--color-primary)]/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            className="p-2 text-[var(--color-text-light)] rounded-full hover:bg-[var(--color-surface)] transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu with Framer Motion slide transition */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="md:hidden mt-4 overflow-hidden border-t border-[var(--color-border)]"
                        >
                            <div className="flex flex-col gap-3 py-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-medium py-2 px-1 rounded-lg hover:bg-[var(--color-base)]/50 transition-colors",
                                            activeSection === link.id ? "text-[var(--color-primary)] font-semibold" : "text-[var(--color-text-light)]"
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/pricing"
                                    className="text-sm font-medium py-2 px-1 rounded-lg hover:bg-[var(--color-base)]/50 transition-colors text-[var(--color-text-light)]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pricing
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}
