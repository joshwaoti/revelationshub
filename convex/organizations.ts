import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update organization (synced from Clerk)
export const upsert = mutation({
    args: {
        clerkOrgId: v.string(),
        name: v.string(),
        slug: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_clerk_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                slug: args.slug,
                imageUrl: args.imageUrl,
            });
            return existing._id;
        }

        return await ctx.db.insert("organizations", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Get organization by Clerk ID
export const getByClerkId = query({
    args: { clerkOrgId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("organizations")
            .withIndex("by_clerk_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
            .first();
    },
});

// Get organization by ID
export const getById = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.organizationId);
    },
});
