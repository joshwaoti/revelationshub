import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Format ISO 8601 duration to seconds
function parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    return hours * 3600 + minutes * 60 + seconds;
}

// Format view count for display
function formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return count;
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
        }

        // Use YouTube Data API (or oEmbed as fallback)
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (apiKey) {
            // Full API with all metadata
            const videoResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`
            );

            if (!videoResponse.ok) {
                throw new Error("YouTube API error");
            }

            const videoData = await videoResponse.json();

            if (!videoData.items || videoData.items.length === 0) {
                return NextResponse.json({ error: "Video not found" }, { status: 404 });
            }

            const video = videoData.items[0];
            const snippet = video.snippet;
            const contentDetails = video.contentDetails;
            const statistics = video.statistics;

            // Check for captions
            const captionsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
            );

            let hasTranscript = false;
            let captionLanguages: string[] = [];
            if (captionsResponse.ok) {
                const captionsData = await captionsResponse.json();
                hasTranscript = captionsData.items && captionsData.items.length > 0;
                if (captionsData.items) {
                    captionLanguages = captionsData.items.map((item: { snippet: { language: string } }) => item.snippet.language);
                }
            }

            // Get channel details for additional info
            const channelResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?id=${snippet.channelId}&part=snippet&key=${apiKey}`
            );

            let channelThumbnail = "";
            if (channelResponse.ok) {
                const channelData = await channelResponse.json();
                if (channelData.items && channelData.items.length > 0) {
                    channelThumbnail = channelData.items[0].snippet.thumbnails?.default?.url || "";
                }
            }

            // Return comprehensive metadata
            return NextResponse.json({
                // Basic info
                videoId,
                title: snippet.title,
                description: snippet.description,

                // Thumbnails (multiple resolutions)
                thumbnail: snippet.thumbnails.maxres?.url ||
                    snippet.thumbnails.high?.url ||
                    snippet.thumbnails.medium?.url ||
                    snippet.thumbnails.default?.url,
                thumbnails: {
                    default: snippet.thumbnails.default?.url,
                    medium: snippet.thumbnails.medium?.url,
                    high: snippet.thumbnails.high?.url,
                    maxres: snippet.thumbnails.maxres?.url,
                },

                // Duration and timing
                duration: parseDuration(contentDetails.duration),
                durationFormatted: contentDetails.duration,

                // Channel info
                channelId: snippet.channelId,
                channelName: snippet.channelTitle,
                channelThumbnail,

                // Publishing info
                publishedAt: snippet.publishedAt,
                publishedDate: new Date(snippet.publishedAt).toLocaleDateString(),

                // Categories and tags
                tags: snippet.tags || [],
                categoryId: snippet.categoryId,

                // Localization
                defaultLanguage: snippet.defaultLanguage,
                defaultAudioLanguage: snippet.defaultAudioLanguage,

                // Statistics
                viewCount: statistics.viewCount,
                viewCountFormatted: formatViewCount(statistics.viewCount || "0"),
                likeCount: statistics.likeCount,
                commentCount: statistics.commentCount,

                // Content details
                definition: contentDetails.definition, // hd or sd
                dimension: contentDetails.dimension, // 2d or 3d
                caption: contentDetails.caption === "true",
                licensedContent: contentDetails.licensedContent,

                // Transcript info
                hasTranscript,
                captionLanguages,

                // Live streaming info (if applicable)
                liveBroadcastContent: snippet.liveBroadcastContent,
            });
        } else {
            // Fallback: oEmbed (minimal metadata)
            const oembedResponse = await fetch(
                `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`
            );

            if (!oembedResponse.ok) {
                return NextResponse.json({ error: "Video not found" }, { status: 404 });
            }

            const oembedData = await oembedResponse.json();

            return NextResponse.json({
                videoId,
                title: oembedData.title,
                description: "",
                thumbnail: oembedData.thumbnail_url,
                thumbnails: {
                    default: oembedData.thumbnail_url,
                },
                duration: 0,
                durationFormatted: "",
                channelId: "",
                channelName: oembedData.author_name,
                channelThumbnail: "",
                publishedAt: "",
                publishedDate: "",
                tags: [],
                categoryId: "",
                defaultLanguage: "",
                defaultAudioLanguage: "",
                viewCount: "0",
                viewCountFormatted: "0",
                likeCount: "0",
                commentCount: "0",
                definition: "",
                dimension: "",
                caption: false,
                licensedContent: false,
                hasTranscript: false,
                captionLanguages: [],
                liveBroadcastContent: "",
            });
        }
    } catch (error) {
        console.error("YouTube metadata error:", error);
        return NextResponse.json(
            { error: "Failed to fetch video metadata" },
            { status: 500 }
        );
    }
}
