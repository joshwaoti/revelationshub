"use client";

import { use, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Send,
    Loader2,
    Sparkles,
    MessageSquare,
    Film,
    Trash2,
    Bot,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SERMON_SUGGESTIONS = [
    "What were the main points of this sermon?",
    "Clip the most encouraging moment",
    "Find the part about faith and make a clip",
    "What scripture references were mentioned?",
];

const PODCAST_SUGGESTIONS = [
    "What topics were covered in this episode?",
    "Clip the best story the guest told",
    "Find the hottest take and make a clip",
    "Summarize the advice given in this episode",
];

export default function TranscriptChatPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const sermonId = resolvedParams.id as Id<"sermons">;

    const sermon = useQuery(api.sermons.getById, { sermonId });
    const messages = useQuery(api.chatMessages.getBySermon, { sermonId });
    const transcriptSummary = useQuery(api.transcripts.getSummaryBySermon, { sermonId });
    const clearChat = useMutation(api.chatMessages.clear);

    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const isPodcast = sermon?.videoType === "podcast";
    const suggestions = isPodcast ? PODCAST_SUGGESTIONS : SERMON_SUGGESTIONS;
    const hasTranscript = transcriptSummary?.exists;

    // Keep the newest message in view
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages?.length, isSending]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        setInput("");
        setIsSending(true);
        try {
            const response = await fetch("/api/chat/transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sermonId, message: trimmed }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Failed to send message");
            }

            const data = await response.json();
            if (data.action) {
                toast.success("Clip generation started", {
                    description: `${formatTime(data.action.startTime)} – ${formatTime(data.action.endTime)} · check the Clips page in a few minutes`,
                });
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message");
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleClear = async () => {
        try {
            await clearChat({ sermonId });
        } catch {
            toast.error("Failed to clear conversation");
        }
    };

    if (sermon === undefined || messages === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (sermon === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-[var(--color-text-muted)]">Not found</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-48px)] flex flex-col max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href={`/sermon/${sermonId}`}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h1 className="font-display text-lg font-semibold text-[var(--color-text-light)] truncate">
                            Ask the Transcript
                        </h1>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {sermon.title}
                        </p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClear} title="Clear conversation">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-4">
                {messages.length === 0 && (
                    <motion.div
                        className="flex flex-col items-center justify-center h-full text-center px-4"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center mb-4">
                            <MessageSquare className="h-7 w-7 text-[var(--color-primary)]" />
                        </div>
                        <h2 className="font-display text-xl font-semibold text-[var(--color-text-light)] mb-2">
                            Chat with this {isPodcast ? "episode" : "sermon"}
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-6">
                            Ask questions about what was said, or describe a moment you want as a clip.
                            I&apos;ll check the moments already found — and if it isn&apos;t there, I&apos;ll create it from the transcript.
                        </p>
                        {hasTranscript ? (
                            <div className="grid gap-2 w-full max-w-md sm:grid-cols-2">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => sendMessage(suggestion)}
                                        disabled={isSending}
                                        className="text-left text-sm p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-light)] hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-primary)]/5 transition-colors"
                                    >
                                        <Sparkles className="h-3.5 w-3.5 inline mr-2 text-[var(--color-primary)]" />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3">
                                The transcript isn&apos;t ready yet — chat opens as soon as processing completes.
                            </p>
                        )}
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === "user" ? "order-1" : ""}`}>
                                <div
                                    className={
                                        message.role === "user"
                                            ? "rounded-2xl rounded-br-md bg-[var(--color-primary)] text-white px-4 py-2.5 text-sm whitespace-pre-wrap"
                                            : "rounded-2xl rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-light)] px-4 py-2.5 text-sm whitespace-pre-wrap"
                                    }
                                >
                                    {message.role === "assistant" && (
                                        <Bot className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5 text-[var(--color-primary)]" />
                                    )}
                                    {message.content}
                                </div>

                                {/* Clip action chip */}
                                {message.action && (
                                    <Link href={`/sermon/${sermonId}/clips`}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-3 py-2 text-xs text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/20 transition-colors"
                                        >
                                            <Film className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                                            <span className="font-medium">
                                                {message.action.title || "New clip"}
                                            </span>
                                            <span className="text-[var(--color-text-muted)]">
                                                {formatTime(message.action.startTime)}–{formatTime(message.action.endTime)}
                                            </span>
                                            <span className="text-[var(--color-primary)] font-medium">View clips →</span>
                                        </motion.div>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Thinking indicator */}
                {isSending && (
                    <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="rounded-2xl rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3">
                            <div className="flex items-center gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                                <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                                    Reading the transcript…
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Composer */}
            <div className="pb-4">
                <div className="flex items-end gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 focus-within:border-[var(--color-primary)]/60 transition-colors">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(input);
                            }
                        }}
                        placeholder={
                            hasTranscript
                                ? `Ask anything, or describe a clip you want…`
                                : "Waiting for the transcript…"
                        }
                        disabled={!hasTranscript || isSending}
                        rows={1}
                        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50 max-h-32"
                    />
                    <Button
                        size="sm"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isSending || !hasTranscript}
                        className="rounded-xl shrink-0"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
                    Clips created here appear on the Clips page · rendering takes a few minutes
                </p>
            </div>
        </div>
    );
}
