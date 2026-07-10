import { inngest } from "../client";
import { generateText } from "@/lib/server/llm";

// Editorial metadata carried on stored viral moments and rendered clips
interface MomentMetadata {
    title?: string;
    hook?: string;
    quote?: string;
    reason?: string;
    category?: string;
    score?: number;
}

interface StoredMoment extends MomentMetadata {
    _id: string;
    startTime: number;
    endTime: number;
}

interface RenderedClip extends MomentMetadata {
    start: number;
    end: number;
    s3_key: string;
}

function clipMetadata(source: MomentMetadata) {
    return {
        title: source.title ?? undefined,
        hook: source.hook ?? undefined,
        quote: source.quote ?? undefined,
        reason: source.reason ?? undefined,
        category: source.category ?? undefined,
        score: source.score ?? undefined,
    };
}

// Regenerate clips for a sermon based on text description or time range
// This function calls the Modal API to generate new clips, appending to existing ones
export const regenerateClips = inngest.createFunction(
    {
        id: "regenerate-clips",
        retries: 2,
    },
    { event: "sermon/regenerate-clips" },
    async ({ event, step }) => {
        const {
            sermonId,
            captionEffect,
            clipCount,
            locationType,
            clipDescription,
            startTime,
            endTime,
            organizationId,
        } = event.data;

        // Step 1: Get sermon details, transcript, and unused viral moments from Convex
        const sermonData = await step.run("get-sermon-data", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            if (!organizationId) {
                throw new Error("organizationId is required");
            }

            const orgResponse = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "organizations:getByClerkId",
                    args: { clerkOrgId: organizationId },
                    format: "json",
                }),
            });

            if (!orgResponse.ok) {
                throw new Error("Failed to fetch organization");
            }

            const orgResult = await orgResponse.json();
            const org = orgResult.value || orgResult;
            if (!org) {
                throw new Error("Organization not found");
            }

            // Get sermon
            const sermonResponse = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "sermons:getById",
                    args: { sermonId },
                    format: "json",
                }),
            });

            if (!sermonResponse.ok) {
                throw new Error("Failed to fetch sermon");
            }

            const sermonResult = await sermonResponse.json();
            const sermon = sermonResult.value || sermonResult;

            if (!sermon) {
                throw new Error("Sermon not found");
            }

            if (sermon.organizationId !== org._id) {
                throw new Error("Sermon does not belong to this organization");
            }

            // Get transcript
            const transcriptResponse = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "transcripts:getBySermon",
                    args: { sermonId },
                    format: "json",
                }),
            });

            let transcript = null;
            if (transcriptResponse.ok) {
                const transcriptResult = await transcriptResponse.json();
                transcript = transcriptResult.value || transcriptResult;
            }

            // Get unused viral moments (for auto mode)
            const unusedMomentsResponse = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "viralMoments:getUnused",
                    args: { sermonId },
                    format: "json",
                }),
            });

            let unusedMoments: StoredMoment[] = [];
            if (unusedMomentsResponse.ok) {
                const momentsResult = await unusedMomentsResponse.json();
                unusedMoments = momentsResult.value || momentsResult || [];
            }

            // Get existing clips (to avoid duplicates)
            const clipsResponse = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "clips:getBySermon",
                    args: { sermonId },
                    format: "json",
                }),
            });

            let existingClips: Array<{ _id: string; startTime: number; endTime: number }> = [];
            if (clipsResponse.ok) {
                const clipsResult = await clipsResponse.json();
                existingClips = clipsResult.value || clipsResult || [];
            }

            return { sermon, transcript, unusedMoments, existingClips };
        });

        const { sermon, transcript, unusedMoments, existingClips } = sermonData;

        // For "auto" mode, check if we have unused viral moments to use
        // This avoids re-analyzing the video
        let useStoredMoments = false;
        let momentsToProcess: StoredMoment[] = [];

        if (locationType === "auto" && unusedMoments && unusedMoments.length > 0) {
            console.log(`Found ${unusedMoments.length} unused viral moments for auto-regeneration`);
            // Randomly shuffle and pick the requested count
            const shuffled = [...unusedMoments].sort(() => Math.random() - 0.5);
            momentsToProcess = shuffled.slice(0, clipCount);
            useStoredMoments = true;
            console.log(`Selected ${momentsToProcess.length} moments to process from stored viral moments`);
        }

        // Step 2: Determine clip time range (optional - undefined means auto/full video)
        let clipStartTime: number | undefined;
        let clipEndTime: number | undefined;

        if (locationType === "time" && startTime !== undefined && endTime !== undefined) {
            // Direct time-based specification - only if both provided
            clipStartTime = startTime;
            clipEndTime = endTime;
            console.log(`Time-based clip: ${clipStartTime}s to ${clipEndTime}s`);
        } else if (locationType === "text" && clipDescription && transcript?.fullText) {
            // Text-based specification - find the matching section in transcript
            const matchResult = await step.run("find-transcript-match", async () => {
                // Use simple text matching to find the approximate location
                // In a production system, you might want to use an LLM for smarter matching
                const searchText = clipDescription.toLowerCase();

                // Split search text into key phrases
                const searchWords = searchText.split(/\s+/).filter((w: string) => w.length > 3);

                // Find segments that contain matching words
                const segments = transcript.segments || [];
                let bestMatchStart = 0;
                let bestMatchScore = 0;
                const windowSize = 50; // Look at windows of ~50 words

                for (let i = 0; i < segments.length; i++) {
                    // Get a window of segments
                    const windowEnd = Math.min(i + windowSize, segments.length);
                    const windowText = segments
                        .slice(i, windowEnd)
                        .map((s: { word: string }) => s.word.toLowerCase())
                        .join(" ");

                    // Count matching words
                    let score = 0;
                    for (const searchWord of searchWords) {
                        if (windowText.includes(searchWord)) {
                            score++;
                        }
                    }

                    // Bonus for phrase matches
                    if (windowText.includes(searchText.substring(0, Math.min(30, searchText.length)))) {
                        score += 5;
                    }

                    if (score > bestMatchScore) {
                        bestMatchScore = score;
                        bestMatchStart = i;
                    }
                }

                if (bestMatchScore === 0) {
                    // No match found, use a fallback approach
                    console.log("No direct match found, using keyword extraction with Gemini");
                    return null;
                }

                // Get the time range from the matched segments
                const matchStartSegment = segments[bestMatchStart];
                const matchEndIdx = Math.min(bestMatchStart + windowSize, segments.length - 1);
                const matchEndSegment = segments[matchEndIdx];

                // Add some buffer around the match (10 seconds before, 5 seconds after)
                const start = Math.max(0, matchStartSegment.start - 10);
                const end = matchEndSegment.end + 5;

                console.log(`Text match found: ${start}s to ${end}s (score: ${bestMatchScore})`);
                return { start, end };
            });

            if (matchResult) {
                clipStartTime = matchResult.start;
                clipEndTime = matchResult.end;
            } else {
                // Fallback: Use Gemini to find the best matching section
                const geminiMatch = await step.run("gemini-transcript-match", async () => {
                    const prompt = `You are analyzing a sermon transcript to find a specific section.

USER REQUEST: "${clipDescription}"

TRANSCRIPT (with approximate timestamps):
${transcript.fullText.substring(0, 15000)}

Based on the user's request, identify the most relevant section of the sermon.
Return ONLY a JSON object with the estimated start and end times in seconds:
{"start": 120, "end": 180}

If you cannot find a relevant section, return:
{"start": 0, "end": 60}

Return ONLY the JSON, no other text.`;

                    try {
                        const responseText = await generateText(prompt, { task: "transcript-smart-match" });

                        // Parse the JSON response
                        let cleanText = responseText.trim();
                        if (cleanText.startsWith('```')) {
                            cleanText = cleanText.replace(/^```(?:json)?\s*\n?/, '');
                            cleanText = cleanText.replace(/\n?```\s*$/, '');
                        }

                        const parsed = JSON.parse(cleanText);
                        return { start: parsed.start, end: parsed.end };
                    } catch (e) {
                        console.error("Failed to parse Gemini response:", e);
                        return null;
                    }
                });

                if (geminiMatch) {
                    clipStartTime = geminiMatch.start;
                    clipEndTime = geminiMatch.end;
                }
                // If no match found, leave times undefined to let Modal find best moments
            }
        }
        // For "auto" mode or when no specific input given, leave times undefined
        // The Modal API will find the best moments automatically

        console.log(`Clip generation mode: ${locationType}, times: ${clipStartTime ?? 'auto'} - ${clipEndTime ?? 'auto'}, useStoredMoments: ${useStoredMoments}`);

        // Step 3: Check if sermon has S3 video (required for Modal processing)
        if (!sermon.s3Key) {
            throw new Error("Cannot regenerate clips: No video file found. Video clips can only be generated for uploaded videos, not YouTube videos.");
        }

        // Step 4: Process clips - either from stored moments or via Modal API
        let processedClips: RenderedClip[] = [];

        if (useStoredMoments && momentsToProcess.length > 0) {
            // Process each stored moment through Modal (just for clip creation, no re-analysis)
            console.log(`Processing ${momentsToProcess.length} stored viral moments`);

            for (let i = 0; i < momentsToProcess.length; i++) {
                const moment = momentsToProcess[i];
                const clipResult = await step.run(`process-stored-moment-${i}`, async () => {
                    const modalUrl = process.env.MODAL_API_URL;
                    if (!modalUrl) {
                        throw new Error("MODAL_API_URL environment variable not set");
                    }

                    console.log(`Processing stored moment ${i + 1}/${momentsToProcess.length}: ${moment.startTime}s to ${moment.endTime}s`);

                    const headers: Record<string, string> = {
                        "Content-Type": "application/json",
                    };

                    const modalAuthToken = process.env.MODAL_AUTH_TOKEN;
                    if (modalAuthToken) {
                        headers["Authorization"] = `Bearer ${modalAuthToken}`;
                    }

                    const requestBody = {
                        s3_key: sermon.s3Key,
                        video_type: sermon.videoType || "sermon",
                        max_clips: 1, // Process one moment at a time
                        caption_effect: captionEffect,
                        regenerate_mode: true,
                        target_start: moment.startTime,
                        target_end: moment.endTime,
                    };

                    const response = await fetch(modalUrl, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(requestBody),
                    });

                    if (!response.ok) {
                        const error = await response.text();
                        console.error(`Modal API error for moment ${i}:`, error);
                        throw new Error(`Modal API error: ${error}`);
                    }

                    const result = await response.json();
                    return result as {
                        status: string;
                        clips_created: number;
                        clip_moments: RenderedClip[];
                    };
                });

                if (clipResult.clip_moments && clipResult.clip_moments.length > 0) {
                    // Attach the stored moment's editorial metadata (title,
                    // score, etc.) to the rendered clip
                    processedClips.push(...clipResult.clip_moments.map(clip => ({
                        ...clip,
                        ...clipMetadata(moment),
                    })));
                }
            }

            // Mark the used moments as used in the database
            await step.run("mark-moments-used", async () => {
                const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
                if (!convexUrl) throw new Error("Convex URL not configured");

                const momentIds = momentsToProcess.map(m => m._id);
                console.log(`Marking ${momentIds.length} viral moments as used`);

                const response = await fetch(`${convexUrl}/api/mutation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "viralMoments:markAsUsed",
                        args: { momentIds },
                        format: "json",
                    }),
                });

                if (!response.ok) {
                    console.error("Failed to mark moments as used:", await response.text());
                    // Don't throw - clips were created successfully
                }
            });

        } else {
            // Call Modal API to find and generate clips (original flow)
            const modalResult = await step.run("call-modal-api", async () => {
                const modalUrl = process.env.MODAL_API_URL;
                if (!modalUrl) {
                    throw new Error("MODAL_API_URL environment variable not set");
                }

                console.log(`Calling Modal API for clip regeneration: ${clipStartTime ?? 'auto'}s to ${clipEndTime ?? 'auto'}s`);

                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                };

                const modalAuthToken = process.env.MODAL_AUTH_TOKEN;
                if (modalAuthToken) {
                    headers["Authorization"] = `Bearer ${modalAuthToken}`;
                }

                // Create exclude ranges from existing clips
                const excludeRanges = existingClips.map(c => ({
                    start: c.startTime,
                    end: c.endTime
                }));

                const requestBody: Record<string, unknown> = {
                    s3_key: sermon.s3Key,
                    video_type: sermon.videoType || "sermon",
                    max_clips: clipCount,
                    caption_effect: captionEffect,
                    regenerate_mode: true,
                    exclude_ranges: excludeRanges,
                };

                // Only add target times if specified
                if (clipStartTime !== undefined && clipEndTime !== undefined) {
                    requestBody.target_start = clipStartTime;
                    requestBody.target_end = clipEndTime;
                }

                const response = await fetch(modalUrl, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(requestBody),
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
                    clips_created: number;
                    clip_moments: RenderedClip[];
                };
            });

            processedClips = modalResult.clip_moments || [];
        }

        // Step 5: Save new clips to Convex (appending, not replacing)
        await step.run("save-new-clips", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            if (processedClips.length === 0) {
                console.log("No new clips to save");
                return;
            }

            console.log(`Saving ${processedClips.length} new clips (appending to existing)`);

            // Use createBatch mutation which appends, doesn't delete existing
            const response = await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "clips:createBatch",
                    args: {
                        sermonId,
                        clips: processedClips.map(clip => ({
                            startTime: clip.start,
                            endTime: clip.end,
                            s3Key: clip.s3_key,
                            ...clipMetadata(clip),
                        })),
                    },
                    format: "json",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to save new clips:", errorText);
                throw new Error(`Failed to save clips: ${errorText}`);
            } else {
                const result = await response.json();
                console.log("New clips saved successfully:", result);
            }
        });

        return {
            success: true,
            clipsCreated: processedClips.length,
            sermonId,
            usedStoredMoments: useStoredMoments,
            timeRange: useStoredMoments ? undefined : { start: clipStartTime, end: clipEndTime },
        };
    }
);
