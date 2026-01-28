import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save all identified viral moments from initial processing
export const saveBatch = mutation({
    args: {
        sermonId: v.id("sermons"),
        moments: v.array(v.object({
            startTime: v.number(),
            endTime: v.number(),
        })),
        // Which moments were actually turned into clips (by their indices)
        usedIndices: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        const { sermonId, moments, usedIndices } = args;

        const usedSet = new Set(usedIndices);

        for (let i = 0; i < moments.length; i++) {
            const moment = moments[i];
            await ctx.db.insert("viralMoments", {
                sermonId,
                startTime: moment.startTime,
                endTime: moment.endTime,
                used: usedSet.has(i),
                createdAt: Date.now(),
            });
        }

        return { saved: moments.length };
    },
});

// Get all moments for a sermon
export const getBySermon = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("viralMoments")
            .withIndex("by_sermon", (q) => q.eq("sermonId", args.sermonId))
            .collect();
    },
});

// Get unused moments for a sermon (for regeneration)
export const getUnused = query({
    args: { sermonId: v.id("sermons") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("viralMoments")
            .withIndex("by_sermon_unused", (q) =>
                q.eq("sermonId", args.sermonId).eq("used", false)
            )
            .collect();
    },
});

// Mark moments as used when clips are created from them
export const markAsUsed = mutation({
    args: {
        momentIds: v.array(v.id("viralMoments")),
    },
    handler: async (ctx, args) => {
        for (const momentId of args.momentIds) {
            await ctx.db.patch(momentId, { used: true });
        }
        return { updated: args.momentIds.length };
    },
});

// Get random unused moments for auto-regeneration
export const getRandomUnused = query({
    args: {
        sermonId: v.id("sermons"),
        count: v.number(),
    },
    handler: async (ctx, args) => {
        const unused = await ctx.db
            .query("viralMoments")
            .withIndex("by_sermon_unused", (q) =>
                q.eq("sermonId", args.sermonId).eq("used", false)
            )
            .collect();

        // Shuffle and return requested count
        const shuffled = unused.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, args.count);
    },
});
