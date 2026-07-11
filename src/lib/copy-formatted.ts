// Copy content to the clipboard in two flavors at once:
// - text/html for rich targets (Apple Notes, Google Docs, email)
// - text/plain styled with WhatsApp markers (*bold*, _italic_) so chat
//   apps that only take plain text still paste with formatting intact.
export async function copyFormatted(html: string, plainText: string): Promise<boolean> {
    try {
        if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([plainText], { type: "text/plain" }),
                }),
            ]);
            return true;
        }
    } catch {
        // fall through to plain text
    }
    try {
        await navigator.clipboard.writeText(plainText);
        return true;
    } catch {
        return false;
    }
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
