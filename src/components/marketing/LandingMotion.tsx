"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Film, Layers, Upload, Wand2 } from "lucide-react";
import { BrowserMockup, IPhoneMockup, MacBookMockup } from "./DeviceMockups";
import {
    ClipReviewScreen,
    ContentEngineScreen,
    DashboardScreen,
    LibraryScreen,
    PeopleThumbnail,
} from "./ProductScreens";
import { cn } from "@/lib/utils";

const tourSteps = [
    {
        eyebrow: "01 Upload",
        title: "Bring in the full sermon without changing your team workflow.",
        copy: "Upload a file or import a YouTube message, then track processing from the library while the transcript, clips, and content jobs move through the pipeline.",
        icon: Upload,
        visual: (
            <MacBookMockup>
                <LibraryScreen />
            </MacBookMockup>
        ),
        mobileVisual: (
            <MacBookMockup>
                <LibraryScreen />
            </MacBookMockup>
        ),
    },
    {
        eyebrow: "02 Discover",
        title: "Find the moments people will replay, share, and talk about.",
        copy: "The dashboard connects transcript, speaker-aware vertical framing, and ranked moments so a media director can make decisions quickly.",
        icon: Wand2,
        visual: (
            <MacBookMockup>
                <DashboardScreen />
            </MacBookMockup>
        ),
        mobileVisual: (
            <MacBookMockup>
                <DashboardScreen />
            </MacBookMockup>
        ),
    },
    {
        eyebrow: "03 Review",
        title: "Preview vertical clips with modern captions before download.",
        copy: "Generated clips are organized by timestamp, duration, and readiness. Caption-safe framing keeps the speaker and words clear on mobile.",
        icon: Film,
        visual: (
            <BrowserMockup>
                <ClipReviewScreen />
            </BrowserMockup>
        ),
        mobileVisual: (
            <div className="mx-auto max-w-[230px]">
                <IPhoneMockup>
                    <TourPhoneClip />
                </IPhoneMockup>
            </div>
        ),
    },
    {
        eyebrow: "04 Repurpose",
        title: "Turn the transcript into discipleship and publishing assets.",
        copy: "Discussion guides, devotionals, quotes, carousels, blogs, and summaries all stay tied to the original sermon for easy review.",
        icon: Layers,
        visual: (
            <MacBookMockup>
                <ContentEngineScreen />
            </MacBookMockup>
        ),
        mobileVisual: (
            <MacBookMockup>
                <ContentEngineScreen />
            </MacBookMockup>
        ),
    },
];

function subscribeToReducedMotion(callback: () => void) {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", callback);
    return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
    return false;
}

function useReducedMotion() {
    return useSyncExternalStore(
        subscribeToReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot
    );
}

function clamp(value: number) {
    return Math.min(1, Math.max(0, value));
}

function phase(value: number, start: number, end: number) {
    return clamp((value - start) / (end - start));
}

function useElementProgress(ref: React.RefObject<HTMLElement | null>) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = node.getBoundingClientRect();
            const scrollable = Math.max(1, node.offsetHeight - window.innerHeight);
            setProgress(clamp(-rect.top / scrollable));
        };
        const schedule = () => {
            if (!raf) raf = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);

        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            if (raf) window.cancelAnimationFrame(raf);
        };
    }, [ref]);

    return progress;
}

function useScrollTravel(
    trackRef: React.RefObject<HTMLElement | null>,
    railRef: React.RefObject<HTMLElement | null>
) {
    const [travel, setTravel] = useState(0);

    useEffect(() => {
        const track = trackRef.current;
        const rail = railRef.current;
        if (!track || !rail) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            setTravel(Math.max(0, track.scrollHeight - rail.clientHeight));
        };
        const schedule = () => {
            if (!raf) raf = window.requestAnimationFrame(update);
        };

        update();
        const observer = new ResizeObserver(schedule);
        observer.observe(track);
        observer.observe(rail);
        window.addEventListener("resize", schedule);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", schedule);
            if (raf) window.cancelAnimationFrame(raf);
        };
    }, [trackRef, railRef]);

    return travel;
}

