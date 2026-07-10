"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle, XCircle } from "lucide-react";

interface ProcessingPipelineProps {
    status: string; // sermon status: uploading | processing | ready | failed | cancelled
    isPodcast?: boolean;
    hasTranscript: boolean;
    clipCounts?: {
        ready: number;
        processing: number;
        pending: number;
        failed: number;
        total: number;
    };
    contentReadyCount?: number;
}

type StageState = "done" | "active" | "pending";

/**
 * Live, stage-based processing status derived entirely from Convex data.
 * Because every query is reactive, stages tick over in real time without
 * polling: upload -> transcription -> moment discovery -> clip rendering ->
 * written content.
 */
export function ProcessingPipeline({
    status,
    isPodcast,
    hasTranscript,
    clipCounts,
    contentReadyCount = 0,
}: ProcessingPipelineProps) {
    const failed = status === "failed";
    const uploading = status === "uploading";
    const clipsReady = (clipCounts?.ready ?? 0) > 0;
    const clipsInFlight = (clipCounts?.processing ?? 0) + (clipCounts?.pending ?? 0) > 0;
    const contentReady = contentReadyCount > 0;

    const stages: Array<{ label: string; detail: string; state: StageState }> = [
        {
            label: "Upload",
            detail: "Video stored securely",
            state: uploading ? "active" : "done",
        },
        {
            label: "Transcribe",
            detail: "Word-level timing for captions & search",
            state: hasTranscript ? "done" : uploading ? "pending" : "active",
        },
        {
            label: "Find moments",
            detail: isPodcast
                ? "Scoring stories, takes & Q&A for virality"
                : "Scoring the most powerful moments",
            state: clipsReady || clipsInFlight
                ? "done"
                : hasTranscript
                    ? "active"
                    : "pending",
        },
        {
            label: "Render clips",
            detail: "Vertical reframe + captions burned in",
            state: clipsReady && !clipsInFlight
                ? "done"
                : clipsInFlight || (hasTranscript && !clipsReady)
                    ? clipsInFlight ? "active" : "pending"
                    : "pending",
        },
        {
            label: "Write content",
            detail: isPodcast
                ? "Show notes, chapters, quotes & posts"
                : "Quotes, guides, devotionals & posts",
            state: contentReady ? "done" : hasTranscript ? "active" : "pending",
        },
    ];

    // When the sermon is fully ready, everything reads done
    const allDone = status === "ready";

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${failed
                ? "border-red-500/30 bg-red-500/5"
                : "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
                }`}
        >
            {failed ? (
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                    <div>
                        <p className="font-medium text-[var(--color-text-light)]">
                            Processing hit a problem
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Anything already produced is kept. Try &quot;Generate All Content&quot; to retry,
                            or re-upload if the problem persists.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {stages.map((stage, index) => {
                        const state: StageState = allDone ? "done" : stage.state;
                        return (
                            <div key={stage.label} className="flex items-center gap-3 sm:flex-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {state === "done" ? (
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                                    ) : state === "active" ? (
                                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--color-primary)]" />
                                    ) : (
                                        <Circle className="h-5 w-5 shrink-0 text-[var(--color-border)]" />
                                    )}
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium leading-tight ${state === "pending"
                                            ? "text-[var(--color-text-muted)]"
                                            : "text-[var(--color-text-light)]"
                                            }`}>
                                            {stage.label}
                                        </p>
                                        <p className="hidden text-[11px] leading-tight text-[var(--color-text-muted)] xl:block">
                                            {stage.detail}
                                        </p>
                                    </div>
                                </div>
                                {index < stages.length - 1 && (
                                    <div className="hidden h-px flex-1 bg-[var(--color-border)] sm:block" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
