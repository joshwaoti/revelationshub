import { inngest } from "../client";

// Process sermon video - orchestrates the full video processing pipeline
export const processSermon = inngest.createFunction(
    {
        id: "process-sermon",
        retries: 2,
    },
    { event: "sermon/process" },
    async ({ event, step }) => {
        const { sermonId, s3Key, youtubeUrl, videoType, maxClips, organizationId } = event.data;

        // Step 1: Call Modal API to process video
        const modalResult = await step.run("call-modal-api", async () => {
            const modalUrl = process.env.MODAL_API_URL;
            const authToken = process.env.MODAL_AUTH_TOKEN;

            if (!modalUrl || !authToken) {
                throw new Error("Modal API configuration missing");
            }

            const response = await fetch(modalUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    s3_key: s3Key,
                    youtube_url: youtubeUrl,
                    video_type: videoType,
                    max_clips: maxClips,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Modal API error: ${error}`);
            }

            return response.json() as Promise<{
                status: string;
                s3_key: string;
                clips_created: number;
                transcript_segments: Array<{ start: number; end: number; word: string }>;
                clip_moments: Array<{ start: number; end: number; s3_key: string }>;
            }>;
        });

        // Step 2: Save transcript to Convex
        await step.run("save-transcript", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            // Using HTTP API to call Convex mutation
            const response = await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "transcripts:create",
                    args: {
                        sermonId,
                        segments: modalResult.transcript_segments,
                        fullText: modalResult.transcript_segments.map(s => s.word).join(" "),
                    },
                }),
            });

            if (!response.ok) {
                console.error("Failed to save transcript:", await response.text());
            }
        });

        // Step 3: Save clips to Convex
        await step.run("save-clips", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            const response = await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "clips:createBatch",
                    args: {
                        sermonId,
                        clips: modalResult.clip_moments.map(clip => ({
                            startTime: clip.start,
                            endTime: clip.end,
                            s3Key: clip.s3_key,
                        })),
                    },
                }),
            });

            if (!response.ok) {
                console.error("Failed to save clips:", await response.text());
            }
        });

        // Step 4: Update sermon status to ready
        await step.run("update-sermon-status", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            const response = await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "sermons:updateStatus",
                    args: {
                        sermonId,
                        status: "ready",
                    },
                }),
            });

            if (!response.ok) {
                console.error("Failed to update sermon status:", await response.text());
            }
        });

        // Step 5: Trigger text content generation
        await step.sendEvent("trigger-text-generation", {
            name: "sermon/generate-text",
            data: {
                sermonId,
                generateQuotes: true,
                generateCarousel: true,
                generateDiscussionGuide: true,
                generateDevotional: true,
                generateBlogPost: true,
                generateOutline: true,
                generateSummary: true,
            },
        });

        return {
            success: true,
            clipsCreated: modalResult.clips_created,
            sermonId,
        };
    }
);
