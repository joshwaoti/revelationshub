import React from "react";

// Minimal markdown renderer for AI-generated copy: paragraphs, line breaks,
// bullet/numbered lists, **bold**, *italic* and _italic_. Everything stays
// JSX — no dangerouslySetInnerHTML, so model output can't inject markup.

const BULLET_RE = /^\s*[*•-]\s+(?=\S)/;
const ORDERED_RE = /^\s*\d+[.)]\s+(?=\S)/;

// Inline pass: bold first so a `**` opener is never half-eaten by italic.
export function renderInlineMarkdown(text: string, keyPrefix = "md"): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const pattern = /(\*\*([^\s*](?:[^*]*[^\s*])?)\*\*|\*([^\s*](?:[^*\n]*[^\s*])?)\*|(?<![A-Za-z0-9])_([^\s_](?:[^_\n]*[^\s_])?)_(?![A-Za-z0-9]))/g;
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

type Block =
    | { kind: "paragraph"; lines: string[] }
    | { kind: "list"; ordered: boolean; items: string[] };

function parseBlocks(text: string): Block[] {
    const blocks: Block[] = [];
    for (const chunk of text.split(/\n{2,}/)) {
        const lines = chunk.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length === 0) continue;

        let current: Block | null = null;
        for (const line of lines) {
            const isBullet = BULLET_RE.test(line);
            const isOrdered = !isBullet && ORDERED_RE.test(line);
            if (isBullet || isOrdered) {
                const item = line.replace(isBullet ? BULLET_RE : ORDERED_RE, "").trim();
                if (current?.kind === "list" && current.ordered === isOrdered) {
                    current.items.push(item);
                } else {
                    current = { kind: "list", ordered: isOrdered, items: [item] };
                    blocks.push(current);
                }
            } else if (current?.kind === "paragraph") {
                current.lines.push(line);
            } else {
                current = { kind: "paragraph", lines: [line] };
                blocks.push(current);
            }
        }
    }
    return blocks;
}

interface MarkdownTextProps {
    text: string;
    className?: string;
    listClassName?: string;
}

export function MarkdownText({ text, className, listClassName }: MarkdownTextProps) {
    const blocks = parseBlocks(text);
    return (
        <>
            {blocks.map((block, bi) => {
                if (block.kind === "list") {
                    const Tag = block.ordered ? "ol" : "ul";
                    return (
                        <Tag
                            key={bi}
                            className={
                                listClassName ??
                                `${block.ordered ? "list-decimal" : "list-disc"} list-outside pl-5 space-y-2 mb-4 last:mb-0 ${className ?? ""}`
                            }
                        >
                            {block.items.map((item, li) => (
                                <li key={li}>{renderInlineMarkdown(item, `${bi}-${li}`)}</li>
                            ))}
                        </Tag>
                    );
                }
                return (
                    <p key={bi} className={className}>
                        {block.lines.map((line, li) => (
                            <React.Fragment key={li}>
                                {renderInlineMarkdown(line, `${bi}-${li}`)}
                                {li < block.lines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </>
    );
}
