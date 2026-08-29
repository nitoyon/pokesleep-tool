import React from "react";

interface MarkdownInlineElementProps {
	/** markdown text to render */
	text: string;
}

/**
 * Renders inline Markdown only: `**bold**` emphasis and `[title](URL)` links.
 * Link titles are parsed recursively so they may contain `**bold**`.
 * Returns a `<>...</>` fragment of nodes.
 */
const MarkdownInlineElement = React.memo(
	({ text }: MarkdownInlineElementProps) => {
		return <>{parseInline(text)}</>;
	},
);

/**
 * Parses `**bold**` emphasis and `[title](URL)` links within a single line
 * of text. Link titles are parsed recursively so they may contain `**bold**`.
 */
function parseInline(text: string): React.ReactNode[] {
	const nodes: React.ReactNode[] = [];
	const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
	while ((match = regex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}
		if (match[1] !== undefined) {
			nodes.push(<strong key={key++}>{match[1]}</strong>);
		} else {
			nodes.push(
				<a key={key++} href={match[3]} target="_blank" rel="noreferrer">
					{parseInline(match[2])}
				</a>,
			);
		}
		lastIndex = regex.lastIndex;
	}
	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

export default MarkdownInlineElement;
