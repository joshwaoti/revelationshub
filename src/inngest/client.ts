import { Inngest } from "inngest";

// Create an Inngest client for RevelationsHub
// In development, this uses the local dev server
export const inngest = new Inngest({
    id: "revelationshub",
    // Force dev mode for local development
    isDev: process.env.NODE_ENV === "development" || !process.env.INNGEST_SIGNING_KEY,
});

// Event types for type safety
export type SermonProcessEvent = {
    name: "sermon/process";
    data: {
        sermonId: string;
        s3Key?: string;
        youtubeUrl?: string;
        videoType: "sermon" | "podcast";
        maxClips: number;
        captionEffect?: "none" | "pop" | "fade" | "karaoke";
        organizationId: string;
    };
};

export type SermonGenerateTextEvent = {
    name: "sermon/generate-text";
    data: {
        sermonId: string;
        generateQuotes: boolean;
        generateCarousel: boolean;
        generateDiscussionGuide: boolean;
        generateDevotional: boolean;
        generateBlogPost: boolean;
        generateOutline: boolean;
        generateSummary: boolean;
    };
};

export type SermonGenerateImagesEvent = {
    name: "sermon/generate-images";
    data: {
        sermonId: string;
        quoteCount: number;
    };
};

export type SermonRegenerateClipsEvent = {
    name: "sermon/regenerate-clips";
    data: {
        sermonId: string;
        captionEffect: "none" | "pop" | "fade" | "karaoke";
        clipCount: number;
        locationType: "auto" | "text" | "time";
        clipDescription?: string;
        startTime?: number;
        endTime?: number;
        appendMode: boolean;
        organizationId: string;
    };
};

export type InngestEvents =
    | SermonProcessEvent
    | SermonGenerateTextEvent
    | SermonGenerateImagesEvent
    | SermonRegenerateClipsEvent;
