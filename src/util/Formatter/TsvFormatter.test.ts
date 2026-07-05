import { describe, expect, test } from "vitest";
import { TsvParser, TsvRow } from "./TsvFormatter";

describe("TsvRow", () => {
	test("get returns value for matching column", () => {
		const row = new TsvRow(["Alice", "30"], ["name", "age"]);
		expect(row.get("name")).toBe("Alice");
		expect(row.get("age")).toBe("30");
	});

	test("get returns empty string for unknown column", () => {
		const row = new TsvRow(["Alice", "30"], ["name", "age"]);
		expect(row.get("email")).toBe("");
	});

	test("get returns empty string when index out of bounds", () => {
		const row = new TsvRow(["Alice"], ["name", "age"]);
		expect(row.get("age")).toBe("");
	});
});

describe("TsvParser", () => {
	test("headers are parsed from header line", () => {
		const parser = new TsvParser("Name\tLevel\tNature");
		expect(parser.headers).toEqual(["Name", "Level", "Nature"]);
	});

	test("parse returns array of TsvRow", () => {
		const parser = new TsvParser("Name\tLevel");
		const rows = parser.parse(["Pikachu\t50", "Bulbasaur\t30"]);
		expect(rows).toHaveLength(2);
		expect(rows[0].get("Name")).toBe("Pikachu");
		expect(rows[0].get("Level")).toBe("50");
		expect(rows[1].get("Name")).toBe("Bulbasaur");
		expect(rows[1].get("Level")).toBe("30");
	});

	test("parse returns empty array for empty lines input", () => {
		const parser = new TsvParser("Name\tLevel");
		expect(parser.parse([])).toEqual([]);
	});

	test("row.get returns empty string for column not in header", () => {
		const parser = new TsvParser("Name\tLevel");
		const rows = parser.parse(["Pikachu\t50"]);
		expect(rows[0].get("Nature")).toBe("");
	});

	test("row.get returns empty string when row is shorter than header", () => {
		const parser = new TsvParser("Name\tLevel\tNature");
		const rows = parser.parse(["Pikachu\t50"]);
		expect(rows[0].get("Name")).toBe("Pikachu");
		expect(rows[0].get("Level")).toBe("50");
		expect(rows[0].get("Nature")).toBe("");
	});

	test("parse handles multiple rows correctly", () => {
		const parser = new TsvParser("A\tB\tC");
		const rows = parser.parse(["1\t2\t3", "4\t5\t6"]);
		expect(rows[0].get("A")).toBe("1");
		expect(rows[0].get("C")).toBe("3");
		expect(rows[1].get("B")).toBe("5");
	});
});
