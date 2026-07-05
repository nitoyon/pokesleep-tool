import type { TFunction } from "i18next";
import { describe, expect, test } from "vitest";
import Nature from "../Nature";
import { PokemonBoxItem } from "../PokemonBox";
import PokemonIv, { type PokemonIvProps } from "../PokemonIv";
import SubSkill from "../SubSkill";
import SubSkillList from "../SubSkillList";
import { exportToCsvTsv } from "./BoxExporter";
import { CsvParser, type CsvRow } from "./CsvFormatter";
import { TsvParser, type TsvRow } from "./TsvFormatter";

// Minimal t() stub for English (keys map to English values directly)
const t = ((key: string, opts?: Record<string, unknown>): string => {
	if (key === "ing n") {
		return `Ing ${opts?.n}`;
	}
	const map: Record<string, string> = {
		nickname: "Nickname",
		pokemon: "Pokémon",
		level: "Level",
		"skill level": "Skill Level",
		"main skill": "Main Skill",
		ingredient: "Ingredient",
		nature: "Nature",
		shiny: "Shiny",
		"sleeping time shared": "Sleeping Time Shared",
		"subskill.Berry Finding S": "Berry Finding S",
		"subskill.Helping Bonus": "Helping Bonus",
		"ingredients.leek": "Large Leek",
		"ingredients.egg": "Fancy Egg",
		"ingredients.apple": "Fancy Apple",
		"ingredients.herb": "Fiery Herb",
		"ingredients.oil": "Pure Oil",
		"ingredients.ginger": "Warming Ginger",
		"ingredients.soy": "Greengrass Soybeans",
		"skills.Metronome.name": "Metronome",
		"skills.Charge Strength S.name": "Charge Strength S",
		"skills.Charge Strength M.name": "Charge Strength M",
		"skills.Ingredient Magnet S.name": "Ingredient Magnet S",
	};
	if (key in map) {
		return map[key];
	}

	// Fallback to key
	return key.replace(/^([^.]+\.)?/, "");
}) as TFunction;

function makeItem(
	overrides: Partial<PokemonIvProps>,
	nickname = "",
): PokemonBoxItem {
	const iv = new PokemonIv({
		ingredient: "AAA",
		nature: new Nature("Bashful"),
		...overrides,
	});
	return new PokemonBoxItem(iv, nickname);
}

function makeMewItem(
	overrides?: Partial<PokemonIvProps>,
	nickname = "",
): PokemonBoxItem {
	return makeItem(
		{
			pokemonName: "Mew",
			mythIng1: "egg",
			mythIng2: "herb",
			mythIng3: "soy",
			versatileSkill: "Charge Strength M",
			...overrides,
		},
		nickname,
	);
}

function parseCsvOutput(csv: string): { headers: string[]; rows: CsvRow[] } {
	const lines = csv.split("\n");
	const parser = new CsvParser(lines[0]);
	return {
		headers: parser.headers,
		rows: parser.parse(lines.slice(1).filter((l) => l !== "")),
	};
}

function parseTsvOutput(tsv: string): { headers: string[]; rows: TsvRow[] } {
	const lines = tsv.split("\n");
	const parser = new TsvParser(lines[0]);
	return {
		headers: parser.headers,
		rows: parser.parse(lines.slice(1).filter((l) => l !== "")),
	};
}

