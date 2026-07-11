import React from "react";

// Minimal inline-markdown renderer for AI-generated copy: paragraphs,
// line breaks, **bold**, *italic* and _italic_. Everything stays JSX —
// no dangerouslySetInnerHTML, so model output can't inject markup.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const pattern = /(\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) nodes.push(text.slice(last, match.index));
        if (match[2] !== undefined) {
            nodes.push(<strong key={`${keyPrefix}-b${i}`}>{match[2]}</strong>);
        } else {
            nodes.push(<em key={`${keyPrefix}-i${i}`}>{match[3] ?? match[4]}</em>);
        }
        last = match.index + match[0].length;
        i++;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
}

interface MarkdownTextProps {
    text: string;
    className?: string;
}

export function MarkdownText({ text, className }: MarkdownTextProps) {
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
    return (
        <>
            {paragraphs.map((paragraph, pi) => (
                <p key={pi} className={className}>
                    {paragraph.split("\n").map((line, li, lines) => (
                        <React.Fragment key={li}>
                            {renderInline(line, `${pi}-${li}`)}
                            {li < lines.length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </p>
            ))}
        </>
    );
}
