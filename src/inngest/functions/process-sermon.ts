import { inngest } from "../client";

// Process sermon video - orchestrates the full video processing pipeline
// NOTE: This function ONLY handles S3-uploaded videos (processed via Modal with WhisperX)
// YouTube videos are handled separately via the frontend transcript API + Gemini
export const processSermon = inngest.createFunction(
    {
        id: "process-sermon",
        retries: 2,
    },
    { event: "sermon/process" },
    async ({ event, step }) => {
        const { sermonId, s3Key, videoType, maxClips, captionEffect, organizationId } = event.data;

        // This function only handles S3 uploads
        if (!s3Key) {
            throw new Error("s3Key is required - this function only processes uploaded videos");
        }

        // Step 1: Call Modal API to process video
        const modalResult = await step.run("call-modal-api", async () => {
            const modalUrl = process.env.MODAL_API_URL;

            if (!modalUrl) {
                throw new Error("MODAL_API_URL environment variable not set");
            }

            console.log("Calling Modal API:", modalUrl);
            console.log("Request data:", { s3_key: s3Key, video_type: videoType, max_clips: maxClips });

            // Build headers with Modal Bearer token auth
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            // Add Modal Bearer token authentication
            const modalAuthToken = process.env.MODAL_AUTH_TOKEN;
            if (modalAuthToken) {
                headers["Authorization"] = `Bearer ${modalAuthToken}`;
            }

            const response = await fetch(modalUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    s3_key: s3Key,
                    video_type: videoType,
                    max_clips: maxClips,
                    caption_effect: captionEffect || "karaoke",
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Modal API error:", error);
                throw new Error(`Modal API error: ${error}`);
            }

            const result = await response.json();
            console.log("Modal API response:", result);
            return result as {
                status: string;
                s3_key: string;
                clips_created: number;
                transcript_segments: Array<{ start: number; end: number; word: string }>;
                clip_moments: Array<{ start: number; end: number; s3_key: string }>;
            };
        });

        // Step 2: Save transcript to Convex
        await step.run("save-transcript", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            const transcriptSegments = modalResult.transcript_segments || [];
            // IMPORTANT: Always save fullText first - this is essential for text generation
            const fullText = transcriptSegments.map(s => s.word).join(" ");

            // Convex has a limit of 8192 items per array
            // If we have more segments, we'll truncate but ALWAYS save the full text
            const MAX_SEGMENTS = 8000; // Leave some buffer
            let segmentsToSave = transcriptSegments;

            if (transcriptSegments.length > MAX_SEGMENTS) {
                console.log(`Transcript has ${transcriptSegments.length} segments (exceeds 8192 limit), truncating segments but keeping full text`);
                segmentsToSave = transcriptSegments.slice(0, MAX_SEGMENTS);
            }

            console.log(`Saving transcript: ${transcriptSegments.length} total segments, ${segmentsToSave.length} segments stored, fullText length: ${fullText.length}`);

            // Using HTTP API to call Convex mutation
            const response = await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "transcripts:create",
                    args: {
                        sermonId,
                        segments: segmentsToSave,
                        fullText, // This is the crucial part - always save complete text
                    },
                    format: "json",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to save transcript:", errorText);
                throw new Error(`Failed to save transcript: ${errorText}`);
            } else {
                const result = await response.json();
                console.log("Transcript saved successfully:", result);
            }
        });

        // Step 3: Save clips to Convex
        await step.run("save-clips", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            if (!modalResult.clip_moments || modalResult.clip_moments.length === 0) {
                console.log("No clips to save");
                return;
            }

            console.log(`Saving ${modalResult.clip_moments.length} clips`);

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
                    format: "json", // Required for Convex HTTP API
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to save clips:", errorText);
                throw new Error(`Failed to save clips: ${errorText}`);
            } else {
                const result = await response.json();
                console.log("Clips saved successfully:", result);
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
                    format: "json", // Required for Convex HTTP API
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to update sermon status:", errorText);
                throw new Error(`Failed to update sermon status: ${errorText}`);
            } else {
                console.log("Sermon status updated to ready");
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
            clipsCreated: modalResult.clips_created || 0,
            sermonId,
        };
    }
);
