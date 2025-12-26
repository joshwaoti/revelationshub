"use client";

import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Animation variants - using simple objects to avoid TypeScript strict typing issues
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 },
    },
};

const buttonVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5 },
    },
};

const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
        opacity: 0.6,
        scale: 1,
        transition: { delay: 1 + i * 0.1, duration: 0.4 },
    }),
};

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-base)] pt-20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-base)] via-[var(--color-base)] to-[var(--color-surface)]" />

            {/* Decorative Elements - Animated */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/10 blur-3xl"
                animate={{
                    y: [-15, 15, -15],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-secondary)]/10 blur-3xl"
                animate={{
                    y: [15, -15, 15],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div
                    className="mb-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20"
                    variants={itemVariants}
                >
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
                    </motion.div>
                    <span>Smart Ministry Tools</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="font-display text-5xl md:text-7xl font-bold text-[var(--color-text-light)] mb-6 leading-tight"
                    variants={itemVariants}
                >
                    Your Sunday Message.
                    <br />
                    <motion.span
                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent inline-block"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        Monday&apos;s Movement.
                    </motion.span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="mx-auto max-w-2xl text-lg md:text-xl text-[var(--color-text-muted)] mb-10"
                    variants={itemVariants}
                >
                    Transform your sermons into engaging clips, discussion guides, and
                    social content with intelligent algorithms designed for ministry.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    variants={itemVariants}
                >
                    <motion.div variants={buttonVariants}>
                        <Link href="/sign-up">
                            <Button size="xl" className="group">
                                Start Free Trial
                                <motion.span
                                    className="ml-2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Sparkles className="h-5 w-5" />
                                </motion.span>
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.div variants={buttonVariants}>
                        <Button variant="outline" size="xl" className="group">
                            <motion.span className="mr-2" whileHover={{ scale: 1.1 }}>
                                <Play className="h-5 w-5" />
                            </motion.span>
                            Watch Demo
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                    className="mt-16 flex flex-col items-center"
                    variants={itemVariants}
                >
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                        Trusted by 500+ churches worldwide
                    </p>
                    <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
                        {[
                            { name: "Grace Church", icon: "✝️" },
                            { name: "New Life", icon: "🕊️" },
                            { name: "Cornerstone", icon: "⛪" },
                            { name: "Redeemer", icon: "☀️" },
                        ].map((church, i) => (
                            <motion.div
                                key={church.name}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] ${i === 3 ? "hidden sm:flex" : ""
                                    }`}
                                custom={i}
                                variants={logoVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ scale: 1.05, borderColor: "var(--color-primary)" }}
                            >
                                <span className="text-base">{church.icon}</span>
                                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                                    {church.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Prism Illustration - Animated */}
            <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 md:w-96 md:h-96"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
            >
                <div className="relative w-full h-full">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] opacity-30 blur-2xl rounded-full"
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        }}
                    />
                    <motion.div
                        className="absolute inset-8 bg-gradient-to-br from-[var(--color-primary)]/40 to-[var(--color-secondary)]/40 rounded-3xl backdrop-blur-xl border border-white/10 transform rotate-12"
                        animate={{ rotate: [12, 15, 12] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>
        </section>
    );
}
