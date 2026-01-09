/**
 * Parses AI-generated content that may contain JSON wrapped in markdown code blocks
 */
export function parseAIContent<T = unknown>(content: string): T | null {
    if (!content) return null;

    try {
        // First try direct JSON parse
        return JSON.parse(content) as T;
    } catch {
        // Try to extract JSON from markdown code blocks
        try {
            // Match ```json ... ``` or ``` ... ```
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1].trim()) as T;
            }

            // Try to find JSON object or array directly
            const objectMatch = content.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                return JSON.parse(objectMatch[0]) as T;
            }

            const arrayMatch = content.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                return JSON.parse(arrayMatch[0]) as T;
            }
        } catch {
            console.error("Failed to parse AI content:", content.substring(0, 200));
        }

        return null;
    }
}
