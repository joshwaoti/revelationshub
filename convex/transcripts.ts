import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new transcript
export const create = mutation({
    args: {
        sermonId: v.id("sermons"),
        segments: v.array(v.object({
            start: v.number(),
            end: v.number(),
            word: v.string(),
        })),
        fullText: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if transcript already exists for this sermon
        const existing = await ctx.db
            .query("transcripts")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .first();

        if (existing) {
            // Update existing transcript
            await ctx.db.patch(existing._id, {
                segments: args.segments,
                fullText: args.fullText,
            });
            return existing._id;
        }

        // Create new transcript
        return await ctx.db.insert("transcripts", args);
    },
});

// Get transcript by sermon ID
export const getBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("transcripts")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .first();
    },
});

// Lightweight transcript metadata for dashboard/status screens.
export const getSummaryBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const transcript = await ctx.db
            .query("transcripts")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .first();

        if (!transcript) {
            return {
                exists: false,
                segmentCount: 0,
                textLength: 0,
            };
        }

        return {
            exists: true,
            segmentCount: transcript.segments.length,
            textLength: transcript.fullText.length,
        };
    },
});
