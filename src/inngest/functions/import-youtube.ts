import { inngest } from "../client";
import { convexQuery, convexMutation } from "@/lib/server/convex-http";

const YOUTUBE_SERVICE_URL =
    process.env.YOUTUBE_SERVICE_URL ||
    process.env.NEXT_PUBLIC_YOUTUBE_SERVICE_URL ||
    "http://localhost:8001";
const YOUTUBE_SERVICE_TOKEN = process.env.YOUTUBE_SERVICE_TOKEN;

// The downloader runs the import in its own worker and we poll for the result,
// so no single step has to stay open for the length of a sermon download.
const POLL_INTERVAL_SECONDS = 15;
const MAX_POLL_ATTEMPTS = 240; // 240 * 15s = 60 minutes

interface JobState {
    job_id: string;
    status: "queued" | "running" | "succeeded" | "failed";
    s3_key: string;
    result: { s3_key: string; file_size: number; title: string } | null;
    error: string | null;
}

interface SermonRecord {
    organizationId: string;
}

interface ConvexOrg {
    _id: string;
}

function serviceHeaders() {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (YOUTUBE_SERVICE_TOKEN) {
        headers.Authorization = `Bearer ${YOUTUBE_SERVICE_TOKEN}`;
    }
    return headers;
}

export const importYouTube = inngest.createFunction(
    {
        id: "import-youtube",
        retries: 2,
        // One import per sermon; a duplicate submit will not start a second download.
        concurrency: { key: "event.data.sermonId", limit: 1 },
        onFailure: async ({ event }) => {
            const sermonId = event?.data?.event?.data?.sermonId;
            if (!sermonId) return;
            await convexMutation("sermons:updateStatus", {
                sermonId,
                status: "failed",
            }).catch((error) => console.error("Failed to mark sermon failed:", error));
        },
    },
    { event: "sermon/youtube-import" },
    async ({ event, step }) => {
        const {
            sermonId,
            youtubeUrl,
            s3Key,
            quality,
            start,
            end,
            videoType,
            maxClips,
            captionEffect,
            organizationId,
        } = event.data;

        // Fail closed: the background worker re-checks ownership rather than
        // trusting whatever produced the event.
        await step.run("verify-organization-ownership", async () => {
            const org = await convexQuery<ConvexOrg | null>("organizations:getByClerkId", {
                clerkOrgId: organizationId,
            });
            if (!org) throw new Error("Organization not found");

            const sermon = await convexQuery<SermonRecord | null>("sermons:getById", {
                sermonId,
            });
            if (!sermon || sermon.organizationId !== org._id) {
                throw new Error("Sermon does not belong to this organization");
            }

            if (!s3Key.startsWith(`sermons/${organizationId}/`)) {
                throw new Error("S3 key does not belong to this organization");
            }
        });

        // Queue the download. The service is idempotent per S3 key, so an
        // Inngest retry re-attaches to the running job instead of duplicating it.
        const queued = await step.run("queue-download", async () => {
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/api/youtube/jobs`, {
                method: "POST",
                headers: serviceHeaders(),
                body: JSON.stringify({
                    url: youtubeUrl,
                    quality: quality || "highest",
                    start: start ?? null,
                    end: end ?? null,
                    s3_key: s3Key,
                }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) {
                const detail = await response.text();
                throw new Error(`Downloader rejected the job (${response.status}): ${detail.slice(0, 500)}`);
            }

            return (await response.json()) as JobState;
        });

        // Poll until the worker finishes. Each attempt is its own short step.
        let finished: JobState | null = null;
        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
            await step.sleep(`wait-${attempt}`, `${POLL_INTERVAL_SECONDS}s`);

            const state = await step.run(`poll-${attempt}`, async () => {
                const response = await fetch(
                    `${YOUTUBE_SERVICE_URL}/api/youtube/jobs/${queued.job_id}`,
                    { headers: serviceHeaders(), signal: AbortSignal.timeout(30_000) }
                );

                if (response.status === 404) {
                    // The worker restarted and lost the job; retry the whole function.
                    throw new Error("Download job is no longer known to the service");
                }
                if (!response.ok) {
                    throw new Error(`Job status check failed (${response.status})`);
                }

                return (await response.json()) as JobState;
            });

            if (state.status === "succeeded" || state.status === "failed") {
                finished = state;
                break;
            }
        }

        if (!finished) {
            throw new Error("YouTube import timed out before the download finished");
        }

        if (finished.status === "failed") {
            throw new Error(finished.error || "YouTube download failed");
        }

        const uploadedKey = finished.result?.s3_key || s3Key;
        const uploadedSize = finished.result?.file_size ?? 0;
        const uploadedTitle = finished.result?.title ?? "";

        // Attach the real S3 object to the sermon record.
        await step.run("attach-s3-key", async () => {
            await convexMutation("sermons:patchS3Key", {
                sermonId,
                s3Key: uploadedKey,
            });
        });

        // Hand off to the normal Modal pipeline.
        await step.sendEvent("start-processing", {
            name: "sermon/process",
            data: {
                sermonId,
                s3Key: uploadedKey,
                videoType,
                maxClips,
                captionEffect: captionEffect || "karaoke",
                organizationId,
            },
        });

        return {
            sermonId,
            s3Key: uploadedKey,
            fileSize: uploadedSize,
            title: uploadedTitle,
        };
    }
);
