"use client";

import { useState } from "react";
import { toast } from "sonner";

type ContentType =
    | "quotes"
    | "carousel"
    | "discussion_guide"
    | "devotional"
    | "blog_post"
    | "outline"
    | "summary";

export function useGenerateContent() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateContent = async (
        sermonId: string,
        contentTypes: ContentType[]
    ) => {
        setIsGenerating(true);

        try {
            const response = await fetch("/api/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sermonId,
                    contentTypes,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate content");
            }

            toast.success("Content generation started!", {
                description: "This may take a few moments. The page will update automatically.",
            });

            return data;
        } catch (error) {
            console.error("Generate content error:", error);
            toast.error("Failed to generate content", {
                description: error instanceof Error ? error.message : "Please try again",
            });
            throw error;
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAll = async (sermonId: string) => {
        return generateContent(sermonId, [
            "quotes",
            "carousel",
            "discussion_guide",
            "devotional",
            "blog_post",
            "outline",
            "summary",
        ]);
    };

    return {
        isGenerating,
        generateContent,
        generateAll,
    };
}
