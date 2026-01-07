import { inngest } from "../client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Generate text content using Gemini API (more cost-effective than Modal for non-GPU work)
export const generateTextContent = inngest.createFunction(
    {
        id: "generate-text-content",
        retries: 2,
    },
    { event: "sermon/generate-text" },
    async ({ event, step }) => {
        const {
            sermonId,
            generateQuotes,
            generateCarousel,
            generateDiscussionGuide,
            generateDevotional,
            generateBlogPost,
            generateOutline,
            generateSummary,
        } = event.data;

        // Step 1: Fetch transcript from Convex
        const transcript = await step.run("fetch-transcript", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            const response = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "transcripts:getBySermon",
                    args: { sermonId },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch transcript");
            }

            return response.json();
        });

        if (!transcript?.fullText) {
            return { success: false, error: "No transcript found" };
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error("Gemini API key not configured");
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Step 2: Generate quotes
        if (generateQuotes) {
            await step.run("generate-quotes", async () => {
                const prompt = `Extract 5-7 powerful, shareable quotes from this sermon transcript. Each quote should be:
- Self-contained and meaningful on its own
- Between 15-40 words
- Suitable for social media sharing
- Inspirational or thought-provoking

Format as JSON array: [{"quote": "...", "context": "brief context"}]

Transcript:
${transcript.fullText.substring(0, 10000)}`;

                const result = await model.generateContent(prompt);
                const quotesText = result.response.text();

                await saveContent(sermonId, "quote", quotesText);
            });
        }

        // Step 3: Generate discussion guide
        if (generateDiscussionGuide) {
            await step.run("generate-discussion-guide", async () => {
                const prompt = `Create a small group discussion guide based on this sermon transcript. Include:
1. Opening question (icebreaker)
2. 5-7 discussion questions that go deeper into the message
3. Application questions for daily life
4. Closing prayer point

Format as structured JSON.

Transcript:
${transcript.fullText.substring(0, 10000)}`;

                const result = await model.generateContent(prompt);
                await saveContent(sermonId, "discussion_guide", result.response.text());
            });
        }

        // Step 4: Generate devotional
        if (generateDevotional) {
            await step.run("generate-devotional", async () => {
                const prompt = `Create a 5-day devotional based on this sermon. Each day should include:
- Scripture reference
- Reflection (150-200 words)
- Prayer
- Application point

Format as structured JSON with days array.

Transcript:
${transcript.fullText.substring(0, 10000)}`;

                const result = await model.generateContent(prompt);
                await saveContent(sermonId, "devotional", result.response.text());
            });
        }

        // Step 5: Generate blog post
        if (generateBlogPost) {
            await step.run("generate-blog-post", async () => {
                const prompt = `Transform this sermon into a well-structured blog post:
- Compelling title
- Introduction hook
- Main points with subheadings
- Scripture references where appropriate
- Conclusion with call to action
- SEO-friendly (800-1200 words)

Transcript:
${transcript.fullText.substring(0, 10000)}`;

                const result = await model.generateContent(prompt);
                await saveContent(sermonId, "blog_post", result.response.text());
            });
        }

        // Step 6: Generate outline
        if (generateOutline) {
            await step.run("generate-outline", async () => {
                const prompt = `Create a detailed sermon outline from this transcript:
- Main title/theme
- Key scripture references
- Main points (3-5)
- Sub-points under each
- Key quotes or illustrations used

Format as structured JSON.

Transcript:
${transcript.fullText.substring(0, 10000)}`;

                const result = await model.generateContent(prompt);
                await saveContent(sermonId, "sermon_outline", result.response.text());
            });
        }

        // Step 7: Generate summary
        if (generateSummary) {
            await step.run("generate-summary", async () => {
                const prompt = `Create multiple summaries of this sermon:
1. One-sentence summary (for social media)
2. Short summary (50-75 words)
3. Full summary (150-200 words)
4. Key takeaways (bullet points)

Format as JSON object.

Transcript:
${transcript.fullText.substring(0, 10000)}`;

                const result = await model.generateContent(prompt);
                await saveContent(sermonId, "summary", result.response.text());
            });
        }

        return { success: true, sermonId };
    }
);

async function saveContent(sermonId: string, type: string, content: string) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return;

    await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path: "generatedContent:create",
            args: {
                sermonId,
                type,
                content,
                status: "ready",
            },
        }),
    });
}
