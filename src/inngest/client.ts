import { Inngest } from "inngest";

// Create an Inngest client for RevelationsHub
export const inngest = new Inngest({
    id: "revelationshub",
    // Event schemas can be added for type safety
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

export type InngestEvents =
    | SermonProcessEvent
    | SermonGenerateTextEvent
    | SermonGenerateImagesEvent;