export function ScrollProductTour() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const railRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const rawProgress = useElementProgress(sectionRef);
    const reducedMotion = useReducedMotion();
    const cardTravel = useScrollTravel(trackRef, railRef);
    const progress = rawProgress;
    const cardProgress = phase(progress, 0, 0.56);
    const captionProgress = phase(progress, 0.58, 0.72);
    const contentProgress = phase(progress, 0.76, 0.9);
    const activeIndex = Math.min(tourSteps.length - 1, Math.round(cardProgress * (tourSteps.length - 1)));
    const cardOffset = -cardProgress * cardTravel;

    if (reducedMotion) {
        return <StaticProductTour />;
    }

    return (
        <section
            ref={sectionRef}
            id="tour"
            className="relative z-10 bg-[var(--color-base)] text-[var(--color-text-light)]"
            style={{ minHeight: "560dvh" }}
        >
            <div className="sticky top-0 h-dvh overflow-hidden">
                <ProductTourLayer
                    activeIndex={activeIndex}
                    cardOffset={cardOffset}
                    railRef={railRef}
                    trackRef={trackRef}
                />
                <CaptionStackLayer progress={captionProgress} />
                <ContentStackLayer progress={contentProgress} />
            </div>
        </section>
    );
}

function StaticProductTour() {
    return (
        <section id="tour" className="bg-[var(--color-base)] py-20 text-[var(--color-text-light)] sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="max-w-3xl">
                    <p className="mb-3 text-xs font-semibold uppercase text-[var(--color-secondary)]">Product tour</p>
                    <h2 className="text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
                        A full content room for every message.
                    </h2>
                    <p className="mt-4 text-pretty text-base leading-7 text-[var(--color-text-muted)]">
                        The sermon workflow moves through upload, discovery, review, and repurposing without motion-heavy transitions.
                    </p>
                </div>
                <div className="mt-10 grid gap-5 lg:grid-cols-2">
                    {tourSteps.map((step, index) => (
                        <TourStepCard key={step.eyebrow} step={step} active={index === 0} showVisual />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductTourLayer({
    activeIndex,
    cardOffset,
    railRef,
    trackRef,
}: {
    activeIndex: number;
    cardOffset: number;
    railRef: React.RefObject<HTMLDivElement | null>;
    trackRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="absolute inset-0 z-10 bg-[var(--color-base)]">
            <div className="absolute inset-0 landing-grid opacity-35" />
            <div className="absolute inset-0 bg-[linear-gradient(140deg,var(--color-primary),transparent_26%,transparent_70%,var(--color-secondary))] opacity-[0.1]" />

            <div className="relative mx-auto grid h-full max-w-7xl gap-5 px-4 pb-5 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pb-8 lg:pt-24">
                <div className="min-h-0">
                    <div className="max-w-xl">
                        <p className="mb-3 text-xs font-semibold uppercase text-[var(--color-secondary)]">Product tour</p>
                        <h2 className="text-balance font-display text-[2rem] font-bold leading-tight sm:text-5xl">
                            A full content room for every message.
                        </h2>
                        <p className="mt-4 text-pretty text-base leading-7 text-[var(--color-text-muted)]">
                            The mockup stays pinned while the sermon workflow moves through upload, discovery, review, and repurposing.
                        </p>
                    </div>

                    <div
                        ref={railRef}
                        className="relative mt-5 h-[50dvh] min-h-[330px] overflow-hidden sm:h-[48dvh] lg:h-[520px]"
                    >
                        <div
                            ref={trackRef}
                            className="space-y-4 will-change-transform"
                            style={{ transform: `translate3d(0, ${cardOffset}px, 0)` }}
                        >
                            {tourSteps.map((step, index) => (
                                <TourStepCard key={step.eyebrow} step={step} active={activeIndex === index} />
                            ))}
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--color-base)] to-transparent" />
                    </div>
                </div>

                <div className="hidden min-w-0 lg:block">
                    <TourVisualStage activeIndex={activeIndex} />
                </div>
            </div>
        </div>
    );
}

function TourVisualStage({ activeIndex }: { activeIndex: number }) {
    return (
        <div className="relative mx-auto min-h-[430px] max-w-4xl">
            {tourSteps.map((step, index) => (
                <div
                    key={step.eyebrow}
                    className={cn(
                        "absolute inset-0 transition-all duration-500 ease-out",
                        activeIndex === index
                            ? "translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none translate-y-5 scale-[0.985] opacity-0"
                    )}
                >
                    {step.visual}
                </div>
            ))}
        </div>
    );
}

function StackLayerFrame({
    progress,
    children,
    className,
    id,
}: {
    progress: number;
    children: ReactNode;
    className?: string;
    id?: string;
}) {
    const eased = progress * progress * (3 - 2 * progress);

    return (
        <div
            id={id}
            className={cn("absolute inset-0 z-20 will-change-transform", className)}
            style={{
                transform: `translate3d(0, ${(1 - eased) * 100}%, 0)`,
            }}
        >
            {children}
        </div>
    );
}

function CaptionStackLayer({ progress }: { progress: number }) {
    return (
        <StackLayerFrame
            id="captions"
            progress={progress}
            className="rounded-t-[2rem] border-t border-[var(--color-border)] bg-[var(--color-base)] text-[var(--color-text-light)] shadow-2xl"
        >
            <div className="absolute inset-0 landing-grid opacity-25" />
            <div className="relative mx-auto grid h-full max-w-7xl content-start gap-8 px-4 pb-8 pt-36 sm:px-6 sm:pt-36 lg:grid-cols-[0.9fr_1.1fr] lg:content-center lg:items-center lg:py-20">
                <div>
                    <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Caption quality</p>
                    <h2 className="mt-4 text-balance font-display text-[2rem] font-bold leading-tight sm:text-5xl">
                        Captions that look native to short-form video.
                    </h2>
                    <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
                        Two-line grouping, safe-area placement, brand colors, stronger outlines, and editable word timing before re-render.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {[
                            "Word-level timing from transcript segments",
                            "Karaoke, fade, pop, and static presets",
                            "Speaker-safe vertical crop preview",
                            "Brand kit color and font inheritance",
                        ].map((item) => (
                            <div key={item} className="neon-card flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-light)] shadow-sm">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hidden min-w-0 lg:block">
                    <BrowserMockup>
                        <ClipReviewScreen />
                    </BrowserMockup>
                </div>
            </div>
        </StackLayerFrame>
    );
}

function ContentStackLayer({ progress }: { progress: number }) {
    return (
        <StackLayerFrame
            progress={progress}
            className="z-30 rounded-t-[2rem] border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-light)] shadow-2xl"
        >
            <div className="absolute inset-0 bg-[linear-gradient(140deg,var(--color-secondary),transparent_28%,transparent_70%,var(--color-primary))] opacity-[0.08]" />
            <div className="relative mx-auto grid h-full max-w-7xl content-start gap-8 px-4 pb-8 pt-36 sm:px-6 sm:pt-36 lg:grid-cols-[0.92fr_1.08fr] lg:content-center lg:items-center lg:py-20">
                <div>
                    <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">Content engine</p>
                    <h2 className="mt-4 text-balance font-display text-[2rem] font-bold leading-tight sm:text-5xl">
                        More useful than clips alone.
                    </h2>
                    <p className="mt-5 text-pretty text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
                        Ministry teams need social, discipleship, web, and audio workflows to share the same sermon source instead of scattering work across separate tools.
                    </p>
                </div>
                <div className="hidden min-w-0 lg:block">
                    <MacBookMockup>
                        <ContentEngineScreen />
                    </MacBookMockup>
                </div>
            </div>
        </StackLayerFrame>
    );
}

function TourPhoneClip() {
    return (
        <div className="relative h-full overflow-hidden bg-[#12081F]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(109,177,191,0.18),rgba(243,154,157,0.08)_45%,rgba(0,0,0,0.82))]" />
            <PeopleThumbnail className="absolute inset-x-0 top-0 h-[58%] rounded-none" variant="stage" />
            <div className="absolute bottom-24 left-5 right-5 rounded-xl bg-black/60 px-3 py-2 text-center text-xl font-black uppercase leading-none text-white shadow-xl">
                Peace is not pressure
                <span className="block text-[#F39A9D]">it is presence</span>
            </div>
            <div className="absolute bottom-10 left-5 right-5 flex items-center justify-between text-[10px] text-white/70">
                <span>Clip 01</span>
                <span>0:41</span>
            </div>
        </div>
    );
}

function TourStepCard({
    step,
    active,
    showVisual = false,
}: {
    step: (typeof tourSteps)[number];
    active: boolean;
    showVisual?: boolean;
}) {
    return (
        <div
            className={cn(
                "neon-card rounded-2xl border p-5 transition-all duration-300",
                active
                    ? "border-[var(--color-primary)]/50 bg-[var(--color-surface)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]/70"
            )}
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                    <step.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase text-[var(--color-secondary)]">{step.eyebrow}</p>
            </div>
            <h3 className="text-balance font-display text-xl font-semibold leading-snug">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{step.copy}</p>
            <div className={cn("mt-5 overflow-hidden rounded-xl lg:hidden", showVisual && "lg:block")}>
                {step.mobileVisual}
            </div>
        </div>
    );
}
