import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownBlockElement from "./MarkdownBlockElement";

describe("MarkdownBlockElement", () => {
	it("renders a plain paragraph", () => {
		const { container } = render(<MarkdownBlockElement text="Hello world" />);
		const paragraphs = container.querySelectorAll("p");
		expect(paragraphs).toHaveLength(1);
		expect(paragraphs[0].textContent).toBe("Hello world");
	});

	it("renders multiple paragraphs separated by blank lines", () => {
		const { container } = render(
			<MarkdownBlockElement text={"First paragraph\n\nSecond paragraph"} />,
		);
		const paragraphs = container.querySelectorAll("p");
		expect(paragraphs).toHaveLength(2);
		expect(paragraphs[0].textContent).toBe("First paragraph");
		expect(paragraphs[1].textContent).toBe("Second paragraph");
	});

	it("renders a bullet list", () => {
		const { container } = render(
			<MarkdownBlockElement text={"* item one\n* item two"} />,
		);
		const list = container.querySelector("ul");
		expect(list).not.toBeNull();
		const items = container.querySelectorAll("li");
		expect(items).toHaveLength(2);
		expect(items[0].textContent).toBe("item one");
		expect(items[1].textContent).toBe("item two");
	});

	it("renders an ordered list", () => {
		const { container } = render(
			<MarkdownBlockElement text={"1. item one\n2. item two"} />,
		);
		const list = container.querySelector("ol");
		expect(list).not.toBeNull();
		const items = container.querySelectorAll("li");
		expect(items).toHaveLength(2);
		expect(items[0].textContent).toBe("item one");
		expect(items[1].textContent).toBe("item two");
	});

	it("renders paragraph and ordered list", () => {
		const { container } = render(
			<MarkdownBlockElement text={"p1\n1. item1\np2"} />,
		);
		expect(container.childNodes).toHaveLength(3);
		const [p1, list, p2] = Array.from(container.childNodes) as HTMLElement[];
		expect(p1.tagName).toBe("P");
		expect(p1.textContent).toBe("p1");
		expect(list.tagName).toBe("OL");
		expect(list.textContent).toBe("item1");
		expect(p2.tagName).toBe("P");
		expect(p2.textContent).toBe("p2");
	});

	it("renders bold text inside a paragraph", () => {
		const { container } = render(
			<MarkdownBlockElement text="This is **bold** text" />,
		);
		const strong = container.querySelector("p strong");
		expect(strong).not.toBeNull();
		expect(strong?.textContent).toBe("bold");
	});

	it("renders bold text inside a list item", () => {
		const { container } = render(
			<MarkdownBlockElement text="* item with **bold** text" />,
		);
		const strong = container.querySelector("li strong");
		expect(strong).not.toBeNull();
		expect(strong?.textContent).toBe("bold");
	});

	it("renders a link inside a paragraph", () => {
		const { container } = render(
			<MarkdownBlockElement text="See [the docs](https://example.com/docs) here" />,
		);
		const link = container.querySelector("p a");
		expect(link).not.toBeNull();
		expect(link?.textContent).toBe("the docs");
		expect(link?.getAttribute("href")).toBe("https://example.com/docs");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("rel")).toBe("noreferrer");
	});

	it("renders a link inside a list item", () => {
		const { container } = render(
			<MarkdownBlockElement text="* item with [a link](https://example.com)" />,
		);
		const link = container.querySelector("li a");
		expect(link).not.toBeNull();
		expect(link?.textContent).toBe("a link");
		expect(link?.getAttribute("href")).toBe("https://example.com");
	});

	it("renders paragraph and list", () => {
		const { container } = render(
			<MarkdownBlockElement text={"p1\n* item1\np2"} />,
		);
		expect(container.childNodes).toHaveLength(3);
		const [p1, list, p2] = Array.from(container.childNodes) as HTMLElement[];
		expect(p1.tagName).toBe("P");
		expect(p1.textContent).toBe("p1");
		expect(list.tagName).toBe("UL");
		expect(list.textContent).toBe("item1");
		expect(p2.tagName).toBe("P");
		expect(p2.textContent).toBe("p2");
	});
});
