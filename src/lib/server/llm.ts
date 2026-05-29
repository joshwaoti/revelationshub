import { GoogleGenerativeAI } from "@google/generative-ai";

type LlmProvider = "google" | "openrouter";

type GenerateTextOptions = {
    task?: string;
    preferredProvider?: LlmProvider;
};

type OpenRouterResponse = {
    choices?: Array<{
        message?: {
            content?: string | Array<{ type?: string; text?: string }>;
        };
        text?: string;
    }>;
    error?: {
        message?: string;
        code?: string | number;
    };
};

const DEFAULT_GOOGLE_MODEL = "gemini-2.0-flash";
const DEFAULT_OPENROUTER_MODELS = [
    "anthropic/claude-sonnet-4",
    "openai/gpt-4o-mini",
    "deepseek/deepseek-chat",
];

export async function generateText(prompt: string, options: GenerateTextOptions = {}) {
    const preferredProvider = options.preferredProvider ?? providerFromEnv();
    const providers: LlmProvider[] = preferredProvider === "openrouter"
        ? ["openrouter", "google"]
        : ["google", "openrouter"];

    const errors: string[] = [];

    for (const provider of providers) {
        try {
            if (provider === "google") {
                return await generateWithGoogle(prompt);
            }

            return await generateWithOpenRouter(prompt);
        } catch (error) {
            const message = formatLlmError(provider, error);
            errors.push(message);

            if (!shouldFallback(error)) {
                throw new Error(message);
            }

            console.warn(`[llm] ${provider} failed for ${options.task ?? "generation"}; trying fallback. ${message}`);
        }
    }

    throw new Error(`All LLM providers failed: ${errors.join(" | ")}`);
}

async function generateWithGoogle(prompt: string) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("Google Gemini API key not configured");
    }

    const modelName = process.env.GEMINI_MODEL || DEFAULT_GOOGLE_MODEL;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text?.trim()) {
        throw new Error(`Google model ${modelName} returned an empty response`);
    }

    return text;
}

async function generateWithOpenRouter(prompt: string) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY not configured");
    }

    const models = parseModelList(process.env.OPENROUTER_FALLBACK_MODELS);
    const errors: string[] = [];

    for (const model of models) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                    "X-Title": process.env.OPENROUTER_APP_NAME || "RevelationsHub",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: Number(process.env.LLM_TEMPERATURE ?? 0.4),
                }),
            });

            const payload = await response.json().catch(() => null) as OpenRouterResponse | null;

            if (!response.ok) {
                const message = payload?.error?.message || response.statusText || "OpenRouter request failed";
                const error = new Error(`OpenRouter model ${model} failed: ${message}`);
                Object.assign(error, { status: response.status });
                throw error;
            }

            const text = extractOpenRouterText(payload);
            if (!text?.trim()) {
                throw new Error(`OpenRouter model ${model} returned an empty response`);
            }

            return text;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(message);

            if (!shouldFallback(error)) {
                throw error;
            }

            console.warn(`[llm] OpenRouter model failed, trying next model. ${message}`);
        }
    }

    throw new Error(`All OpenRouter fallback models failed: ${errors.join(" | ")}`);
}

function extractOpenRouterText(payload: OpenRouterResponse | null) {
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map((item) => item.text)
            .filter(Boolean)
            .join("\n");
    }

    return payload?.choices?.[0]?.text ?? "";
}

function parseModelList(value?: string) {
    const models = value
        ?.split(",")
        .map((model) => model.trim())
        .filter(Boolean);

    return models && models.length > 0 ? models : DEFAULT_OPENROUTER_MODELS;
}

function providerFromEnv(): LlmProvider {
    return process.env.LLM_PRIMARY_PROVIDER === "openrouter" ? "openrouter" : "google";
}

function shouldFallback(error: unknown) {
    const status = getStatus(error);
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    return !status
        || status === 401
        || status === 403
        || status === 408
        || status === 409
        || status === 429
        || status >= 500
        || message.includes("quota")
        || message.includes("rate limit")
        || message.includes("too many requests")
        || message.includes("not configured")
        || message.includes("overloaded");
}

function getStatus(error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
        const status = Number((error as { status?: unknown }).status);
        return Number.isFinite(status) ? status : undefined;
    }

    return undefined;
}

function formatLlmError(provider: LlmProvider, error: unknown) {
    const status = getStatus(error);
    const message = error instanceof Error ? error.message : String(error);
    return `${provider}${status ? ` HTTP ${status}` : ""}: ${message}`;
}
