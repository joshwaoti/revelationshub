import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update brand kit
export const upsert = mutation({
    args: {
        organizationId: v.id("organizations"),
        name: v.string(),
        logoLightUrl: v.optional(v.string()),
        logoDarkUrl: v.optional(v.string()),
        primaryColor: v.string(),
        secondaryColor: v.string(),
        fontFamily: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if brand kit already exists
        const existing = await ctx.db
            .query("brandKits")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args);
            return existing._id;
        }

        return await ctx.db.insert("brandKits", args);
    },
});

// Get brand kit by organization
export const getByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("brandKits")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();
    },
});

// Update brand kit
export const update = mutation({
    args: {
        brandKitId: v.id("brandKits"),
        name: v.optional(v.string()),
        logoLightUrl: v.optional(v.string()),
        logoDarkUrl: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        secondaryColor: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { brandKitId, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        await ctx.db.patch(brandKitId, filteredUpdates);
    },
});
