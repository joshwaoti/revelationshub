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
        description: v.optional(v.string()),
        series: v.optional(v.string()),
        speaker: v.optional(v.string()),
        date: v.optional(v.string()),
        s3Key: v.string(),
        s3Bucket: v.string(),
        // YouTube specific
        youtubeUrl: v.optional(v.string()),
        youtubeVideoId: v.optional(v.string()),
        channelName: v.optional(v.string()),
        channelId: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        // Media info
        thumbnailUrl: v.optional(v.string()),
        duration: v.optional(v.number()),
        viewCount: v.optional(v.string()),
        definition: v.optional(v.string()), // hd or sd
        hasTranscript: v.optional(v.boolean()),
        // Status
        status: v.union(
            v.literal("uploading"),
            v.literal("processing"),
            v.literal("ready"),
            v.literal("failed"),
            v.literal("cancelled")
        ),
        videoType: v.union(v.literal("sermon"), v.literal("podcast")),
        // Last caption style the user chose - reused by the transcript chat
        // and as the default for future clip generation
        preferredCaptionEffect: v.optional(v.union(
            v.literal("none"),
            v.literal("pop"),
            v.literal("fade"),
            v.literal("karaoke")
        )),
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
        // Editorial metadata from AI moment analysis
        hook: v.optional(v.string()),
        quote: v.optional(v.string()),
        reason: v.optional(v.string()),
        category: v.optional(v.string()),
        score: v.optional(v.number()),
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
        // Editable captions for this clip (word-level timing)
        captions: v.optional(v.array(v.object({
            id: v.string(),
            startTime: v.number(), // Relative to clip start
            endTime: v.number(),
            word: v.string(),
        }))),
        // Caption styling preferences
        captionStyle: v.optional(v.object({
            font: v.string(),
            fontSize: v.number(),
            color: v.string(),
            highlightColor: v.optional(v.string()),
            backgroundColor: v.optional(v.string()),
            position: v.union(v.literal("top"), v.literal("center"), v.literal("bottom")),
            animation: v.union(v.literal("none"), v.literal("fade"), v.literal("pop"), v.literal("karaoke")),
        })),
        createdAt: v.number(),
    }).index("by_sermon", ["sermonId"]),

    // Viral moments identified during initial processing
    // These are ALL the moments identified by AI, not just the ones turned into clips
    // Allows regenerating clips from unused moments without re-analyzing
    viralMoments: defineTable({
        sermonId: v.id("sermons"),
        startTime: v.number(),
        endTime: v.number(),
        // Editorial metadata from AI moment analysis (used for ranking,
        // display, and matching moments in the transcript chat)
        title: v.optional(v.string()),
        hook: v.optional(v.string()),
        quote: v.optional(v.string()),
        reason: v.optional(v.string()),
        category: v.optional(v.string()),
        score: v.optional(v.number()),
        // Track if this moment has been used to create a clip
        used: v.boolean(),
        createdAt: v.number(),
    }).index("by_sermon", ["sermonId"])
        .index("by_sermon_unused", ["sermonId", "used"]),

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
        // Publishing fields
        publishedAt: v.optional(v.number()),
        slug: v.optional(v.string()),
    })
        .index("by_sermon_type", ["sermonId", "type"])
        .index("by_slug", ["slug"]),

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
            v.literal("failed"),
            v.literal("cancelled")
        ),
        progress: v.optional(v.number()),
        error: v.optional(v.string()),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    }).index("by_sermon", ["sermonId"]),

    // Transcript chat - conversation with the AI about a sermon/podcast
    // transcript. The assistant can locate stored moments or trigger new
    // clip generation, tracked via the optional action payload.
    chatMessages: defineTable({
        sermonId: v.id("sermons"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        // Set when the assistant kicked off a clip generation
        action: v.optional(v.object({
            type: v.union(
                v.literal("clip_from_moment"),
                v.literal("clip_from_transcript")
            ),
            startTime: v.number(),
            endTime: v.number(),
            title: v.optional(v.string()),
            momentId: v.optional(v.id("viralMoments")),
        })),
        createdAt: v.number(),
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
