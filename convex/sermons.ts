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
            v.literal("failed")
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
