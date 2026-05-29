import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new sermon record
export const create = mutation({
    args: {
        organizationId: v.id("organizations"),
        title: v.string(),
        description: v.optional(v.string()),
        series: v.optional(v.string()),
        speaker: v.optional(v.string()),
        date: v.optional(v.string()),
        s3Key: v.string(),
        s3Bucket: v.string(),
        // YouTube specific
        youtubeUrl: v.optional(v.string()),
        youtubeVideoId: v.optional(v.string()),
        channelName: v.optional(v.string()),
        channelId: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        // Media info
        thumbnailUrl: v.optional(v.string()),
        duration: v.optional(v.number()),
        viewCount: v.optional(v.string()),
        definition: v.optional(v.string()),
        hasTranscript: v.optional(v.boolean()),
        // Type
        videoType: v.union(v.literal("sermon"), v.literal("podcast")),
        createdBy: v.id("members"),
    },
    handler: async (ctx, args) => {
        const sermonId = await ctx.db.insert("sermons", {
            ...args,
            status: "uploading",
            createdAt: Date.now(),
        });
        return sermonId;
    },
});
// Get all sermons for an organization
export const getByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const sermons = await ctx.db
            .query("sermons")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .collect();
        return sermons;
    },
});

// Get a single sermon by ID
export const getById = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.sermonId);
    },
});

// Update sermon status
export const updateStatus = mutation({
    args: {
        sermonId: v.id("sermons"),
        status: v.union(
            v.literal("uploading"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sermonId, { status: args.status });
    },
});

// Update sermon metadata
export const update = mutation({
    args: {
        sermonId: v.id("sermons"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        series: v.optional(v.string()),
        speaker: v.optional(v.string()),
        date: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        duration: v.optional(v.number()),
        channelName: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { sermonId, ...updates } = args;
        // Filter out undefined values
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        await ctx.db.patch(sermonId, filteredUpdates);
    },
});

// Patch the S3 key after actual upload completes
export const patchS3Key = mutation({
    args: {
        sermonId: v.id("sermons"),
        s3Key: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sermonId, { s3Key: args.s3Key });
    },
});

// Delete a sermon and all related data
export const remove = mutation({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const sermon = await ctx.db.get(args.sermonId);
        if (!sermon) {
            throw new Error("Sermon not found");
        }

        // Delete all related clips
        const clips = await ctx.db
            .query("clips")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
        for (const clip of clips) {
            await ctx.db.delete(clip._id);
        }

        // Delete all related viral moments
        const moments = await ctx.db
            .query("viralMoments")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
        for (const moment of moments) {
            await ctx.db.delete(moment._id);
        }

        // Delete all related generated content
        const generatedContent = await ctx.db
            .query("generatedContent")
            .withIndex("by_sermon_type", (q) => q.eq("sermonId", args.sermonId))
            .collect();
        for (const content of generatedContent) {
            await ctx.db.delete(content._id);
        }

        // Delete all related transcripts
        const transcripts = await ctx.db
            .query("transcripts")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
        for (const transcript of transcripts) {
            await ctx.db.delete(transcript._id);
        }

        // Delete all related jobs
        const jobs = await ctx.db
            .query("jobs")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
        for (const job of jobs) {
            await ctx.db.delete(job._id);
        }

        // Delete the sermon itself
        await ctx.db.delete(args.sermonId);
    },
});

// Cancel/stop an ongoing sermon process (upload or processing)
export const cancel = mutation({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const sermon = await ctx.db.get(args.sermonId);
        if (!sermon) {
            throw new Error("Sermon not found");
        }

        // Update sermon status to cancelled
        await ctx.db.patch(args.sermonId, { status: "cancelled" });

        // Cancel any running jobs for this sermon
        const jobs = await ctx.db
            .query("jobs")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();

        for (const job of jobs) {
            if (job.status === "running" || job.status === "queued") {
                await ctx.db.patch(job._id, {
                    status: "cancelled",
                    completedAt: Date.now(),
                });
            }
        }
    },
});

// Get sermons by status
export const getByOrgAndStatus = query({
    args: {
        organizationId: v.id("organizations"),
        status: v.optional(v.union(
            v.literal("uploading"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed"),
            v.literal("cancelled")
        )),
    },
    handler: async (ctx, args) => {
        if (args.status) {
            const status = args.status;
            return await ctx.db
                .query("sermons")
                .withIndex("by_status", (q) =>
                    q.eq("organizationId", args.organizationId).eq("status", status)
                )
                .order("desc")
                .collect();
        }

        return await ctx.db
            .query("sermons")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .collect();
    },
});
