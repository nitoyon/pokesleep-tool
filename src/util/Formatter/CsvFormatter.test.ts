import { describe, expect, test } from "vitest";
import { CsvParser, CsvRow, escapeCsvField, parseCsvRow } from "./CsvFormatter";

describe("escapeCsvField", () => {
	test("plain string is returned as-is", () => {
		expect(escapeCsvField("hello")).toBe("hello");
	});

	test("field with comma is quoted", () => {
		expect(escapeCsvField("hello, world")).toBe('"hello, world"');
	});

	test("field with double-quote is quoted and escaped", () => {
		expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
	});

	test("field with newline is quoted", () => {
		expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
	});

	test("empty string is returned as-is", () => {
		expect(escapeCsvField("")).toBe("");
	});
});

describe("parseCsvRow", () => {
	test("splits simple comma-separated fields", () => {
		expect(parseCsvRow("a,b,c")).toEqual(["a", "b", "c"]);
	});

	test("handles quoted field containing comma", () => {
		expect(parseCsvRow('"hello, world",b')).toEqual(["hello, world", "b"]);
	});

	test("handles escaped double-quote inside quoted field", () => {
		expect(parseCsvRow('"say ""hi""",b')).toEqual(['say "hi"', "b"]);
	});

	test("handles empty fields", () => {
		expect(parseCsvRow("a,,c")).toEqual(["a", "", "c"]);
	});

	test("handles leading empty field", () => {
		expect(parseCsvRow(",b,c")).toEqual(["", "b", "c"]);
	});

	test("handles single field", () => {
		expect(parseCsvRow("only")).toEqual(["only"]);
	});

	test("handles empty quoted field", () => {
		expect(parseCsvRow('"",b')).toEqual(["", "b"]);
	});
});

describe("CsvRow", () => {
	test("get returns value for matching column", () => {
		const row = new CsvRow(["Alice", "30"], ["name", "age"]);
		expect(row.get("name")).toBe("Alice");
		expect(row.get("age")).toBe("30");
	});

	test("get returns empty string for unknown column", () => {
		const row = new CsvRow(["Alice", "30"], ["name", "age"]);
		expect(row.get("email")).toBe("");
	});

	test("get returns empty string when index out of bounds", () => {
		const row = new CsvRow(["Alice"], ["name", "age"]);
		expect(row.get("age")).toBe("");
	});
});

describe("CsvParser", () => {
	test("headers are parsed from header line", () => {
		const parser = new CsvParser("Name,Level,Nature");
		expect(parser.headers).toEqual(["Name", "Level", "Nature"]);
	});

	test("headers handle quoted fields", () => {
		const parser = new CsvParser('"Hello, World",Level');
		expect(parser.headers).toEqual(["Hello, World", "Level"]);
	});

	test("parse returns array of CsvRow", () => {
		const parser = new CsvParser("Name,Level");
		const rows = parser.parse(["Pikachu,50", "Bulbasaur,30"]);
		expect(rows).toHaveLength(2);
		expect(rows[0].get("Name")).toBe("Pikachu");
		expect(rows[0].get("Level")).toBe("50");
		expect(rows[1].get("Name")).toBe("Bulbasaur");
		expect(rows[1].get("Level")).toBe("30");
	});

	test("parse returns empty array for empty lines input", () => {
		const parser = new CsvParser("Name,Level");
		expect(parser.parse([])).toEqual([]);
	});

	test("row.get returns empty string for column not in header", () => {
		const parser = new CsvParser("Name,Level");
		const rows = parser.parse(["Pikachu,50"]);
		expect(rows[0].get("Nature")).toBe("");
	});

	test("row.get handles quoted values in data rows", () => {
		const parser = new CsvParser("Nickname,Pokemon");
		const rows = parser.parse(['"Hello, World",Pikachu']);
		expect(rows[0].get("Nickname")).toBe("Hello, World");
		expect(rows[0].get("Pokemon")).toBe("Pikachu");
	});
});
