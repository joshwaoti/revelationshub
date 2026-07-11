"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Download, Share2, Calendar, Heart, Loader2, Sparkles, ChevronLeft, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useGenerateContent } from "@/hooks/use-generate-content";
import { openPrintWindow, shareText, PrintSection } from "@/lib/print-export";
import { copyFormatted, escapeHtml } from "@/lib/copy-formatted";

type DevotionalDay = {
    day?: number;
    dayName?: string;
    title?: string;
    scripture?: string;
    reflection?: string;
    prayerFocus?: string;
};

type DevotionalContent = {
    title?: string;
    subtitle?: string;
    days?: DevotionalDay[];
};

export default function DevotionalsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    // Fetch sermon
    const sermon = useQuery(api.sermons.getById, { sermonId });

    // Fetch only devotional content for this page.
    const devotionalContent = useQuery(
        api.generatedContent.getBySermonAndType,
        sermon?._id ? { sermonId: sermon._id, type: "devotional" } : "skip"
    );

    const devotional = devotionalContent?.find(c => c.status === "ready");
    const isProcessing = devotionalContent?.some(c => c.status === "processing");

    // Generate content hook
    const { isGenerating, generateContent } = useGenerateContent();

    const handleRegenerate = () => {
        if (sermon?._id) {
            generateContent(sermon._id, ["devotional"]);
        }
    };

    // Parse content
    const parseContent = (content: string): DevotionalContent | null => {
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    };

    // Loading state
    if (sermon === undefined || devotionalContent === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const data = devotional ? parseContent(devotional.content) : null;

    // Podcasts get a growth/action series; sermons keep devotional language
    const isPodcast = sermon?.videoType === "podcast";
    const seriesName = isPodcast ? "5-Day Series" : "Weekly Devotional";
    const seriesNoun = isPodcast ? "action series" : "devotional";

    // Build the printable/shareable representation of the series
    const buildPrintSections = (): PrintSection[] => {
        if (!data?.days) return [];
        return data.days.map((day, index) => {
            const bodyParts: string[] = [];
            if (day.scripture) bodyParts.push(`${isPodcast ? "Builds on" : "Scripture"}: ${day.scripture}`);
            if (day.reflection) bodyParts.push(day.reflection);
            if (day.prayerFocus) bodyParts.push(`${isPodcast ? "Reflection prompt" : "Prayer focus"}: ${day.prayerFocus}`);
            return {
                heading: `${day.dayName || `Day ${day.day ?? index + 1}`}${day.title ? ` — ${day.title}` : ""}`,
                body: bodyParts.join("\n\n"),
            };
        });
    };

    const seriesAsText = (): string => {
        const lines: string[] = [data?.title || seriesName, data?.subtitle || "", ""];
        for (const section of buildPrintSections()) {
            if (section.heading) lines.push(section.heading.toUpperCase());
            if (section.body) lines.push(section.body);
            lines.push("");
        }
        return lines.join("\n").trim();
    };

    const handleExportPdf = () => {
        if (!data) return;
        const opened = openPrintWindow({
            title: data.title || seriesName,
            subtitle: data.subtitle || `Based on "${sermon?.title ?? ""}"`,
            sections: buildPrintSections(),
        });
        if (!opened) {
            toast.error("Popup blocked", { description: "Allow popups for this site to export." });
        } else {
            toast.info("Choose “Save as PDF” in the print dialog", { duration: 5000 });
        }
    };

    const handleShare = async () => {
        if (!data) return;
        const result = await shareText(data.title || seriesName, seriesAsText());
        if (result === "copied") toast.success(`${seriesName} copied to clipboard`);
        else if (result === "failed") toast.error("Sharing isn't available in this browser");
    };

    // WhatsApp-style plain text for one day: *bold*, _italic_, emoji anchors.
    const dayAsPlainText = (day: DevotionalDay, index: number): string => {
        const lines: string[] = [];
        const heading = `${day.dayName || `Day ${day.day ?? index + 1}`}${day.title ? ` — ${day.title}` : ""}`;
        lines.push(`*${heading}*`);
        if (data?.title) lines.push(`_${data.title}_`);
        lines.push("");
        if (day.scripture) {
            lines.push(`📖 ${isPodcast ? "Builds on" : "Scripture"}: ${day.scripture}`);
            lines.push("");
        }
        if (day.reflection) {
            lines.push(day.reflection);
            lines.push("");
        }
        if (day.prayerFocus) {
            lines.push(`🙏 *${isPodcast ? "Reflection prompt" : "Prayer focus"}:* ${day.prayerFocus}`);
            lines.push("");
        }
        lines.push(`— Based on "${sermon?.title ?? ""}"`);
        return lines.join("\n").trim();
    };

    // Rich HTML flavor of the same day, for Notes / Docs / email.
    const dayAsHtml = (day: DevotionalDay, index: number): string => {
        const heading = `${day.dayName || `Day ${day.day ?? index + 1}`}${day.title ? ` — ${day.title}` : ""}`;
        const parts: string[] = [`<h3>${escapeHtml(heading)}</h3>`];
        if (data?.title) parts.push(`<p><em>${escapeHtml(data.title)}</em></p>`);
        if (day.scripture) {
            parts.push(`<p>📖 <strong>${isPodcast ? "Builds on" : "Scripture"}:</strong> ${escapeHtml(day.scripture)}</p>`);
        }
        if (day.reflection) {
            parts.push(
                day.reflection
                    .split(/\n{2,}/)
                    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
                    .join("")
            );
        }
        if (day.prayerFocus) {
            parts.push(`<p>🙏 <strong>${isPodcast ? "Reflection prompt" : "Prayer focus"}:</strong> ${escapeHtml(day.prayerFocus)}</p>`);
        }
        parts.push(`<p>— Based on "${escapeHtml(sermon?.title ?? "")}"</p>`);
        return parts.join("\n");
    };

    const handleCopyDay = async (day: DevotionalDay, index: number) => {
        const ok = await copyFormatted(dayAsHtml(day, index), dayAsPlainText(day, index));
        if (ok) {
            toast.success(`${day.dayName || `Day ${day.day ?? index + 1}`} copied`, {
                description: "Paste into WhatsApp, Notes, or anywhere else — formatting comes along.",
            });
        } else {
            toast.error("Couldn't copy — your browser blocked clipboard access");
        }
    };

    const handleCopyAll = async () => {
        if (!data?.days) return;
        const plain = [
            `*${data.title || seriesName}*`,
            data.subtitle ? `_${data.subtitle}_` : "",
            "",
            ...data.days.map((day, i) => dayAsPlainText(day, i)),
        ]
            .join("\n\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
        const html = [
            `<h2>${escapeHtml(data.title || seriesName)}</h2>`,
            data.subtitle ? `<p><em>${escapeHtml(data.subtitle)}</em></p>` : "",
            ...data.days.map((day, i) => dayAsHtml(day, i)),
        ].join("\n<hr/>\n");
        const ok = await copyFormatted(html, plain);
        if (ok) {
            toast.success(`${seriesName} copied`, {
                description: "All days copied with formatting — ready to paste anywhere.",
            });
        } else {
            toast.error("Couldn't copy — your browser blocked clipboard access");
        }
    };

    return (
        <div className="min-h-[calc(100vh-48px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link href={`/sermon/${sermonId}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)]">
                            {seriesName}
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Based on &quot;{sermon?.title}&quot;
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyAll} disabled={!data}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={!data}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} disabled={!data}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* No content state */}
            {!devotional && !isProcessing && (
                <div className="text-center py-16">
                    <Calendar className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        No {seriesName} Generated Yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Generate a 5-day {seriesNoun} from your {isPodcast ? "episode" : "sermon"}
                    </p>
                    <Button onClick={handleRegenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : `Generate ${seriesName}`}
                    </Button>
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-2">
                        Generating {seriesName}...
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                        This may take a few moments
                    </p>
                </div>
            )}

            {/* Content */}
            {data && (
                <Card className="max-w-3xl mx-auto">
                    <CardContent className="p-6 sm:p-10 relative">
                        <Button
                            variant="default"
                            size="sm"
                            className="absolute top-3 right-3 sm:top-4 sm:right-4"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Regenerate
                        </Button>

                        {/* Title */}
                        <div className="text-center border-b border-[var(--color-border)] pb-6 mb-8 mt-6 sm:mt-0">
                            <div className="inline-flex items-center gap-2 text-[var(--color-secondary)] mb-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{seriesName}</span>
                            </div>
                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-light)]">
                                {data.title || sermon?.title}
                            </h2>
                            {data.subtitle && (
                                <p className="text-[var(--color-text-muted)] mt-2">
                                    {data.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Devotional Days */}
                        <div className="space-y-6">
                            {data.days?.map((day, index) => (
                                <div key={index} className="group">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                                {day.day || index + 1}
                                            </div>
                                            {index < (data.days?.length || 0) - 1 && (
                                                <div className="w-0.5 h-full min-h-[60px] bg-[var(--color-primary)]/20 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                    <span className="text-sm font-medium text-[var(--color-primary)]">
                                                        {day.dayName}
                                                    </span>
                                                    <h3 className="font-display text-lg font-semibold text-[var(--color-text-light)]">
                                                        {day.title}
                                                    </h3>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="shrink-0 text-[var(--color-text-muted)] opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100"
                                                    onClick={() => handleCopyDay(day, index)}
                                                    aria-label={`Copy ${day.dayName || `Day ${day.day ?? index + 1}`}`}
                                                >
                                                    <Copy className="h-4 w-4 sm:mr-1.5" />
                                                    <span className="hidden sm:inline">Copy</span>
                                                </Button>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                                {isPodcast ? "Builds on" : "Scripture"}: {day.scripture}
                                            </p>
                                            <div className="bg-[var(--color-surface)] rounded-[var(--radius-default)] p-4 border border-[var(--color-border)]">
                                                <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                                    {day.reflection}
                                                </p>
                                                {day.prayerFocus && (
                                                    <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                                                        <p className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                                                            <Heart className="h-3 w-3" />
                                                            {isPodcast ? "Reflection Prompt" : "Prayer Focus"}
                                                        </p>
                                                        <p className="text-sm text-[var(--color-text-light)] mt-1 italic">
                                                            &quot;{day.prayerFocus}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Created with RevelationsHub
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
