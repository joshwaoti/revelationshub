import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create generated content
export const create = mutation({
    args: {
        sermonId: v.id("sermons"),
        type: v.union(
            v.literal("quote"),
            v.literal("quote_image"),
            v.literal("carousel"),
            v.literal("discussion_guide"),
            v.literal("devotional"),
            v.literal("sermon_outline"),
            v.literal("blog_post"),
            v.literal("summary")
        ),
        content: v.string(),
        imageUrl: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        // Check if content of this type already exists
        const existing = await ctx.db
            .query("generatedContent")
            .withIndex("by_sermon_type", (q) =>
                q.eq("sermonId", args.sermonId).eq("type", args.type)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                content: args.content,
                imageUrl: args.imageUrl,
                status: args.status,
            });
            return existing._id;
        }

        return await ctx.db.insert("generatedContent", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Get all generated content for a sermon
export const getBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("generatedContent")
            .withIndex("by_sermon_type", (q) => q.eq("sermonId", args.sermonId))
            .collect();
    },
});

// Get specific content type for a sermon
export const getByType = query({
    args: {
        sermonId: v.id("sermons"),
        type: v.union(
            v.literal("quote"),
            v.literal("quote_image"),
            v.literal("carousel"),
            v.literal("discussion_guide"),
            v.literal("devotional"),
            v.literal("sermon_outline"),
            v.literal("blog_post"),
            v.literal("summary")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("generatedContent")
            .withIndex("by_sermon_type", (q) =>
                q.eq("sermonId", args.sermonId).eq("type", args.type)
            )
            .first();
    },
});

// Update content status
export const updateStatus = mutation({
    args: {
        contentId: v.id("generatedContent"),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.contentId, { status: args.status });
    },
});
