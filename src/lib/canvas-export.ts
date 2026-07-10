// Shared helpers for client-side social-image export (carousel slides,
// quote graphics). Everything renders on a plain <canvas> - no deps.

/** Word-wrap text to fit maxWidth at the current ctx font. */
export function wrapCanvasText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): string[] {
    const lines: string[] = [];
    for (const rawLine of text.split("\n")) {
        const words = rawLine.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            lines.push("");
            continue;
        }
        let line = "";
        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (ctx.measureText(candidate).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        }
        if (line) lines.push(line);
    }
    return lines;
}

/** Draw an image cover-fit into a square canvas region. */
export function drawCoverImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    size: number
) {
    const scale = Math.max(size / image.width, size / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
}

/** Dark gradient overlay that keeps text readable over user photos. */
export function drawLegibilityOverlay(ctx: CanvasRenderingContext2D, size: number) {
    const overlay = ctx.createLinearGradient(0, 0, 0, size);
    overlay.addColorStop(0, "rgba(8, 10, 20, 0.45)");
    overlay.addColorStop(0.55, "rgba(8, 10, 20, 0.62)");
    overlay.addColorStop(1, "rgba(8, 10, 20, 0.8)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, size, size);
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/** Load a File into an HTMLImageElement (data URL based). */
export function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; dataUrl: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const image = new Image();
            image.onload = () => resolve({ image, dataUrl });
            image.onerror = () => reject(new Error("Failed to load image"));
            image.src = dataUrl;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Share a PNG blob via the Web Share API (with file support) when
 * available. Returns "shared" | "unsupported" | "failed".
 */
export async function shareImageBlob(
    blob: Blob,
    filename: string,
    title: string
): Promise<"shared" | "unsupported" | "failed"> {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title });
            return "shared";
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return "shared";
            return "failed";
        }
    }
    return "unsupported";
}
