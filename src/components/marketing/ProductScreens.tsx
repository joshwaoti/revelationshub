import {
    BookOpen,
    FileText,
    Image as ImageIcon,
    LayoutGrid,
    MessageSquare,
    Mic,
    Play,
    Quote,
    Sparkles,
    Wand2,
} from "lucide-react";
import type { ReactNode } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

const transcriptLines = [
    ["00:12", "The promise is not that the storm disappears."],
    ["00:19", "The promise is that Christ stays near enough to steady you."],
    ["00:27", "That is why courage can look quiet and still be real."],
];

function ScreenShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("h-full min-w-0 overflow-hidden bg-[var(--color-base)] p-4 text-[var(--color-text-light)] relative", className)}>
            {children}
        </div>
    );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm", className)}>
            {children}
        </div>
    );
}


export function PeopleThumbnail({
    className,
    variant = "stage",
}: {
    className?: string;
    variant?: "stage" | "group" | "worship" | "outreach";
}) {
    const tone = {
        stage: {
            sky: "#182434",
            light: "#6DB1BF",
            accent: "#F39A9D",
            caption: "Mercy meets us here",
        },
        group: {
            sky: "#17241f",
            light: "#8fd8bd",
            accent: "#F39A9D",
            caption: "Faith becomes practice",
        },
        worship: {
            sky: "#241730",
            light: "#F39A9D",
            accent: "#6DB1BF",
            caption: "Hope has a voice",
        },
        outreach: {
            sky: "#182833",
            light: "#F8D99A",
            accent: "#6DB1BF",
            caption: "Love moves outward",
        },
    }[variant];

    return (
        <div className={cn("relative overflow-hidden rounded-lg bg-[#12081F]", className)} style={{ backgroundColor: tone.sky }}>
            <div className="absolute inset-0 video-frame-noise" />
            <div
                className="absolute inset-x-0 top-0 h-[58%]"
                style={{
                    background: `linear-gradient(135deg, ${tone.light}55, transparent 38%), linear-gradient(215deg, ${tone.accent}45, transparent 46%)`,
                }}
            />
            <div className="absolute left-[11%] top-[16%] h-[64%] w-[1px] origin-top rotate-[17deg] bg-white/25" />
            <div className="absolute right-[17%] top-[8%] h-[72%] w-[1px] origin-top rotate-[-13deg] bg-white/20" />
            <div className="absolute left-[18%] top-[20%] h-3 w-24 rounded-full blur-md" style={{ backgroundColor: tone.light }} />
            <div className="absolute right-[14%] top-[16%] h-3 w-28 rounded-full blur-md" style={{ backgroundColor: tone.accent }} />
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.82))]" />

            <div className="absolute bottom-[18%] left-1/2 flex -translate-x-1/2 items-end gap-2">
                {(variant === "group" || variant === "outreach"
                    ? ["h-16", "h-20", "h-14", "h-[4.5rem]"]
                    : ["h-[4.5rem]", "h-24", "h-16"]
                ).map((height, index) => (
                    <div key={index} className={cn("relative w-10", height)}>
                        <span className="absolute left-1/2 top-0 size-7 -translate-x-1/2 rounded-full bg-[#4E2B1D]" />
                        <span
                            className="absolute bottom-0 left-1/2 w-10 -translate-x-1/2 rounded-t-[1.4rem]"
                            style={{
                                height: "72%",
                                backgroundColor: index % 2 === 0 ? "#ffeaec" : tone.light,
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-black/58 px-3 py-2 text-center text-[clamp(13px,3vw,24px)] font-black uppercase leading-none text-white shadow-xl">
                {tone.caption}
                <span className="mt-1 block" style={{ color: tone.accent }}>this week</span>
            </div>
            <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2">
                <span className="h-1 flex-1 rounded-full bg-white/25">
                    <span className="block h-full w-2/3 rounded-full" style={{ backgroundColor: tone.light }} />
                </span>
                <span className="text-[9px] font-medium text-white/65">0:41</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 hover:opacity-100">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-[#301A4B] shadow-xl">
                    <Play className="h-5 w-5 fill-current" />
                </div>
            </div>
        </div>
    );
}

export function DashboardScreen() {
    return (
        <ScreenShell className="p-0">
            {/* Real App Screenshot Mockup with Fallback */}
            <div className="relative w-full h-full min-h-[300px]">
                <NextImage
                    src="/mockups/dashboard.png"
                    alt="RevelationsHub Sermon Workspace Dashboard Mockup"
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover object-top"
                    priority
                />
            </div>
        </ScreenShell>
    );
}

export function LibraryScreen() {
    return (
        <ScreenShell className="p-0">
            <div className="relative w-full h-full min-h-[300px]">
                <NextImage
                    src="/mockups/library.png"
                    alt="RevelationsHub Sermon Media Library Mockup"
                    fill
                    sizes="(max-width: 1200px) 100vw, 800px"
                    className="object-cover object-top"
                />
            </div>
        </ScreenShell>
    );
}

export function ClipReviewScreen() {
    return (
        <ScreenShell className="p-0">
            <div className="relative w-full h-full min-h-[300px]">
                <NextImage
                    src="/mockups/clip-review.png"
                    alt="RevelationsHub Clip Review Dashboard Mockup"
                    fill
                    sizes="(max-width: 1200px) 100vw, 800px"
                    className="object-cover object-top"
                />
            </div>
        </ScreenShell>
    );
}

export function PhoneClipPreview() {
    return (
        <div className="relative aspect-[9/16] h-full max-h-[420px] min-h-[300px] overflow-hidden rounded-[1.75rem] bg-[#12081F] shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(109,177,191,0.18),rgba(243,154,157,0.08)_45%,rgba(0,0,0,0.82))]" />
            <PeopleThumbnail className="absolute inset-x-0 top-0 h-[58%] rounded-none" variant="stage" />
            <div className="absolute bottom-14 left-8 right-8 rounded-xl bg-black/60 px-3 py-2 text-center text-[clamp(18px,4vw,30px)] font-black uppercase leading-none text-white shadow-2xl">
                Peace is not the absence of pressure
                <span className="block text-[#F39A9D]">it is presence</span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[10px] text-white/70">
                <span>@gracecommunity</span>
                <span>0:41</span>
            </div>
        </div>
    );
}

export function TranscriptScreen() {
    return (
        <ScreenShell>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="font-display text-lg font-bold">Transcription</p>
                    <p className="text-xs text-[var(--color-text-muted)]">8,421 words with timestamps</p>
                </div>
                <button className="rounded-lg border border-[var(--color-primary)]/40 px-3 py-2 text-xs font-medium text-[var(--color-primary)]">Export</button>
            </div>
            <Panel className="space-y-3 p-4">
                {transcriptLines.map(([time, text]) => (
                    <div key={time} className="grid grid-cols-[52px_1fr] gap-3 rounded-xl p-3 hover:bg-[var(--color-primary)]/10">
                        <span className="rounded-md bg-[var(--color-primary)]/12 px-2 py-1 text-center font-mono text-[10px] text-[var(--color-primary)]">{time}</span>
                        <p className="text-sm leading-relaxed text-[var(--color-text-light)]">{text}</p>
                    </div>
                ))}
                <div className="mt-4 rounded-xl bg-[var(--color-secondary)]/10 p-3 text-xs text-[var(--color-text-light)]">
                    Searchable text is ready for blogs, quotes, devotionals, and group discussion.
                </div>
            </Panel>
        </ScreenShell>
    );
}

export function BrandKitScreen() {
    return (
        <ScreenShell className="p-0">
            <div className="relative w-full h-full min-h-[300px]">
                <NextImage
                    src="/mockups/brand-kit.png"
                    alt="RevelationsHub Brand Kit Manager Mockup"
                    fill
                    sizes="(max-width: 1200px) 100vw, 800px"
                    className="object-cover object-top"
                />
            </div>
        </ScreenShell>
    );
}

export function ContentEngineScreen() {
    const items = [
        { icon: Wand2, label: "Clips", count: "12" },
        { icon: Quote, label: "Quotes", count: "9" },
        { icon: LayoutGrid, label: "Carousel", count: "6" },
        { icon: MessageSquare, label: "Discussion", count: "1" },
        { icon: BookOpen, label: "Devotional", count: "5 days" },
        { icon: Mic, label: "Podcast", count: "42 min" },
        { icon: ImageIcon, label: "Graphics", count: "9" },
        { icon: FileText, label: "Blog", count: "Draft" },
    ];

    return (
        <ScreenShell>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="font-display text-lg font-bold">Content Engine</p>
                    <p className="text-xs text-[var(--color-text-muted)]">One sermon becomes a full content library</p>
                </div>
                <Sparkles className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>
            <div className="grid grid-cols-4 gap-3">
                {items.map((item) => (
                    <Panel key={item.label}>
                        <item.icon className="mb-4 h-4 w-4 text-[var(--color-primary)]" />
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{item.count}</p>
                    </Panel>
                ))}
            </div>
        </ScreenShell>
    );
}
