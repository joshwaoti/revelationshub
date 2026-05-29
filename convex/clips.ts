import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new clip record
export const create = mutation({
    args: {
        sermonId: v.id("sermons"),
        title: v.optional(v.string()),
        startTime: v.number(),
        endTime: v.number(),
        s3Key: v.string(),
        thumbnailUrl: v.optional(v.string()),
        templateId: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("clips", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Get all clips for a sermon
export const getBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("clips")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
    },
});

// Get clip counts for a sermon without returning caption or media metadata.
export const getCountsBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const clips = await ctx.db
            .query("clips")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();

        return {
            ready: clips.filter((clip) => clip.status === "ready").length,
            processing: clips.filter((clip) => clip.status === "processing").length,
            pending: clips.filter((clip) => clip.status === "pending").length,
            failed: clips.filter((clip) => clip.status === "failed").length,
            total: clips.length,
        };
    },
});

// Get the first few ready clips for overview pages without captions.
export const getReadyPreviewBySermon = query({
    args: {
        sermonId: v.id("sermons"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 4;
        const clips = await ctx.db
            .query("clips")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();

        return clips
            .filter((clip) => clip.status === "ready")
            .slice(0, limit)
            .map((clip) => ({
                _id: clip._id,
                title: clip.title,
                startTime: clip.startTime,
                endTime: clip.endTime,
                thumbnailUrl: clip.thumbnailUrl,
            }));
    },
});

// Update clip status
export const updateStatus = mutation({
    args: {
        clipId: v.id("clips"),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.clipId, { status: args.status });
    },
});

// Update clip details
export const update = mutation({
    args: {
        clipId: v.id("clips"),
        title: v.optional(v.string()),
        templateId: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { clipId, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        await ctx.db.patch(clipId, filteredUpdates);
    },
});

// Batch create clips (for when Modal returns multiple clips)
export const createBatch = mutation({
    args: {
        sermonId: v.id("sermons"),
        clips: v.array(v.object({
            startTime: v.number(),
            endTime: v.number(),
            s3Key: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const clipIds = [];
        for (const clip of args.clips) {
            const id = await ctx.db.insert("clips", {
                sermonId: args.sermonId,
                ...clip,
                status: "ready",
                createdAt: Date.now(),
            });
            clipIds.push(id);
        }
        return clipIds;
    },
});

// Update clip captions
export const updateCaptions = mutation({
    args: {
        clipId: v.id("clips"),
        captions: v.array(v.object({
            id: v.string(),
            startTime: v.number(),
            endTime: v.number(),
            word: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.clipId, { captions: args.captions });
    },
});

// Update clip caption style
export const updateCaptionStyle = mutation({
    args: {
        clipId: v.id("clips"),
        captionStyle: v.object({
            font: v.string(),
            fontSize: v.number(),
            color: v.string(),
            highlightColor: v.optional(v.string()),
            backgroundColor: v.optional(v.string()),
            position: v.union(v.literal("top"), v.literal("center"), v.literal("bottom")),
            animation: v.union(v.literal("none"), v.literal("fade"), v.literal("pop"), v.literal("karaoke")),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.clipId, { captionStyle: args.captionStyle });
    },
});

// Get single clip by ID
export const getById = query({
    args: { clipId: v.id("clips") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.clipId);
    },
});

// Get single clip by S3 key for server-side ownership checks.
export const getByS3Key = query({
    args: { s3Key: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("clips")
            .filter((q) => q.eq(q.field("s3Key"), args.s3Key))
            .first();
    },
});
