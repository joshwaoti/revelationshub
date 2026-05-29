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

// Create a quote (allows multiple quotes per sermon)
export const createQuote = mutation({
    args: {
        sermonId: v.id("sermons"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("generatedContent", {
            sermonId: args.sermonId,
            type: "quote",
            content: args.content,
            status: "ready",
            createdAt: Date.now(),
        });
    },
});

// Delete all quotes for a sermon (before regenerating)
export const deleteQuotes = mutation({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const quotes = await ctx.db
            .query("generatedContent")
            .withIndex("by_sermon_type", (q) =>
                q.eq("sermonId", args.sermonId).eq("type", "quote")
            )
            .collect();

        for (const quote of quotes) {
            await ctx.db.delete(quote._id);
        }
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

// Get all generated content rows for one sermon/type.
export const getBySermonAndType = query({
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
            .collect();
    },
});

// Count content by type/status without returning large JSON payloads to the client.
export const getCountsBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const rows = await ctx.db
            .query("generatedContent")
            .withIndex("by_sermon_type", (q) => q.eq("sermonId", args.sermonId))
            .collect();

        const counts = {
            quote: 0,
            quote_image: 0,
            carousel: 0,
            discussion_guide: 0,
            devotional: 0,
            sermon_outline: 0,
            blog_post: 0,
            summary: 0,
        };

        for (const row of rows) {
            if (row.status === "ready") {
                counts[row.type] += 1;
            }
        }

        return counts;
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

// Update content (for editing)
export const updateContent = mutation({
    args: {
        contentId: v.id("generatedContent"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.contentId, { content: args.content });
    },
});

// Mark content as published
export const publish = mutation({
    args: {
        contentId: v.id("generatedContent"),
    },
    handler: async (ctx, args) => {
        const content = await ctx.db.get(args.contentId);
        if (!content) throw new Error("Content not found");

        // Generate a unique slug for the published content
        const slug = `${content.type}-${args.contentId}`;

        await ctx.db.patch(args.contentId, {
            publishedAt: Date.now(),
            slug,
        });

        return slug;
    },
});

// Get published content by slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("generatedContent")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});
