import { inngest } from "../client";
import { generateText } from "@/lib/server/llm";

// Generate text content using Gemini API
// This function handles two cases:
// 1. YouTube videos: Receives transcript segments directly in event.data
// 2. S3 uploads: Fetches existing transcript from Convex
export const generateTextContent = inngest.createFunction(
    {
        id: "generate-text-content",
        retries: 2,
    },
    { event: "sermon/generate-text" },
    async ({ event, step }) => {
        const {
            sermonId,
            transcriptSegments, // For YouTube: segments passed directly
            generateQuotes,
            generateCarousel,
            generateDiscussionGuide,
            generateDevotional,
            generateBlogPost,
            generateOutline,
            generateSummary,
        } = event.data;

        // Step 1: Get or save transcript
        const transcript = await step.run("handle-transcript", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) throw new Error("Convex URL not configured");

            // If we have transcriptSegments (YouTube flow), save them to Convex first
            if (transcriptSegments && transcriptSegments.length > 0) {
                const fullText = transcriptSegments.map((s: { word: string }) => s.word).join(" ");

                // Handle Convex 8192 array limit
                const MAX_SEGMENTS = 8000;
                const segmentsToSave = transcriptSegments.length > MAX_SEGMENTS
                    ? transcriptSegments.slice(0, MAX_SEGMENTS)
                    : transcriptSegments;

                // Save transcript to Convex
                await fetch(`${convexUrl}/api/mutation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "transcripts:create",
                        args: {
                            sermonId,
                            segments: segmentsToSave,
                            fullText, // Always save full text
                        },
                        format: "json",
                    }),
                });

                // Also update sermon status
                await fetch(`${convexUrl}/api/mutation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "sermons:updateStatus",
                        args: {
                            sermonId,
                            status: "processing",
                        },
                        format: "json",
                    }),
                });

                return { fullText, segments: transcriptSegments };
            }

            // Otherwise fetch existing transcript (S3 upload flow)
            const response = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "transcripts:getBySermon",
                    args: { sermonId },
                    format: "json",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to fetch transcript:", errorText);
                throw new Error("Failed to fetch transcript");
            }

            const result = await response.json();
            console.log("Transcript query result:", JSON.stringify(result).substring(0, 500));

            // Convex HTTP API returns { value: ... } when using format: "json"
            return result.value || result;
        });

        if (!transcript?.fullText) {
            // Update status to error
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (convexUrl) {
                await fetch(`${convexUrl}/api/mutation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "sermons:updateStatus",
                        args: { sermonId, status: "failed" },
                        format: "json",
                    }),
                });
            }
            return { success: false, error: "No transcript found" };
        }

        // Step 2: Generate quotes
        if (generateQuotes) {
            await step.run("generate-quotes", async () => {
                const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
                if (!convexUrl) throw new Error("Convex URL not configured");

                console.log(`[generate-quotes] Starting quote generation for sermon: ${sermonId}`);
                console.log(`[generate-quotes] Transcript available: ${!!transcript?.fullText}`);
                console.log(`[generate-quotes] Transcript length: ${transcript?.fullText?.length || 0} chars`);

                // Delete existing quotes first
                console.log(`[generate-quotes] Deleting existing quotes...`);
                const deleteResponse = await fetch(`${convexUrl}/api/mutation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "generatedContent:deleteQuotes",
                        args: { sermonId },
                        format: "json",
                    }),
                });

                if (!deleteResponse.ok) {
                    const deleteError = await deleteResponse.text();
                    console.error(`[generate-quotes] Failed to delete quotes:`, deleteError);
                } else {
                    console.log(`[generate-quotes] Deleted existing quotes successfully`);
                }

                const prompt = `You are a sermon content specialist. Extract 5-7 powerful, shareable quotes from this sermon transcript.

REQUIREMENTS:
- Each quote should be self-contained and meaningful on its own
- Length: 15-40 words each
- Must be directly from the sermon (not paraphrased)
- Should be inspirational, thought-provoking, or convicting
- Include biblical wisdom or spiritual insights
- Suitable for Instagram/Facebook image posts

AVOID:
- Quotes that require context to understand
- Housekeeping announcements
- References to specific congregants or events
- Incomplete thoughts

OUTPUT FORMAT (JSON array):
[
  {
    "quote": "The exact quote text from the sermon",
    "context": "Brief 5-10 word description of the sermon moment"
  }
]

Return ONLY valid JSON, no additional text.

TRANSCRIPT:
${transcript.fullText}`;

                console.log(`[generate-quotes] Calling LLM provider...`);
                const responseText = await generateText(prompt, { task: "generate-quotes" });
                console.log(`[generate-quotes] LLM response length: ${responseText.length} chars`);
                console.log(`[generate-quotes] Response preview: ${responseText.substring(0, 200)}`);

                // Parse the response to save each quote separately
                let quotes: Array<{ quote: string; context?: string }> = [];
                try {
                    let cleanText = responseText.trim();
                    // Remove markdown code blocks if present
                    if (cleanText.startsWith('```')) {
                        cleanText = cleanText.replace(/^```(?:json)?\s*\n?/, '');
                        cleanText = cleanText.replace(/\n?```\s*$/, '');
                    }
                    quotes = JSON.parse(cleanText);
                    console.log(`[generate-quotes] Parsed ${quotes.length} quotes successfully`);
                } catch (e) {
                    console.error("[generate-quotes] Failed to parse quotes:", e);
                    console.error("[generate-quotes] Raw response:", responseText.substring(0, 500));
                    return { success: false, error: "Failed to parse quotes" };
                }

                // Save each quote as a separate content item using createQuote
                console.log(`[generate-quotes] Saving ${quotes.length} individual quotes...`);
                for (let i = 0; i < quotes.length; i++) {
                    const quoteData = quotes[i];
                    const saveResponse = await fetch(`${convexUrl}/api/mutation`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            path: "generatedContent:createQuote",
                            args: {
                                sermonId,
                                content: JSON.stringify(quoteData),
                            },
                            format: "json",
                        }),
                    });

                    const saveResult = await saveResponse.json().catch(() => null);
                    console.log(`[generate-quotes] Quote ${i + 1} response:`, JSON.stringify(saveResult));

                    if (!saveResponse.ok) {
                        console.error(`[generate-quotes] Failed to save quote ${i + 1}: HTTP ${saveResponse.status}`);
                    } else if (saveResult?.status === 'error') {
                        console.error(`[generate-quotes] Convex error for quote ${i + 1}:`, saveResult.errorMessage);
                    } else {
                        console.log(`[generate-quotes] Saved quote ${i + 1}/${quotes.length} with ID: ${saveResult?.value}`);
                    }
                }

                console.log(`[generate-quotes] Completed saving all quotes`);
                return { success: true, count: quotes.length };
            });
        }

        // Step 3: Generate social carousel (NEW)
        if (generateCarousel) {
            await step.run("generate-carousel", async () => {
                const prompt = `You are a social media content creator for churches. Create a 5-slide Instagram/LinkedIn carousel based on this sermon.

SLIDE TYPES (in order):
1. COVER - Eye-catching title slide
2. QUOTE - Most powerful quote from the sermon
3. LIST - 3-5 key points or steps (numbered)
4. ACTION - Practical application or challenge
5. CTA - Call to action / invitation

REQUIREMENTS:
- Each slide text must be concise (fit on a square image)
- Use engaging, conversational language
- Capture the sermon's core message
- End with an invitation to engage or attend

OUTPUT FORMAT (JSON):
{
  "slides": [
    {"type": "cover", "title": "Main Sermon Title", "subtitle": "Contextual subtitle"},
    {"type": "quote", "content": "Powerful quote from sermon"},
    {"type": "list", "content": "Key points:\\n\\n1. First point\\n2. Second point\\n3. Third point"},
    {"type": "action", "content": "Practical challenge or application for the week"},
    {"type": "cta", "title": "Join us", "subtitle": "Next Sunday for more"}
  ]
}

Return ONLY valid JSON.

TRANSCRIPT:
${transcript.fullText}`;

                const responseText = await generateText(prompt, { task: "generate-carousel" });
                await saveContent(sermonId, "carousel", responseText);
            });
        }

        // Step 4: Generate discussion guide
        if (generateDiscussionGuide) {
            await step.run("generate-discussion-guide", async () => {
                const prompt = `You are a small group ministry leader. Create a comprehensive discussion guide for small groups based on this sermon.

STRUCTURE:
1. Opening Prayer - Brief prayer (2-3 sentences) setting the tone
2. Key Scripture - The primary scripture reference with full text
3. Icebreaker - Fun, easy opening question related to the topic
4. Discussion Questions - 5-7 questions that progressively go deeper
5. Application Questions - 2-3 questions about applying the message
6. Weekly Challenge - Specific action item for the week
7. Closing Prayer - Short prayer to end the group time

REQUIREMENTS:
- Questions should be open-ended, not yes/no
- Progress from observation to interpretation to application
- Include scripture references where relevant
- Make it practical and applicable to daily life

OUTPUT FORMAT (JSON):
{
  "title": "Sermon title",
  "openingPrayer": "Lord, as we gather...",
  "keyScripture": {
    "text": "Full scripture text quoted",
    "reference": "Book Chapter:Verse (Translation)"
  },
  "icebreaker": "Fun opening question...",
  "discussionQuestions": [
    "Question 1 about the passage...",
    "Question 2 going deeper..."
  ],
  "applicationQuestions": [
    "How will you apply this..."
  ],
  "weeklyChallenge": "This week, commit to...",
  "closingPrayer": "Father, thank You for..."
}

Return ONLY valid JSON.

TRANSCRIPT:
${transcript.fullText}`;

                const responseText = await generateText(prompt, { task: "generate-discussion-guide" });
                await saveContent(sermonId, "discussion_guide", responseText);
            });
        }

        // Step 5: Generate devotional
        if (generateDevotional) {
            await step.run("generate-devotional", async () => {
                const prompt = `You are a devotional writer. Create a 5-day devotional series based on this sermon's themes.

STRUCTURE FOR EACH DAY:
- Day number and name (Monday-Friday)
- Title (theme for that day)
- Scripture reference
- Reflection (150-200 words exploring the theme)
- Prayer Focus (1-2 sentence prayer prompt)
- Application Point (specific action for the day)

REQUIREMENTS:
- Each day should focus on a different aspect of the sermon
- Build progressively throughout the week
- Use scriptures that support each day's theme
- Make reflections personal and relatable
- Include practical, doable applications

OUTPUT FORMAT (JSON):
{
  "title": "Devotional series title",
  "subtitle": "Brief description of the journey",
  "days": [
    {
      "day": 1,
      "dayName": "Monday",
      "title": "Theme title for day 1",
      "scripture": "Scripture Reference",
      "reflection": "150-200 word reflection...",
      "prayerFocus": "Lord, help me to...",
      "applicationPoint": "Today, practice..."
    }
  ]
}

Return ONLY valid JSON.

TRANSCRIPT:
${transcript.fullText}`;

                const responseText = await generateText(prompt, { task: "generate-devotional" });
                await saveContent(sermonId, "devotional", responseText);
            });
        }

        // Step 6: Generate blog post
        if (generateBlogPost) {
            await step.run("generate-blog-post", async () => {
                const prompt = `You are a church communications writer. Transform this sermon into a well-structured, SEO-friendly blog post.

REQUIREMENTS:
- Length: 800-1200 words
- Compelling, click-worthy title
- Strong introduction hook (first paragraph should grab attention)
- 3-4 main sections with clear subheadings
- Include key scripture references
- Practical action steps
- Conclusion with call to action
- Conversational yet professional tone

SEO BEST PRACTICES:
- Title should include main topic keywords
- Use subheadings (H2, H3 style)
- Include bullet points or numbered lists
- End with engagement prompt (question or challenge)

OUTPUT FORMAT (JSON):
{
  "title": "SEO-optimized blog title",
  "author": "Speaker name from sermon",
  "readTime": "X min read",
  "introduction": "Compelling opening paragraph...",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content with paragraphs..."
    }
  ],
  "keyScripture": {
    "text": "Main scripture quote",
    "reference": "Reference"
  },
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "weeklyChallenge": "Specific challenge...",
  "conclusion": "Closing thoughts and call to action"
}

Return ONLY valid JSON.

TRANSCRIPT:
${transcript.fullText}`;

                const responseText = await generateText(prompt, { task: "generate-blog-post" });
                await saveContent(sermonId, "blog_post", responseText);
            });
        }

        // Step 7: Generate outline
        if (generateOutline) {
            await step.run("generate-outline", async () => {
                const prompt = `You are a sermon analyst. Create a detailed, timestamped outline of this sermon.

STRUCTURE:
- Introduction (first 10-15% of sermon)
- Main Points (core message sections)
- Application/Closing (final section)

FOR EACH SECTION INCLUDE:
- Approximate time range (based on content flow)
- Section title
- 3-5 bullet points summarizing key ideas
- Key scripture reference if applicable

REQUIREMENTS:
- Identify natural breaks in the sermon flow
- Capture the logical progression of ideas
- Note illustrations or stories used
- Include all major scripture references

OUTPUT FORMAT (JSON):
{
  "title": "Sermon title",
  "speaker": "Speaker name",
  "sections": [
    {
      "timeRange": "0:00 - 5:00",
      "title": "Section title",
      "points": [
        "Key point 1",
        "Key point 2",
        "Key point 3"
      ],
      "keyScripture": "Scripture reference or null"
    }
  ]
}

Return ONLY valid JSON.

TRANSCRIPT:
${transcript.fullText}`;

                const responseText = await generateText(prompt, { task: "generate-outline" });
                await saveContent(sermonId, "sermon_outline", responseText);
            });
        }

        // Step 8: Generate summary
        if (generateSummary) {
            await step.run("generate-summary", async () => {
                const prompt = `You are a content summarizer. Create multiple summary formats for this sermon.

CREATE FOUR FORMATS:

1. PARAGRAPH SUMMARY (100-150 words)
   - Comprehensive overview
   - Main theme and key points
   - Practical application mentioned

2. BULLET POINTS (5-7 bullets)
   - Key takeaways
   - Memorable quotes
   - Action items

3. SOCIAL MEDIA CAPTION (Instagram/Facebook)
   - Hook in first line
   - 2-3 key points with emojis
   - Engagement question at end
   - Under 300 characters ideal

4. HASHTAGS (8-10 relevant hashtags)
   - Mix of sermon topic, faith general, and trending church hashtags
   - Include church-related hashtags

OUTPUT FORMAT (JSON):
{
  "paragraph": "Full paragraph summary...",
  "bullets": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "socialCaption": "Hook line with emoji\\n\\nKey points with emojis...\\n\\nEngagement question?",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
}

Return ONLY valid JSON.

TRANSCRIPT:
${transcript.fullText}`;

                const responseText = await generateText(prompt, { task: "generate-summary" });
                await saveContent(sermonId, "summary", responseText);
            });
        }

        // Step 8: Mark sermon as ready
        await step.run("update-sermon-status", async () => {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!convexUrl) return;

            await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "sermons:updateStatus",
                    args: {
                        sermonId,
                        status: "ready",
                    },
                    format: "json",
                }),
            });
        });

        return { success: true, sermonId };
    }
);

async function saveContent(sermonId: string, type: string, content: string) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return;

    // Clean markdown code blocks from AI response
    let cleanedContent = content;

    // Remove ```json ... ``` wrapper if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
        cleanedContent = jsonMatch[1].trim();
    }

    console.log(`Saving ${type} content (first 200 chars):`, cleanedContent.substring(0, 200));

    await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path: "generatedContent:create",
            args: {
                sermonId,
                type,
                content: cleanedContent,
                status: "ready",
            },
            format: "json",
        }),
    });
}

