import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upsert member (synced from Clerk)
export const upsert = mutation({
    args: {
        clerkUserId: v.string(),
        organizationId: v.id("organizations"),
        role: v.union(v.literal("admin"), v.literal("editor"), v.literal("contributor")),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("members")
            .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args);
            return existing._id;
        }

        return await ctx.db.insert("members", args);
    },
});

// Get member by Clerk user ID
export const getByClerkUserId = query({
    args: { clerkUserId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("members")
            .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
            .first();
    },
});

// Get all members for an organization
export const getByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("members")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .collect();
    },
});

// Update member role
export const updateRole = mutation({
    args: {
        memberId: v.id("members"),
        role: v.union(v.literal("admin"), v.literal("editor"), v.literal("contributor")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.memberId, { role: args.role });
    },
});
