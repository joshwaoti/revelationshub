"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroMotionStage } from "./HeroMotionStage";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.6 + i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function HeroAnimated() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:pb-32">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 landing-grid opacity-30 pointer-events-none" />

      {/* Floating Ambient Gradient Orbs */}
      <motion.div
        className="absolute top-12 left-1/4 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-24 right-1/4 translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-[var(--color-secondary)]/10 blur-3xl pointer-events-none"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="mx-auto max-w-4xl text-center z-10 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <Badge className="mb-5 inline-flex items-center gap-1.5 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)] shadow-sm backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Sparkles className="h-3 w-3" />
              </motion.div>
              Ministry Operating System
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-text-light)] sm:text-6xl lg:text-7xl"
            variants={itemVariants}
          >
            Your Sunday message. <br />
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent inline-block">
              Monday&apos;s movement.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8"
            variants={itemVariants}
          >
            Turn one sermon or podcast episode into ranked clips with broadcast-quality captions, quote graphics, carousels, guides, devotionals, and blog posts — then chat with the transcript to clip any moment you want.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="mx-auto mt-10 flex max-w-sm flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center"
            variants={itemVariants}
          >
            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Link href="/sign-up" className="block w-full">
                <Button size="xl" className="group w-full sm:w-auto shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 transition-all duration-200">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Link href="#tour" className="block w-full">
                <Button size="xl" variant="outline" className="w-full sm:w-auto bg-[var(--color-surface)]/40 hover:bg-[var(--color-surface)]/80 backdrop-blur-sm">
                  <Play className="h-5 w-5 fill-current" />
                  Watch Product Tour
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-14 flex flex-col items-center border-t border-[var(--color-border)]/40 pt-8"
            variants={itemVariants}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]/80 mb-5">
              Empowering churches and podcasters of all sizes
            </p>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center max-w-2xl">
              {[
                { name: "Grace Family Church", icon: "✝️" },
                { name: "New Life Community", icon: "🕊️" },
                { name: "The Daily Walk Podcast", icon: "🎙️" },
                { name: "Cornerstone Chapel", icon: "⛪" },
                { name: "Elevation Group", icon: "🔥" },
              ].map((church, i) => (
                <motion.div
                  key={church.name}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]/60 shadow-sm ${
                    i > 3 ? "hidden md:flex" : ""
                  }`}
                  custom={i}
                  variants={logoVariants}
                  whileHover={{ 
                    scale: 1.03, 
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(var(--color-primary-rgb), 0.05)",
                    transition: { duration: 0.2 } 
                  }}
                >
                  <span className="text-sm">{church.icon}</span>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {church.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Product Visual Mockup */}
        <motion.div 
          className="relative mx-auto mt-12 max-w-6xl md:mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <HeroMotionStage />

          {/* Mobile specific layout cards */}
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3 md:hidden">
            {[
              ["Source", "Upload or YouTube"],
              ["Output", "Clips and content"],
              ["Review", "Team-ready workspace"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">{label}</p>
                <p className="mt-2 font-semibold text-[var(--color-text-light)]">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
