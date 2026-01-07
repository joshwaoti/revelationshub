import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update subscription for an organization
export const upsert = mutation({
    args: {
        organizationId: v.id("organizations"),
        paystackCustomerId: v.string(),
        paystackSubscriptionId: v.optional(v.string()),
        plan: v.union(
            v.literal("free"),
            v.literal("plus"),
            v.literal("silver"),
            v.literal("gold"),
            v.literal("platinum")
        ),
        status: v.union(
            v.literal("active"),
            v.literal("cancelled"),
            v.literal("past_due"),
            v.literal("trialing")
        ),
        currentPeriodEnd: v.optional(v.number()),
        clipCredits: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                clipsUsed: existing.clipsUsed, // Preserve usage
            });
            return existing._id;
        }

        return await ctx.db.insert("subscriptions", {
            ...args,
            clipsUsed: 0,
        });
    },
});

// Get subscription by organization
export const getByOrg = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();
    },
});

// Increment usage counter
export const incrementUsage = mutation({
    args: {
        organizationId: v.id("organizations"),
        clipsToAdd: v.number(),
    },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();

        if (!subscription) {
            throw new Error("Subscription not found");
        }

        await ctx.db.patch(subscription._id, {
            clipsUsed: subscription.clipsUsed + args.clipsToAdd,
        });
    },
});

// Reset usage counter (called monthly by webhook/cron)
export const resetUsage = mutation({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();

        if (subscription) {
            await ctx.db.patch(subscription._id, { clipsUsed: 0 });
        }
    },
});

// Check if organization can create more clips
export const canCreateClips = query({
    args: {
        organizationId: v.id("organizations"),
        requestedCount: v.number(),
    },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .first();

        if (!subscription) {
            return { canCreate: false, reason: "No subscription found" };
        }

        const remaining = subscription.clipCredits - subscription.clipsUsed;

        if (remaining <= 0) {
            return {
                canCreate: false,
                reason: "No clip credits remaining",
                remaining: 0,
            };
        }

        return {
            canCreate: true,
            remaining,
            allowedCount: Math.min(args.requestedCount, remaining),
        };
    },
});
