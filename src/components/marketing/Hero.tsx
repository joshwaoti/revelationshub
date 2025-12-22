import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-base)] pt-20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-base)] via-[var(--color-base)] to-[var(--color-surface)]" />

            {/* Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-light)] border border-[var(--color-primary)]/20">
                    <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
                    <span>AI-Powered Ministry Tools</span>
                </div>

                {/* Headline */}
                <h1 className="font-display text-5xl md:text-7xl font-bold text-[var(--color-text-light)] mb-6 leading-tight">
                    Your Sunday Message.
                    <br />
                    <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                        Monday&apos;s Movement.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mx-auto max-w-2xl text-lg md:text-xl text-[var(--color-text-muted)] mb-10">
                    Transform your sermons into engaging clips, discussion guides, and
                    social content with AI-powered tools designed for ministry.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/sign-up">
                        <Button size="xl" className="group">
                            Start Free Trial
                            <Sparkles className="ml-2 h-5 w-5 group-hover:animate-pulse" />
                        </Button>
                    </Link>
                    <Button variant="outline" size="xl">
                        <Play className="mr-2 h-5 w-5" />
                        Watch Demo
                    </Button>
                </div>

                {/* Social Proof */}
                <div className="mt-16 flex flex-col items-center">
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                        Trusted by 500+ churches worldwide
                    </p>
                    <div className="flex items-center gap-8 opacity-60">
                        {/* Placeholder for church logos */}
                        <div className="h-8 w-24 rounded bg-[var(--color-text-light)]/20" />
                        <div className="h-8 w-24 rounded bg-[var(--color-text-light)]/20" />
                        <div className="h-8 w-24 rounded bg-[var(--color-text-light)]/20" />
                        <div className="hidden sm:block h-8 w-24 rounded bg-[var(--color-text-light)]/20" />
                    </div>
                </div>
            </div>

            {/* Prism Illustration Placeholder */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 md:w-96 md:h-96">
                <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] opacity-30 blur-2xl rounded-full" />
                    <div className="absolute inset-8 bg-gradient-to-br from-[var(--color-primary)]/40 to-[var(--color-secondary)]/40 rounded-3xl backdrop-blur-xl border border-white/10 transform rotate-12" />
                </div>
            </div>
        </section>
    );
}
