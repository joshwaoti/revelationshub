// Client-side print/PDF export: renders content into a clean printable
// window and opens the browser print dialog (where "Save as PDF" lives).
// No PDF library needed and the output respects page breaks.

export interface PrintSection {
    heading?: string;
    body?: string;
    quote?: { text: string; cite?: string };
    list?: string[];
    ordered?: boolean;
}

export interface PrintDocument {
    title: string;
    subtitle?: string;
    footer?: string;
    sections: PrintSection[];
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function sectionHtml(section: PrintSection): string {
    const parts: string[] = ['<section>'];
    if (section.heading) {
        parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    }
    if (section.body) {
        parts.push(
            section.body
                .split(/\n{2,}/)
                .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
                .join("")
        );
    }
    if (section.quote) {
        parts.push(
            `<blockquote><p>&ldquo;${escapeHtml(section.quote.text)}&rdquo;</p>` +
            (section.quote.cite ? `<cite>&mdash; ${escapeHtml(section.quote.cite)}</cite>` : "") +
            `</blockquote>`
        );
    }
    if (section.list && section.list.length > 0) {
        const tag = section.ordered ? "ol" : "ul";
        parts.push(
            `<${tag}>` +
            section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("") +
            `</${tag}>`
        );
    }
    parts.push("</section>");
    return parts.join("\n");
}

/**
 * Open a print-ready window with the given document and trigger the print
 * dialog. Returns false if the popup was blocked (caller should tell the
 * user to allow popups).
 */
export function openPrintWindow(doc: PrintDocument): boolean {
    const win = window.open("", "_blank", "width=800,height=1000");
    if (!win) return false;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(doc.title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1c1917;
    max-width: 640px;
    margin: 0 auto;
    padding: 48px 32px;
    line-height: 1.6;
  }
  header { text-align: center; border-bottom: 2px solid #1c1917; padding-bottom: 20px; margin-bottom: 28px; }
  h1 { font-size: 26px; margin: 0 0 6px; letter-spacing: -0.01em; }
  .subtitle { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #78716c; margin: 0; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; margin: 26px 0 8px; color: #44403c; page-break-after: avoid; }
  p { margin: 0 0 10px; font-size: 14px; }
  blockquote { margin: 12px 0; padding: 10px 18px; border-left: 3px solid #a8a29e; font-style: italic; page-break-inside: avoid; }
  blockquote cite { display: block; margin-top: 6px; font-size: 12px; font-style: normal; color: #78716c; }
  ul, ol { margin: 6px 0 12px; padding-left: 22px; }
  li { font-size: 14px; margin-bottom: 8px; page-break-inside: avoid; }
  section { page-break-inside: avoid; }
  footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #d6d3d1; text-align: center; font-size: 11px; color: #a8a29e; }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(doc.title)}</h1>
    ${doc.subtitle ? `<p class="subtitle">${escapeHtml(doc.subtitle)}</p>` : ""}
  </header>
  ${doc.sections.map(sectionHtml).join("\n")}
  <footer>${escapeHtml(doc.footer ?? "Created with RevelationsHub")}</footer>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 150);
    });
  </script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
    return true;
}

/**
 * Share plain text via the Web Share API, falling back to the clipboard.
 * Returns "shared", "copied", or "failed" so callers can toast accordingly.
 */
export async function shareText(title: string, text: string): Promise<"shared" | "copied" | "failed"> {
    try {
        if (navigator.share) {
            await navigator.share({ title, text });
            return "shared";
        }
    } catch (error) {
        // AbortError = user closed the share sheet; treat as handled
        if (error instanceof DOMException && error.name === "AbortError") return "shared";
        // fall through to clipboard
    }

    try {
        await navigator.clipboard.writeText(text);
        return "copied";
    } catch {
        return "failed";
    }
}
