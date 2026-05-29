type ConvexHttpResult<T> = {
    value?: T;
    status?: "success" | "error";
    errorMessage?: string;
};

async function callConvexHttp<T>(
    endpoint: "query" | "mutation",
    path: string,
    args: Record<string, unknown>
): Promise<T> {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
        throw new Error("Convex URL not configured");
    }

    const response = await fetch(`${convexUrl}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path,
            args,
            format: "json",
        }),
    });

    if (!response.ok) {
        throw new Error(`Convex ${endpoint} failed for ${path}`);
    }

    const result = (await response.json()) as ConvexHttpResult<T> | T;
    if (
        result &&
        typeof result === "object" &&
        "status" in result &&
        result.status === "error"
    ) {
        throw new Error(result.errorMessage || `Convex ${endpoint} failed for ${path}`);
    }

    return (result && typeof result === "object" && "value" in result
        ? result.value
        : result) as T;
}

export async function convexQuery<T>(path: string, args: Record<string, unknown>) {
    return callConvexHttp<T>("query", path, args);
}
