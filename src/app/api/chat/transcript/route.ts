import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { convexQuery, convexMutation } from "@/lib/server/convex-http";
import { generateText } from "@/lib/server/llm";

// Chat with the transcript: the assistant answers questions about the
// video and can locate or create clips. Flow for clip requests:
//   1. Check the stored viral moments for a match (no re-analysis needed)
//   2. If none match, locate the exact passage in the timed transcript
//   3. Trigger clip rendering for the chosen time range
interface ChatRequest {
    sermonId: string;
    message: string;
}

interface SermonRecord {
    _id: string;
    organizationId: string;
    title: string;
    videoType?: "sermon" | "podcast";
    s3Key?: string;
    duration?: number;
    preferredCaptionEffect?: "none" | "pop" | "fade" | "karaoke";
}

interface TranscriptRecord {
    fullText: string;
    segments: Array<{ start: number; end: number; word: string }>;
}

interface MomentRecord {
    _id: string;
    startTime: number;
    endTime: number;
    title?: string;
    hook?: string;
    quote?: string;
    category?: string;
    score?: number;
    used: boolean;
}

interface ClipRecord {
    _id: string;
    title?: string;
    startTime: number;
    endTime: number;
    status: string;
}

interface ChatMessageRecord {
    role: "user" | "assistant";
    content: string;
}

interface AssistantAction {
    type: "none" | "clip_from_moment" | "clip_from_transcript";
    momentId?: string;
    start?: number;
    end?: number;
    title?: string;
}

interface AssistantResponse {
    reply: string;
    action?: AssistantAction | null;
}

const MAX_TRANSCRIPT_CHARS = 24000;
const MIN_CLIP_SECONDS = 10;
const MAX_CLIP_SECONDS = 150;

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Build a timestamped transcript the model can cite exact times from.
// Groups word segments into ~15 second blocks prefixed with [m:ss].
function buildTimedTranscript(transcript: TranscriptRecord): string {
    const segments = transcript.segments || [];
    if (segments.length === 0) {
        return transcript.fullText.slice(0, MAX_TRANSCRIPT_CHARS);
    }

    const blocks: string[] = [];
    let blockWords: string[] = [];
    let blockStart = segments[0].start;

    for (const segment of segments) {
        if (segment.start - blockStart >= 15 && blockWords.length > 0) {
            blocks.push(`[${formatTime(blockStart)}] ${blockWords.join(" ")}`);
            blockWords = [];
            blockStart = segment.start;
        }
        blockWords.push(segment.word);
    }
    if (blockWords.length > 0) {
        blocks.push(`[${formatTime(blockStart)}] ${blockWords.join(" ")}`);
    }

    let text = blocks.join("\n");
    if (text.length > MAX_TRANSCRIPT_CHARS) {
        // Keep the head and tail so the model still sees the whole arc
        const half = Math.floor(MAX_TRANSCRIPT_CHARS / 2);
        text = `${text.slice(0, half)}\n\n[... middle of transcript omitted ...]\n\n${text.slice(-half)}`;
    }
    return text;
}

function parseAssistantJson(raw: string): AssistantResponse {
    let text = raw.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    // Tolerate leading/trailing prose around the JSON object
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
        text = text.slice(start, end + 1);
    }
    const parsed = JSON.parse(text) as AssistantResponse;
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) {
        throw new Error("Assistant reply missing");
    }
    return parsed;
}

