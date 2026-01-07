// Processing configuration from frontend
export interface ProcessingConfig {
    // Video source
    source: 'upload' | 'youtube';
    youtubeUrl?: string;
    s3Key?: string;

    // Video type
    videoType: 'sermon' | 'podcast';

    // What to generate (user selects)
    generateClips: boolean;
    clipCount: number; // User requested count (validated against tier)

    generateQuotes: boolean;
    quoteCount: number;

    generateCarousel: boolean;

    generateDiscussionGuide: boolean;
    generateDevotional: boolean;
    generateBlogPost: boolean;
    generateOutline: boolean;
    generateSummary: boolean;

    // Template settings
    clipTemplateId?: string;

    // Brand kit for styling
    brandKitId?: string;
}

// What actually gets sent to Modal (after validation)
export interface ModalProcessRequest {
    s3_key?: string;
    youtube_url?: string;
    video_type: 'sermon' | 'podcast';
    max_clips: number; // Validated and clamped to tier limit
}

// Modal API response
export interface ModalProcessResponse {
    status: 'success' | 'error';
    s3_key: string;
    clips_created: number;
    transcript_segments: TranscriptSegment[];
    clip_moments: ClipMoment[];
    error?: string;
}

export interface TranscriptSegment {
    start: number;
    end: number;
    word: string;
}

export interface ClipMoment {
    start: number;
    end: number;
    s3_key: string;
}

// Sermon status
export type SermonStatus = 'uploading' | 'processing' | 'ready' | 'failed';

// Content types
export type ContentType =
    | 'quote'
    | 'quote_image'
    | 'carousel'
    | 'discussion_guide'
    | 'devotional'
    | 'sermon_outline'
    | 'blog_post'
    | 'summary';

// Job types
export type JobType =
    | 'full_processing'
    | 'clips_only'
    | 'quotes_only'
    | 'carousel_only'
    | 'text_content';
