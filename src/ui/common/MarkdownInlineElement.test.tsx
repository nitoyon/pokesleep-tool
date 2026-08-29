import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownInlineElement from "./MarkdownInlineElement";

describe("MarkdownInlineElement", () => {
	it("renders plain text as-is", () => {
		const { container } = render(<MarkdownInlineElement text="Hello world" />);
		expect(container.textContent).toBe("Hello world");
		expect(container.querySelector("strong")).toBeNull();
		expect(container.querySelector("a")).toBeNull();
	});

	it("renders bold text", () => {
		const { container } = render(
			<MarkdownInlineElement text="This is **bold** text" />,
		);
		const strong = container.querySelector("strong");
		expect(strong).not.toBeNull();
		expect(strong?.textContent).toBe("bold");
	});

	it("renders a link with href, target and rel", () => {
		const { container } = render(
			<MarkdownInlineElement text="See [the docs](https://example.com/docs) here" />,
		);
		const link = container.querySelector("a");
		expect(link).not.toBeNull();
		expect(link?.textContent).toBe("the docs");
		expect(link?.getAttribute("href")).toBe("https://example.com/docs");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("rel")).toBe("noreferrer");
	});

	it("renders multiple links", () => {
		const { container } = render(
			<MarkdownInlineElement text="Test [link1](https://example.com/1) and [link2](https://example.com/2) " />,
		);
		const links = container.querySelectorAll("a");
		expect(links).toHaveLength(2);
	});

	it("renders bold text inside a link title", () => {
		const { container } = render(
			<MarkdownInlineElement text="[go **now**](https://example.com)" />,
		);
		const strong = container.querySelector("a strong");
		expect(strong).not.toBeNull();
		expect(strong?.textContent).toBe("now");
	});
});
