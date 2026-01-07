import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Organizations (synced from Clerk)
    organizations: defineTable({
        clerkOrgId: v.string(),
        name: v.string(),
        slug: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_clerk_id", ["clerkOrgId"]),

    // Organization members (synced from Clerk)
    members: defineTable({
        clerkUserId: v.string(),
        organizationId: v.id("organizations"),
        role: v.union(v.literal("admin"), v.literal("editor"), v.literal("contributor")),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    })
        .index("by_clerk_user", ["clerkUserId"])
        .index("by_org", ["organizationId"]),

    // Brand kits for each organization
    brandKits: defineTable({
        organizationId: v.id("organizations"),
        name: v.string(),
        logoLightUrl: v.optional(v.string()),
        logoDarkUrl: v.optional(v.string()),
        primaryColor: v.string(),
        secondaryColor: v.string(),
        fontFamily: v.string(),
    }).index("by_org", ["organizationId"]),

    // Sermons (video metadata - actual files in S3)
    sermons: defineTable({
        organizationId: v.id("organizations"),
        title: v.string(),
        series: v.optional(v.string()),
        speaker: v.optional(v.string()),
        date: v.optional(v.string()),
        s3Key: v.string(),
        s3Bucket: v.string(),
        youtubeUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        duration: v.optional(v.number()),
        status: v.union(
            v.literal("uploading"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
        videoType: v.union(v.literal("sermon"), v.literal("podcast")),
        createdAt: v.number(),
        createdBy: v.id("members"),
    })
        .index("by_org", ["organizationId"])
        .index("by_status", ["organizationId", "status"]),

    // Transcripts (stored in Convex - text is small)
    transcripts: defineTable({
        sermonId: v.id("sermons"),
        segments: v.array(v.object({
            start: v.number(),
            end: v.number(),
            word: v.string(),
        })),
        fullText: v.string(),
    }).index("by_sermon", ["sermonId"]),

    // Clips (metadata + S3 reference)
    clips: defineTable({
        sermonId: v.id("sermons"),
        title: v.optional(v.string()),
        startTime: v.number(),
        endTime: v.number(),
        s3Key: v.string(),
        thumbnailUrl: v.optional(v.string()),
        templateId: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
        createdAt: v.number(),
    }).index("by_sermon", ["sermonId"]),

    // Generated content (quotes, devotionals, blog, etc.)
    generatedContent: defineTable({
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
        content: v.string(), // JSON for structured content
        imageUrl: v.optional(v.string()), // For image content, stored in Convex
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed")
        ),
        createdAt: v.number(),
    }).index("by_sermon_type", ["sermonId", "type"]),

    // Processing jobs (for status tracking)
    jobs: defineTable({
        sermonId: v.id("sermons"),
        type: v.union(
            v.literal("full_processing"),
            v.literal("clips_only"),
            v.literal("quotes_only"),
            v.literal("carousel_only"),
            v.literal("text_content")
        ),
        inngestEventId: v.optional(v.string()),
        status: v.union(
            v.literal("queued"),
            v.literal("running"),
            v.literal("completed"),
            v.literal("failed")
        ),
        progress: v.optional(v.number()),
        error: v.optional(v.string()),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    }).index("by_sermon", ["sermonId"]),

    // Subscriptions (synced from Paystack)
    subscriptions: defineTable({
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
        clipCredits: v.number(), // Monthly clip allowance
        clipsUsed: v.number(),
    }).index("by_org", ["organizationId"]),
});
