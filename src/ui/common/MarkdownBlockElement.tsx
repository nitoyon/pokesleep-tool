import React from "react";
import MarkdownInlineElement from "./MarkdownInlineElement";

interface MarkdownBlockElementProps {
	/** markdown text to render */
	text: string;
}

/**
 * Renders a small subset of Markdown (paragraphs separated by blank lines,
 * `* ` bullet lists and `1. ` ordered lists) as React elements. Inline content
 * inside each `<p>` and `<li>` is rendered with {@link MarkdownInlineElement},
 * which handles `**bold**` emphasis and `[title](URL)` links.
 */
const MarkdownBlockElement = React.memo(
	({ text }: MarkdownBlockElementProps) => {
		const blocks = parseBlocks(text);
		return (
			<>
				{blocks.map((block, i) => {
					const key = `${i}:${block.type}`;
					if (block.type === "list") {
						return (
							<ul key={key}>
								{block.items.map((item) => (
									<li key={item}>
										<MarkdownInlineElement text={item} />
									</li>
								))}
							</ul>
						);
					}
					if (block.type === "orderedlist") {
						return (
							<ol key={key}>
								{block.items.map((item) => (
									<li key={item}>
										<MarkdownInlineElement text={item} />
									</li>
								))}
							</ol>
						);
					}
					return (
						<p key={key}>
							<MarkdownInlineElement text={block.text} />
						</p>
					);
				})}
			</>
		);
	},
);

/** A paragraph block, a bullet list block or an ordered list block. */
type Block =
	| { type: "paragraph"; text: string }
	| { type: "list"; items: string[] }
	| { type: "orderedlist"; items: string[] };

/**
 * Splits markdown text into paragraph blocks (separated by blank lines),
 * bullet list blocks (consecutive lines starting with "* ") and ordered list
 * blocks (consecutive lines starting with a number followed by ". ").
 */
function parseBlocks(text: string): Block[] {
	const blocks: Block[] = [];
	let paragraphLines: string[] = [];
	let listItems: string[] = [];
	let orderedListItems: string[] = [];

	const flushParagraph = () => {
		if (paragraphLines.length > 0) {
			blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
			paragraphLines = [];
		}
	};
	const flushList = () => {
		if (listItems.length > 0) {
			blocks.push({ type: "list", items: listItems });
			listItems = [];
		}
	};
	const flushOrderedList = () => {
		if (orderedListItems.length > 0) {
			blocks.push({ type: "orderedlist", items: orderedListItems });
			orderedListItems = [];
		}
	};

	for (const line of text.split("\n")) {
		if (line.startsWith("* ")) {
			flushParagraph();
			flushOrderedList();
			listItems.push(line.slice(2));
		} else if (/^\d+\.\s/.test(line)) {
			flushParagraph();
			flushList();
			orderedListItems.push(line.replace(/^\d+\.\s/, ""));
		} else if (line.trim() === "") {
			flushParagraph();
			flushList();
			flushOrderedList();
		} else {
			flushList();
			flushOrderedList();
			paragraphLines.push(line);
		}
	}
	flushParagraph();
	flushList();
	flushOrderedList();

	return blocks;
}

export default MarkdownBlockElement;
