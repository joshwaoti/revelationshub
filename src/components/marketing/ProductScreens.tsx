import {
    BookOpen,
    CheckCircle2,
    FileText,
    Image,
    LayoutGrid,
    MessageSquare,
    Mic,
    Palette,
    Play,
    Quote,
    Sparkles,
    Upload,
    Wand2,
} from "lucide-react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/RevelationsLogo";
import { cn } from "@/lib/utils";

const clipCards = [
    { title: "Grace when pressure rises", time: "12:08", score: "94%" },
    { title: "The moment hope becomes action", time: "24:31", score: "91%" },
    { title: "A prayer for the anxious heart", time: "38:44", score: "88%" },
];

const transcriptLines = [
    ["00:12", "The promise is not that the storm disappears."],
    ["00:19", "The promise is that Christ stays near enough to steady you."],
    ["00:27", "That is why courage can look quiet and still be real."],
];

function ScreenShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("h-full min-w-0 overflow-hidden bg-[var(--color-base)] p-4 text-[var(--color-text-light)]", className)}>
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

function MiniMetric({ label, value }: { label: string; value: string }) {
    return (
        <Panel>
            <p className="text-[10px] uppercase text-[var(--color-text-muted)]">{label}</p>
            <p className="mt-1 font-display text-lg font-semibold text-[var(--color-text-light)]">{value}</p>
        </Panel>
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
        <ScreenShell>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LogoMark className="h-7 w-7" />
                    <div>
                        <p className="font-display text-sm font-semibold">Sunday Service</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Ready for review</p>
                    </div>
                </div>
                <div className="rounded-full bg-[var(--color-primary)]/15 px-3 py-1 text-[10px] font-medium text-[var(--color-primary)]">
                    Live sync
                </div>
            </div>

            <div className="grid h-[calc(100%-44px)] grid-cols-[1.25fr_0.75fr] gap-4">
                <div className="space-y-4">
                    <PeopleThumbnail className="aspect-video" variant="worship" />
                    <div className="grid grid-cols-3 gap-3">
                        <MiniMetric label="Clips" value="12" />
                        <MiniMetric label="Transcript" value="8.4k" />
                        <MiniMetric label="Assets" value="31" />
                    </div>
                    <Panel>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold">Top moments</p>
                            <p className="text-[10px] text-[var(--color-secondary)]">Ranked by resonance</p>
                        </div>
                        <div className="space-y-2">
                            {clipCards.map((clip) => (
                                <div key={clip.title} className="flex items-center justify-between rounded-lg bg-[var(--color-base)]/60 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <Wand2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                                        <div>
                                            <p className="text-[11px] text-[var(--color-text-light)]">{clip.title}</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)]">{clip.time}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[var(--color-secondary)]">{clip.score}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>

                <div className="space-y-3">
                    {[
                        { icon: Wand2, label: "Magic clips", value: "12 ready" },
                        { icon: BookOpen, label: "Discussion guide", value: "Ready" },
                        { icon: Quote, label: "Image quotes", value: "9 saved" },
                        { icon: LayoutGrid, label: "Carousel", value: "6 slides" },
                        { icon: FileText, label: "Blog draft", value: "Ready" },
                    ].map((item) => (
                        <Panel key={item.label}>
                            <div className="mb-3 flex items-center justify-between">
                                <item.icon className="h-4 w-4 text-[var(--color-primary)]" />
                                <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                            </div>
                            <p className="text-xs font-medium">{item.label}</p>
                            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{item.value}</p>
                        </Panel>
                    ))}
                </div>
            </div>
        </ScreenShell>
    );
}

export function LibraryScreen() {
    return (
        <ScreenShell>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="font-display text-lg font-bold">Sermon Library</p>
                    <p className="text-xs text-[var(--color-text-muted)]">42 messages uploaded</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[#301A4B]">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Sermon
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[
                    ["Finding Peace in Chaos", "stage"],
                    ["Faith That Builds", "group"],
                    ["Mercy at the Table", "worship"],
                    ["The Quiet Courage", "outreach"],
                    ["Prayer That Endures", "stage"],
                    ["A House of Hope", "group"],
                ].map(([title, variant], index) => (
                    <Panel key={title} className="overflow-hidden p-0">
                        <PeopleThumbnail className="aspect-video rounded-none" variant={variant as "stage" | "group" | "worship" | "outreach"} />
                        <div className="p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                                    {index < 4 ? "Ready" : "Processing"}
                                </span>
                                <span className="text-[10px] text-[var(--color-text-muted)]">42:15</span>
                            </div>
                            <p className="line-clamp-1 text-xs font-semibold">{title}</p>
                            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Pastor Michael</p>
                        </div>
                    </Panel>
                ))}
            </div>
        </ScreenShell>
    );
}

export function ClipReviewScreen() {
    return (
        <ScreenShell className="grid grid-cols-[0.82fr_1fr] gap-4">
            <div className="space-y-2 overflow-hidden">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold">Generated clips</p>
                    <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-1 text-[10px] text-[var(--color-primary)]">12 ready</span>
                </div>
                {clipCards.map((clip, index) => (
                    <div
                        key={clip.title}
                        className={cn(
                            "rounded-xl border p-3",
                            index === 0
                                ? "border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10"
                                : "border-[var(--color-border)] bg-[var(--color-surface)]"
                        )}
                    >
                        <p className="text-xs font-medium">{clip.title}</p>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                            <span>{clip.time}</span>
                            <span>0:41</span>
                            <span>{clip.score}</span>
                        </div>
                    </div>
                ))}
                <button className="mt-3 w-full rounded-lg border border-[var(--color-secondary)]/40 py-2 text-xs text-[var(--color-secondary)]">
                    Generate more
                </button>
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <PhoneClipPreview />
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
        <ScreenShell>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="font-display text-lg font-bold">Brand Kit</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Every export stays on-brand</p>
                </div>
                <Palette className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>
            <div className="grid grid-cols-[0.85fr_1fr] gap-4">
                <div className="space-y-3">
                    {["#6DB1BF", "#F39A9D", "#3F6C51"].map((color) => (
                        <Panel key={color} className="flex items-center gap-3">
                            <span className="h-9 w-9 rounded-lg border border-[var(--color-border)]" style={{ backgroundColor: color }} />
                            <span className="font-mono text-xs text-[var(--color-text-muted)]">{color}</span>
                        </Panel>
                    ))}
                    <Panel>
                        <p className="text-xs text-[var(--color-text-muted)]">Heading font</p>
                        <p className="font-display text-xl font-bold">Outfit</p>
                    </Panel>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#6DB1BF,#F39A9D)] p-4">
                    <PeopleThumbnail className="absolute inset-x-0 bottom-0 h-24 rounded-none opacity-80" variant="group" />
                    <LogoMark className="relative mb-8 h-9 w-9" />
                    <p className="relative mt-10 text-2xl font-black leading-tight text-white">Hope has a voice this week.</p>
                    <p className="relative mt-3 text-xs font-medium text-white/80">Grace Community Church</p>
                </div>
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
        { icon: Image, label: "Graphics", count: "9" },
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
