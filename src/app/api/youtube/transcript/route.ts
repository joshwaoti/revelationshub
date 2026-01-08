import { NextRequest, NextResponse } from "next/server";

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

    // If it's just an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }

    return null;
}

// Parse XML/TTML transcript to segments
function parseTranscript(xml: string): Array<{ text: string; start: number; duration: number }> {
    const segments: Array<{ text: string; start: number; duration: number }> = [];

    // Match <text start="..." dur="...">content</text>
    const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
        const start = parseFloat(match[1]);
        const duration = parseFloat(match[2]);
        let text = match[3];

        // Decode HTML entities
        text = text
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n/g, " ")
            .trim();

        if (text) {
            segments.push({ text, start, duration });
        }
    }

    return segments;
}

// Convert to word-level segments
function toWordSegments(segments: Array<{ text: string; start: number; duration: number }>): Array<{ word: string; start: number; end: number }> {
    const wordSegments: Array<{ word: string; start: number; end: number }> = [];

    for (const segment of segments) {
        const words = segment.text.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) continue;

        const wordDuration = segment.duration / words.length;

        for (let i = 0; i < words.length; i++) {
            const wordStart = segment.start + (i * wordDuration);
            const wordEnd = segment.start + ((i + 1) * wordDuration);

            wordSegments.push({
                word: words[i],
                start: Math.round(wordStart * 1000) / 1000,
                end: Math.round(wordEnd * 1000) / 1000,
            });
        }
    }

    return wordSegments;
}

export async function POST(req: NextRequest) {
    try {
        // No auth required - this fetches public YouTube data
        // and is also called internally from /api/process

        const { url, videoId: providedVideoId, language = "en" } = await req.json();

        const videoId = providedVideoId || extractVideoId(url || "");
        if (!videoId) {
            return NextResponse.json({ error: "Invalid YouTube URL or video ID" }, { status: 400 });
        }

        // First, try to get the transcript list to find available languages
        const listUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const pageResponse = await fetch(listUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!pageResponse.ok) {
            return NextResponse.json({ error: "Could not access video page" }, { status: 404 });
        }

        const pageHtml = await pageResponse.text();

        // Extract caption track info from the page
        const captionMatch = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
        if (!captionMatch) {
            // Try timedtext fallback
            const timedtextUrl = `https://video.google.com/timedtext?lang=${language}&v=${videoId}`;
            const timedtextResponse = await fetch(timedtextUrl);

            if (timedtextResponse.ok) {
                const xml = await timedtextResponse.text();
                if (xml && xml.includes("<text")) {
                    const segments = parseTranscript(xml);
                    const wordSegments = toWordSegments(segments);

                    return NextResponse.json({
                        videoId,
                        language,
                        segments: wordSegments,
                        segmentCount: wordSegments.length,
                    });
                }
            }

            return NextResponse.json({
                error: "No captions available for this video",
                hasTranscript: false
            }, { status: 404 });
        }

        // Parse caption tracks
        let captionTracks;
        try {
            captionTracks = JSON.parse(captionMatch[1]);
        } catch {
            return NextResponse.json({ error: "Could not parse caption tracks" }, { status: 500 });
        }

        // Find the best caption track (prefer manual, English if available)
        let selectedTrack = captionTracks.find(
            (t: { languageCode: string; kind?: string }) =>
                t.languageCode === language && t.kind !== "asr"
        );

        if (!selectedTrack) {
            selectedTrack = captionTracks.find(
                (t: { languageCode: string }) => t.languageCode === language
            );
        }

        if (!selectedTrack) {
            selectedTrack = captionTracks.find(
                (t: { languageCode: string }) => t.languageCode.startsWith("en")
            );
        }

        if (!selectedTrack && captionTracks.length > 0) {
            selectedTrack = captionTracks[0];
        }

        if (!selectedTrack || !selectedTrack.baseUrl) {
            return NextResponse.json({
                error: "No suitable caption track found",
                hasTranscript: false,
                availableLanguages: captionTracks.map((t: { languageCode: string }) => t.languageCode)
            }, { status: 404 });
        }

        // Fetch the actual transcript
        const transcriptUrl = selectedTrack.baseUrl;
        const transcriptResponse = await fetch(transcriptUrl);

        if (!transcriptResponse.ok) {
            return NextResponse.json({ error: "Could not fetch transcript" }, { status: 500 });
        }

        const transcriptXml = await transcriptResponse.text();
        const segments = parseTranscript(transcriptXml);
        const wordSegments = toWordSegments(segments);

        return NextResponse.json({
            videoId,
            language: selectedTrack.languageCode,
            isGenerated: selectedTrack.kind === "asr",
            segments: wordSegments,
            segmentCount: wordSegments.length,
            availableLanguages: captionTracks.map((t: { languageCode: string }) => t.languageCode),
        });

    } catch (error) {
        console.error("YouTube transcript error:", error);
        return NextResponse.json(
            { error: "Failed to fetch transcript" },
            { status: 500 }
        );
    }
}
