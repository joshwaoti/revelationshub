"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Loader2,
    Wand2,
    Clock,
    MessageSquare,
    Type,
    Sparkles,
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface RegenerateClipsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sermonId: Id<"sermons">;
    sermonTitle: string;
    defaultCaptionEffect?: CaptionEffect;
    onSuccess?: () => void;
}

type ClipLocationType = "auto" | "text" | "time";
type CaptionEffect = "none" | "pop" | "fade" | "karaoke";

export function RegenerateClipsModal({
    open,
    onOpenChange,
    sermonId,
    sermonTitle,
    defaultCaptionEffect = "karaoke",
    onSuccess,
}: RegenerateClipsModalProps) {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Clip location type - default to "auto" for best moments
    const [locationType, setLocationType] = useState<ClipLocationType>("auto");

    // Text-based clip specification (optional)
    const [clipDescription, setClipDescription] = useState("");

    // Time-based clip specification (optional)
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Caption effect - defaults to the style the user last picked for this video
    const [captionEffect, setCaptionEffect] = useState<CaptionEffect>(defaultCaptionEffect);

    // Number of clips
    const [clipCount, setClipCount] = useState(3);

    // Format time input (mm:ss or seconds) to seconds
    const parseTimeToSeconds = (time: string): number | null => {
        if (!time) return null;

        // If it contains colon, parse as mm:ss
        if (time.includes(":")) {
            const parts = time.split(":");
            if (parts.length === 2) {
                const mins = parseInt(parts[0], 10);
                const secs = parseInt(parts[1], 10);
                if (!isNaN(mins) && !isNaN(secs)) {
                    return mins * 60 + secs;
                }
            }
        } else {
            // Parse as seconds
            const secs = parseFloat(time);
            if (!isNaN(secs)) {
                return secs;
            }
        }
        return null;
    };

    // Handle regenerate
    const handleRegenerate = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const payload: {
                sermonId: string;
                captionEffect: CaptionEffect;
                clipCount: number;
                locationType: string;
                clipDescription?: string;
                startTime?: number;
                endTime?: number;
                appendMode: boolean;
            } = {
                sermonId,
                captionEffect,
                clipCount,
                locationType: locationType === "auto" ? "auto" : locationType,
                appendMode: true,
            };

            // For text-based, add description if provided (optional now)
            if (locationType === "text" && clipDescription.trim()) {
                payload.clipDescription = clipDescription.trim();
            }

            // For time-based, add times if provided (optional - validates only if both provided)
            if (locationType === "time") {
                const start = parseTimeToSeconds(startTime);
                const end = parseTimeToSeconds(endTime);

                // Only validate if at least one time is provided
                if (startTime || endTime) {
                    if (start === null || end === null) {
                        setError("Please enter valid start and end times (e.g., 5:30 or 330)");
                        setIsLoading(false);
                        return;
                    }

                    if (end <= start) {
                        setError("End time must be after start time");
                        setIsLoading(false);
                        return;
                    }

                    payload.startTime = start;
                    payload.endTime = end;
                }
            }

            const response = await fetch("/api/clips/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to regenerate clips");
            }

            setSuccess(true);
            onSuccess?.();

            // Close modal after brief delay to show success
            setTimeout(() => {
                onOpenChange(false);
                resetForm();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to regenerate clips");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setLocationType("auto");
        setClipDescription("");
        setStartTime("");
        setEndTime("");
        setCaptionEffect(defaultCaptionEffect);
        setClipCount(3);
        setError(null);
        setSuccess(false);
    };

    // Handle close
    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-[var(--color-primary)]" />
                        Generate New Clips
                    </DialogTitle>
                    <DialogDescription>
                        Generate additional clips for &quot;{sermonTitle}&quot;. Existing clips will be preserved.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="space-y-5 py-2">
                        {/* Location Type Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Clip Selection Method</Label>
                            <RadioGroup
                                value={locationType}
                                onValueChange={(v: string) => setLocationType(v as ClipLocationType)}
                                className="grid grid-cols-3 gap-2"
                            >
                                {/* Auto/Best Moments Option */}
                                <label
                                    htmlFor="auto"
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${locationType === "auto"
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                        : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        }`}
                                >
                                    <RadioGroupItem value="auto" id="auto" className="sr-only" />
                                    <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                                    <div>
                                        <p className="font-medium text-sm text-[var(--color-text-light)]">Auto</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">Best moments</p>
                                    </div>
                                </label>
                                <label
                                    htmlFor="text"
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${locationType === "text"
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                        : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        }`}
                                >
                                    <RadioGroupItem value="text" id="text" className="sr-only" />
                                    <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
                                    <div>
                                        <p className="font-medium text-sm text-[var(--color-text-light)]">Topic</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">Describe it</p>
                                    </div>
                                </label>
                                <label
                                    htmlFor="time"
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${locationType === "time"
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                        : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        }`}
                                >
                                    <RadioGroupItem value="time" id="time" className="sr-only" />
                                    <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                                    <div>
                                        <p className="font-medium text-sm text-[var(--color-text-light)]">Time</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">Specify range</p>
                                    </div>
                                </label>
                            </RadioGroup>
                        </div>

                        {/* Auto mode info */}
                        {locationType === "auto" && (
                            <div className="p-3 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg space-y-1.5">
                                <p className="text-sm text-[var(--color-text-light)]">
                                    🎯 Unused high-scoring moments from the AI analysis are rendered first — no re-analysis needed.
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    Looking for one exact moment? Try <span className="font-medium text-[var(--color-primary)]">Ask the Transcript</span> in the sidebar and describe it in plain words.
                                </p>
                            </div>
                        )}

                        {/* Location Input - Text */}
                        {locationType === "text" && (
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Describe the moment <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="e.g., 'When the speaker talks about forgiveness' or leave empty for best moments"
                                    value={clipDescription}
                                    onChange={(e) => setClipDescription(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    Leave empty to let the system find the best moments automatically.
                                </p>
                            </div>
                        )}

                        {/* Location Input - Time */}
                        {locationType === "time" && (
                            <div className="space-y-2">
                                <Label>
                                    Time Range <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Input
                                            id="startTime"
                                            placeholder="0:00"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                        <p className="text-xs text-[var(--color-text-muted)]">Start</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            id="endTime"
                                            placeholder="10:00"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                        <p className="text-xs text-[var(--color-text-muted)]">End</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    Leave empty to search the entire video. Use mm:ss or seconds.
                                </p>
                            </div>
                        )}

                        {/* Caption Effect Selection - Compact */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Caption Style
                            </Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: "karaoke", label: "Highlight", hint: "Word lights up" },
                                    { value: "pop", label: "Pop", hint: "Highlight + scale" },
                                    { value: "fade", label: "Fade", hint: "Phrases fade in" },
                                    { value: "none", label: "Minimal", hint: "Static text" },
                                ].map((effect) => (
                                    <button
                                        key={effect.value}
                                        type="button"
                                        onClick={() => setCaptionEffect(effect.value as CaptionEffect)}
                                        className={`p-2 rounded-lg border-2 text-center transition-all ${captionEffect === effect.value
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                            }`}
                                    >
                                        <p className="font-medium text-sm text-[var(--color-text-light)]">{effect.label}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{effect.hint}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Number of Clips - Always visible */}
                        <div className="space-y-2">
                            <Label htmlFor="clipCount">Number of Clips</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="clipCount"
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={clipCount}
                                    onChange={(e) => setClipCount(Math.max(1, Math.min(5, Number(e.target.value))))}
                                    className="w-20"
                                />
                                <span className="text-sm text-[var(--color-text-muted)]">clips (1-5)</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                                Clips are being generated! This may take a few minutes.
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed footer with buttons */}
                <div className="shrink-0 flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
                    <Button variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRegenerate}
                        disabled={isLoading || success}
                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate Clips
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