describe("exportToCsvTsv", () => {
	test("CSV header is correct", () => {
		const csv = exportToCsvTsv([], t, "csv");
		expect(csv).toBe(
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80,Sleeping Time Shared,Shiny",
		);
	});

	test("TSV header is correct", () => {
		const tsv = exportToCsvTsv([], t, "tsv");
		expect(tsv).toBe(
			"Nickname\tPokémon\tLevel\tSkill Level\tIng 1\tIng 2\tIng 3\tMain Skill\tNature\tLv10\tLv25\tLv50\tLv70\tLv80\tSleeping Time Shared\tShiny",
		);
	});

	test("CSV row with basic pokemon", () => {
		const item = makeItem({
			pokemonName: "Pikachu",
			ingredient: "ABB",
			level: 50,
			skillLevel: 2,
			subSkills: new SubSkillList({
				lv10: new SubSkill("Berry Finding S"),
				lv25: new SubSkill("Helping Bonus"),
			}),
			nature: new Nature("Adamant"),
		});
		const csv = exportToCsvTsv([item], t, "csv");
		const { rows } = parseCsvOutput(csv);
		expect(rows).toHaveLength(1);
		const row = rows[0];
		expect(row.get("Nickname"), "no nickname").toBe("");
		expect(row.get("Pokémon")).toBe("Pikachu");
		expect(row.get("Level")).toBe("50");
		expect(row.get("Skill Level")).toBe("2");
		expect(row.get("Lv10")).toBe("Berry Finding S");
		expect(row.get("Lv25")).toBe("Helping Bonus");
		expect(row.get("Lv50"), "lv50").toBe("");
		expect(row.get("Ing 1")).toBe("Fancy Apple");
		expect(row.get("Ing 2")).toBe("Warming Ginger");
		expect(row.get("Ing 3")).toBe("Warming Ginger");
		expect(row.get("Main Skill")).toBe("Charge Strength S");
		expect(row.get("Nature")).toBe("Adamant");
		expect(row.get("Sleeping Time Shared"), "ribbon").toBe("0");
		expect(row.get("Shiny"), "not shiny").toBe("0");
	});

	test("CSV row with nickname containing comma is quoted", () => {
		const item = makeItem({ pokemonName: "Pikachu" }, "Hello, World");
		const csv = exportToCsvTsv([item], t, "csv");
		const { rows } = parseCsvOutput(csv);
		expect(rows[0].get("Nickname")).toBe("Hello, World");
	});

	test("shiny flag exported as 1", () => {
		const item = makeItem({ pokemonName: "Pikachu", shiny: true });
		const csv = exportToCsvTsv([item], t, "csv");
		const { rows } = parseCsvOutput(csv);
		expect(rows[0].get("Shiny")).toBe("1");
	});

	test("ribbon exported as hours threshold", () => {
		const cases: [number, string][] = [
			[0, "0"],
			[1, "200"],
			[2, "500"],
			[3, "1000"],
			[4, "2000"],
		];
		for (const [ribbon, expected] of cases) {
			const item = makeItem({
				pokemonName: "Pikachu",
				ribbon: ribbon as 0 | 1 | 2 | 3 | 4,
			});
			const csv = exportToCsvTsv([item], t, "csv");
			const { rows } = parseCsvOutput(csv);
			expect(rows[0].get("Sleeping Time Shared"), `ribbon=${ribbon}`).toBe(
				expected,
			);
		}
	});

	test("TSV row uses tab separator", () => {
		const item = makeItem({ pokemonName: "Pikachu" });
		const tsv = exportToCsvTsv([item], t, "tsv");
		const { headers, rows } = parseTsvOutput(tsv);
		expect(headers).toHaveLength(16);
		expect(rows[0].get("Pokémon")).toBe("Pikachu");
	});

	test("multiple rows", () => {
		const items = [
			makeItem({ pokemonName: "Pikachu" }),
			makeItem({ pokemonName: "Mew" }),
		];
		const csv = exportToCsvTsv(items, t, "csv");
		const { rows } = parseCsvOutput(csv);
		expect(rows).toHaveLength(2);
	});

	test("Mew mythIng ingredients exported as-is", () => {
		const item = makeMewItem({
			mythIng1: "egg",
			mythIng2: "oil",
			mythIng3: "soy",
		});
		const csv = exportToCsvTsv([item], t, "csv");
		const { rows } = parseCsvOutput(csv);
		const row = rows[0];
		expect(row.get("Ing 1")).toBe("Fancy Egg");
		expect(row.get("Ing 2")).toBe("Pure Oil");
		expect(row.get("Ing 3")).toBe("Greengrass Soybeans");
	});

	test("Mew versatileSkill exported in main skill column", () => {
		const item = makeMewItem({ versatileSkill: "Charge Strength M" });
		const csv = exportToCsvTsv([item], t, "csv");
		const { rows } = parseCsvOutput(csv);
		expect(rows[0].get("Main Skill")).toBe("Charge Strength M");
	});
});