export async function POST(req: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sermonId, message }: ChatRequest = await req.json();
        if (!sermonId || !message?.trim()) {
            return NextResponse.json({ error: "Missing sermonId or message" }, { status: 400 });
        }
        if (message.length > 2000) {
            return NextResponse.json({ error: "Message too long" }, { status: 400 });
        }

        // Ownership check
        const convexOrg = await convexQuery<{ _id: string } | null>(
            "organizations:getByClerkId",
            { clerkOrgId: orgId }
        );
        const sermon = await convexQuery<SermonRecord | null>("sermons:getById", { sermonId });
        if (!convexOrg || !sermon || sermon.organizationId !== convexOrg._id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const [transcript, moments, clips, history] = await Promise.all([
            convexQuery<TranscriptRecord | null>("transcripts:getBySermon", { sermonId }),
            convexQuery<MomentRecord[]>("viralMoments:getBySermon", { sermonId }),
            convexQuery<ClipRecord[]>("clips:getBySermon", { sermonId }),
            convexQuery<ChatMessageRecord[]>("chatMessages:getBySermon", { sermonId }),
        ]);

        if (!transcript?.fullText) {
            return NextResponse.json(
                { error: "No transcript available yet. Chat opens once processing completes." },
                { status: 409 }
            );
        }

        // Persist the user message first so it survives any LLM failure
        await convexMutation("chatMessages:add", {
            sermonId,
            role: "user",
            content: message.trim(),
        });

        const isPodcast = sermon.videoType === "podcast";
        const contentWord = isPodcast ? "podcast episode" : "sermon";
        const canRenderClips = Boolean(sermon.s3Key);

        const momentsBlock = (moments || [])
            .map((m) =>
                `- id=${m._id} | ${formatTime(m.startTime)}-${formatTime(m.endTime)} | ` +
                `${m.title || "Untitled moment"}${m.category ? ` [${m.category}]` : ""}` +
                `${typeof m.score === "number" ? ` (score ${m.score})` : ""}` +
                `${m.quote ? ` | quote: "${m.quote}"` : ""} | ${m.used ? "ALREADY A CLIP" : "not yet rendered"}`
            )
            .join("\n") || "(none stored)";

        const clipsBlock = (clips || [])
            .map((c) => `- ${formatTime(c.startTime)}-${formatTime(c.endTime)} | ${c.title || "Untitled clip"} | ${c.status}`)
            .join("\n") || "(none yet)";

        const historyBlock = (history || [])
            .slice(-10)
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n");

        const prompt = `You are the clip assistant for "${sermon.title}", a ${contentWord}. You help the user explore the transcript and create short vertical video clips.

## Stored viral moments (pre-analyzed, instantly available)
${momentsBlock}

## Existing clips
${clipsBlock}

## Rules
1. When the user asks about the content, answer conversationally from the transcript. Quote it and cite timestamps like (12:30).
2. When the user asks for a clip of a specific moment or topic:
   a. FIRST check the stored viral moments above. If one clearly covers what they want, use action "clip_from_moment" with its id.
   b. If no stored moment fits, find the passage in the transcript and use action "clip_from_transcript" with exact "start" and "end" in SECONDS. Start at the first word of a sentence and end at the last word of a sentence. Clips must be ${MIN_CLIP_SECONDS}-${MAX_CLIP_SECONDS} seconds; aim for 30-90.
   c. If an EXISTING clip already covers it, point them to it and use action "none".
3. ${canRenderClips ? "Clip rendering is available." : "IMPORTANT: This video was imported from YouTube without a video file, so clips CANNOT be rendered. Never promise a clip; explain this if asked."}
4. Only trigger ONE clip per reply. If the request is ambiguous, ask a clarifying question with action "none".
5. In your reply, when you trigger a clip, tell the user what you found, the time range, and that rendering takes a few minutes.

## Output format
Return ONLY valid JSON (no markdown fences):
{"reply": "your conversational reply", "action": {"type": "none" | "clip_from_moment" | "clip_from_transcript", "momentId": "id if clip_from_moment", "start": seconds if clip_from_transcript, "end": seconds if clip_from_transcript, "title": "4-8 word clip title when creating a clip"}}

## Timestamped transcript
${buildTimedTranscript(transcript)}

## Conversation so far
${historyBlock}
User: ${message.trim()}`;

        let assistant: AssistantResponse;
        try {
            const raw = await generateText(prompt, { task: "transcript-chat" });
            assistant = parseAssistantJson(raw);
        } catch (error) {
            console.error("Transcript chat LLM error:", error);
            const fallback = "I hit a snag reading the transcript just now. Please try that again in a moment.";
            await convexMutation("chatMessages:add", { sermonId, role: "assistant", content: fallback });
            return NextResponse.json({ reply: fallback, action: null });
        }

        // Validate + execute the action server-side (never trust raw LLM output)
        let executedAction:
            | { type: "clip_from_moment" | "clip_from_transcript"; startTime: number; endTime: number; title?: string; momentId?: string }
            | undefined;

        const action = assistant.action;
        if (action && action.type !== "none" && canRenderClips) {
            let start: number | undefined;
            let end: number | undefined;
            let title = action.title?.slice(0, 120);
            let momentId: string | undefined;

            if (action.type === "clip_from_moment" && action.momentId) {
                const moment = (moments || []).find((m) => m._id === action.momentId);
                if (moment) {
                    start = moment.startTime;
                    end = moment.endTime;
                    title = title || moment.title;
                    momentId = moment._id;
                }
            } else if (action.type === "clip_from_transcript") {
                start = typeof action.start === "number" ? action.start : undefined;
                end = typeof action.end === "number" ? action.end : undefined;
            }

            const duration = start !== undefined && end !== undefined ? end - start : 0;
            const withinVideo =
                start !== undefined &&
                start >= 0 &&
                (!sermon.duration || (end ?? 0) <= sermon.duration + 5);

            if (
                start !== undefined &&
                end !== undefined &&
                duration >= MIN_CLIP_SECONDS &&
                duration <= MAX_CLIP_SECONDS &&
                withinVideo
            ) {
                await inngest.send({
                    name: "sermon/regenerate-clips",
                    data: {
                        sermonId,
                        // Reuse the caption style the user last picked for this video
                        captionEffect: sermon.preferredCaptionEffect ?? "karaoke",
                        clipCount: 1,
                        locationType: "time",
                        startTime: start,
                        endTime: end,
                        appendMode: true,
                        organizationId: orgId,
                    },
                });

                if (momentId) {
                    await convexMutation("viralMoments:markAsUsed", { momentIds: [momentId] });
                }

                executedAction = {
                    type: action.type,
                    startTime: start,
                    endTime: end,
                    title,
                    momentId,
                };
            }
        }

        await convexMutation("chatMessages:add", {
            sermonId,
            role: "assistant",
            content: assistant.reply,
            action: executedAction
                ? {
                    type: executedAction.type,
                    startTime: executedAction.startTime,
                    endTime: executedAction.endTime,
                    title: executedAction.title,
                    momentId: executedAction.momentId,
                }
                : undefined,
        });

        return NextResponse.json({ reply: assistant.reply, action: executedAction ?? null });
    } catch (error) {
        console.error("Transcript chat error:", error);
        return NextResponse.json({ error: "Chat failed" }, { status: 500 });
    }
}
