import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const actionValidator = v.object({
    type: v.union(
        v.literal("clip_from_moment"),
        v.literal("clip_from_transcript")
    ),
    startTime: v.number(),
    endTime: v.number(),
    title: v.optional(v.string()),
    momentId: v.optional(v.id("viralMoments")),
});

// Get the full conversation for a sermon/podcast
export const getBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("chatMessages")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
    },
});

// Append a message to the conversation
export const add = mutation({
    args: {
        sermonId: v.id("sermons"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        action: v.optional(actionValidator),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("chatMessages", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Clear the conversation for a sermon/podcast
export const clear = mutation({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("chatMessages")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        return { deleted: messages.length };
    },
});
