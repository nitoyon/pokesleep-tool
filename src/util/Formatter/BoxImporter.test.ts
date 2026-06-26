import type { TFunction } from "i18next";
import { describe, expect, test } from "vitest";
import Nature from "../Nature";
import { PokemonBoxItem } from "../PokemonBox";
import PokemonIv, { type PokemonIvProps } from "../PokemonIv";
import SubSkill from "../SubSkill";
import SubSkillList from "../SubSkillList";
import { exportToCsvTsv } from "./BoxExporter";
import { detectFormat, importFromCsvTsv } from "./BoxImporter";

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

describe("importFromCsvTsv", () => {
	function makeMinimalCsv(overrides?: Partial<Record<string, string>>): string {
		const defaults: Record<string, string> = {
			nickname: "",
			pokemon: "Pikachu",
			level: "30",
			skillLevel: "1",
			ing1: "Fancy Apple",
			ing2: "Fancy Apple",
			ing3: "Fancy Apple",
			mainSkill: "Charge Strength S",
			nature: "Bashful",
			lv10: "",
			lv25: "",
			lv50: "",
			lv70: "",
			lv80: "",
			ribbon: "0",
			shiny: "0",
		};
		const d = { ...defaults, ...overrides };
		const header =
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80,Ribbon,Shiny";
		const row = [
			d.nickname,
			d.pokemon,
			d.level,
			d.skillLevel,
			d.ing1,
			d.ing2,
			d.ing3,
			d.mainSkill,
			d.nature,
			d.lv10,
			d.lv25,
			d.lv50,
			d.lv70,
			d.lv80,
			d.ribbon,
			d.shiny,
		].join(",");
		return `${header}\n${row}`;
	}

	test("import partial csv (case insensitive)", () => {
		const result = importFromCsvTsv("poKemon,leVel\nPikachu,49", "csv", t);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].iv.pokemonName).toBe("Pikachu");
		expect(result.items[0].iv.level).toBe(49);
	});

	test("basic import returns one item", () => {
		const result = importFromCsvTsv(makeMinimalCsv(), "csv", t);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].iv.pokemonName).toBe("Pikachu");
	});

	test("import preserves level", () => {
		const result = importFromCsvTsv(makeMinimalCsv({ level: "75" }), "csv", t);
		expect(result.items[0].iv.level).toBe(75);
	});

	test("import preserves skillLevel", () => {
		const result = importFromCsvTsv(
			makeMinimalCsv({ skillLevel: "3" }),
			"csv",
			t,
		);
		expect(result.items[0].iv.skillLevel).toBe(3);
	});

	test("import reconstructs ingredient from slot names (AAA)", () => {
		// Pikachu: ing=AAA
		const result = importFromCsvTsv(
			makeMinimalCsv({
				ing1: "Fancy Apple",
				ing2: "Fancy Apple",
				ing3: "Fancy Apple",
			}),
			"csv",
			t,
		);
		expect(result.items[0].iv.ingredient).toBe("AAA");
	});

	test("import reconstructs ingredient from slot names (ABB)", () => {
		// Pikachu: ing=ABB
		const result = importFromCsvTsv(
			makeMinimalCsv({
				pokemon: "Pikachu",
				ing1: "Fancy Apple",
				ing2: "Warming Ginger",
				ing3: "Warming Ginger",
				mainSkill: "Charge Strength M",
			}),
			"csv",
			t,
		);
		expect(result.items[0].iv.ingredient).toBe("ABB");
	});

	test("import preserves nature", () => {
		const result = importFromCsvTsv(
			makeMinimalCsv({ nature: "Adamant" }),
			"csv",
			t,
		);
		expect(result.items[0].iv.nature.name).toBe("Adamant");
	});

	test("import preserves subskills", () => {
		const result = importFromCsvTsv(
			makeMinimalCsv({ lv10: "Berry Finding S", lv25: "Helping Bonus" }),
			"csv",
			t,
		);
		expect(result.items[0].iv.subSkills.lv10?.name).toBe("Berry Finding S");
		expect(result.items[0].iv.subSkills.lv25?.name).toBe("Helping Bonus");
		expect(result.items[0].iv.subSkills.lv50).toBeNull();
	});

	test("import converts hours to ribbon", () => {
		const cases: [string, number][] = [
			["0", 0],
			["199", 0],
			["200", 1],
			["300", 1],
			["500", 2],
			["999", 2],
			["1000", 3],
			["1999", 3],
			["2000", 4],
			["9999", 4],
		];
		for (const [hours, expected] of cases) {
			const result = importFromCsvTsv(
				makeMinimalCsv({ ribbon: hours }),
				"csv",
				t,
			);
			expect(result.items[0].iv.ribbon, `hours=${hours}`).toBe(expected);
		}
	});

	test("import preserves shiny flag", () => {
		const result1 = importFromCsvTsv(makeMinimalCsv({ shiny: "1" }), "csv", t);
		expect(result1.items[0].iv.shiny).toBe(true);

		const result2 = importFromCsvTsv(makeMinimalCsv({ shiny: "0" }), "csv", t);
		expect(result2.items[0].iv.shiny).toBe(false);
	});

	test("import preserves nickname", () => {
		const result = importFromCsvTsv(
			makeMinimalCsv({ nickname: "MyPika" }),
			"csv",
			t,
		);
		expect(result.items[0].nickname).toBe("MyPika");
	});

	test("import skips row with unknown pokemon", () => {
		const result = importFromCsvTsv(
			makeMinimalCsv({ pokemon: "Fakemon" }),
			"csv",
			t,
		);
		expect(result.items).toHaveLength(0);
	});

	test("import clamps out-of-range level to 100", () => {
		const result = importFromCsvTsv(makeMinimalCsv({ level: "999" }), "csv", t);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].iv.level).toBe(100);
	});

	test("import skips row with invalid nature", () => {
		const result = importFromCsvTsv(
			makeMinimalCsv({ nature: "NotANature" }),
			"csv",
			t,
		);
		expect(result.items).toHaveLength(0);
	});

	test("import returns empty array for header-only input", () => {
		const result = importFromCsvTsv(
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80),Ribbon,Shiny",
			"csv",
			t,
		);
		expect(result.items).toHaveLength(0);
	});

	test("import handles CRLF line endings", () => {
		const csv = makeMinimalCsv().replace(/\n/g, "\r\n");
		const result = importFromCsvTsv(csv, "csv", t);
		expect(result.items).toHaveLength(1);
	});

	test("import handles quoted field with comma in CSV", () => {
		const header =
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80),Ribbon,Shiny";
		const row =
			'"Hello, World",Pikachu,30,1,Fancy Apple,Fancy Apple,Fancy Apple,Charge Strength S,Bashful,,,,,,0,0';
		const result = importFromCsvTsv(`${header}\n${row}`, "csv", t);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].nickname).toBe("Hello, World");
	});

	test("TSV import works", () => {
		const header =
			"Nickname\tPokémon\tLevel\tSkill Level\tIng 1\tIng 2\tIng 3\tMain Skill\tNature\tLv10)\tLv25)\tLv50)\tLv70\tLv80\tRibbon\tShiny";
		const row =
			"\tBulbasaur\t50\t2\tFancy Apple\tGreengrass Soybeans\tGreengrass Soybeans\tCharge Strength M\tAdamant\t\t\t\t\t\t1\t0";
		const result = importFromCsvTsv(`${header}\n${row}`, "tsv", t);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].iv.pokemonName).toBe("Bulbasaur");
		expect(result.items[0].iv.level).toBe(50);
	});

	test("roundtrip: export then import", () => {
		const originalItem = makeItem(
			{
				pokemonName: "Pikachu",
				level: 60,
				skillLevel: 3,
				ingredient: "ABB",
				nature: new Nature("Adamant"),
				subSkills: new SubSkillList({
					lv10: new SubSkill("Berry Finding S"),
					lv25: new SubSkill("Helping Bonus"),
				}),
				ribbon: 2,
				shiny: true,
			},
			"BigPikachu",
		);
		const csv = exportToCsvTsv([originalItem], t, "csv");
		const imported = importFromCsvTsv(csv, "csv", t);
		expect(imported.items).toHaveLength(1);
		const iv = imported.items[0].iv;
		expect(iv.pokemonName).toBe("Pikachu");
		expect(iv.level).toBe(60);
		expect(iv.skillLevel).toBe(3);
		expect(iv.ingredient).toBe("ABB");
		expect(iv.nature.name).toBe("Adamant");
		expect(iv.subSkills.lv10?.name).toBe("Berry Finding S");
		expect(iv.subSkills.lv25?.name).toBe("Helping Bonus");
		expect(iv.ribbon).toBe(2);
		expect(iv.shiny).toBe(true);
		expect(imported.items[0].nickname).toBe("BigPikachu");
	});

	test("import reconstructs mythIng for Mew", () => {
		const header =
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80,Ribbon,Shiny";
		const row =
			",Mew,30,1,Fancy Egg,Pure Oil,Greengrass Soybeans,Charge Strength M,Bashful,,,,,,0,0";
		const result = importFromCsvTsv(`${header}\n${row}`, "csv", t);
		expect(result.items).toHaveLength(1);
		const iv = result.items[0].iv;
		expect(iv.pokemonName).toBe("Mew");
		expect(iv.mythIng1).toBe("egg");
		expect(iv.mythIng2).toBe("oil");
		expect(iv.mythIng3).toBe("soy");
	});

	test("import preserves Mew versatileSkill", () => {
		const header =
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80,Ribbon,Shiny";
		const row =
			",Mew,30,1,Fancy Egg,Fiery Herb,Greengrass Soybeans,Ingredient Magnet S,Bashful,,,,,,0,0";
		const result = importFromCsvTsv(`${header}\n${row}`, "csv", t);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].iv.versatileSkill).toBe("Ingredient Magnet S");
	});

	test("roundtrip: Mew with mythIng and versatileSkill", () => {
		const originalItem = makeMewItem(
			{
				level: 50,
				skillLevel: 2,
				mythIng1: "leek",
				mythIng2: "oil",
				mythIng3: "tail",
				versatileSkill: "Ingredient Magnet S",
				nature: new Nature("Adamant"),
			},
			"MyMew",
		);
		const csv = exportToCsvTsv([originalItem], t, "csv");
		const imported = importFromCsvTsv(csv, "csv", t);
		expect(imported.items).toHaveLength(1);
		const iv = imported.items[0].iv;
		expect(iv.pokemonName).toBe("Mew");
		expect(iv.level).toBe(50);
		expect(iv.skillLevel).toBe(2);
		expect(iv.mythIng1).toBe("leek");
		expect(iv.mythIng2).toBe("oil");
		expect(iv.mythIng3).toBe("tail");
		expect(iv.versatileSkill).toBe("Ingredient Magnet S");
		expect(iv.nature.name).toBe("Adamant");
		expect(imported.items[0].nickname).toBe("MyMew");
	});

	describe("normalize tolerances", () => {
		test("pokemon name (case-insensitive)", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ pokemon: "pikachu" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.pokemonName).toBe("Pikachu");
		});

		test("pokemon name (space-insensitive)", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ pokemon: "Wooper(Paldea)" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.pokemonName).toBe("Wooper (Paldea)");
		});

		test("ingredient (case-insensitive)", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({
					ing1: "fancy apple",
					ing2: "fancy apple",
					ing3: "fancy apple",
				}),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.ingredient).toBe("AAA");
		});

		test("ingredient (space-insensitive)", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({
					ing1: "fancyapple",
					ing2: "fancyapple",
					ing3: "fancyapple",
				}),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.ingredient).toBe("AAA");
		});

		test("subskill", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ lv10: "berryfindings" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.subSkills.lv10?.name).toBe("Berry Finding S");
		});

		test("versatileSkill", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({
					pokemon: "Mew",
					ing1: "fancy egg",
					mainSkill: "ChargeStrengthM",
				}),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.mythIng1).toBe("egg");
			expect(result.items[0].iv.versatileSkill).toBe("Charge Strength M");
		});

		test("nature is case-insensitive", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ nature: "adamant" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.nature.name).toBe("Adamant");
		});
	});

	describe("extra columns are ignored", () => {
		test("extra column at the beginning does not affect import", () => {
			const header = "ExtraCol,Pokémon";
			const row = "ignored,Pikachu";
			const result = importFromCsvTsv(`${header}\n${row}`, "csv", t);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.pokemonName).toBe("Pikachu");
		});

		test("multiple extra columns do not affect import", () => {
			const header = "Extra1,Pokémon,Extra2,Extra3";
			const row = "x,Pikachu,z,z";
			const result = importFromCsvTsv(`${header}\n${row}`, "csv", t);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.pokemonName).toBe("Pikachu");
			expect(result.warnings).toHaveLength(0);
		});

		test("TSV: extra column does not affect import", () => {
			const header = "Nickname\tPokémon\tExtraCol";
			const row = "\tPikachu\tignored";
			const result = importFromCsvTsv(`${header}\n${row}`, "tsv", t);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].iv.pokemonName).toBe("Pikachu");
			expect(result.warnings).toHaveLength(0);
		});
	});

	describe("warnings", () => {
		test("unknown pokemon generates warning with pokemon field", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ pokemon: "Fakemon" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].row).toBe(2);
			expect(result.warnings[0].fields).toContain("pokemon");
		});

		test("invalid nature generates warning with nature field", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ nature: "NotANature" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toContain("nature");
		});

		test("unknown ing1 generates warning with ing1 field", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ ing1: "UnknownIng" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toContain("ing1");
		});

		test("multiple unknown ingredients combine in one warning entry", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ ing2: "UnknownIng2", ing3: "UnknownIng3" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toEqual(
				expect.arrayContaining(["ing2", "ing3"]),
			);
		});

		test("unknown subskill generates warning with lv field", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ lv10: "FakeSkill" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toContain("lv10");
		});

		test("multiple unknown subskills combine in one warning entry", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ lv25: "FakeSkill1", lv50: "FakeSkill2" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toEqual(
				expect.arrayContaining(["lv25", "lv50"]),
			);
		});

		test("Mew: unresolvable mainSkill generates warning", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({
					pokemon: "Mew",
					ing1: "Fancy Egg",
					mainSkill: "FakeSkill",
				}),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toContain("mainSkill");
		});

		test("Mew: mainSkill not in VersatileCandidates generates warning", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({
					pokemon: "Mew",
					ing1: "Fancy Egg",
					mainSkill: "Charge Strength S",
				}),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(0);
			expect(result.warnings).toHaveLength(1);
			expect(result.warnings[0].fields).toContain("mainSkill");
		});

		test("non-Mew: unresolvable mainSkill does not generate warning", () => {
			const result = importFromCsvTsv(
				makeMinimalCsv({ mainSkill: "FakeSkill" }),
				"csv",
				t,
			);
			expect(result.items).toHaveLength(1);
			expect(result.warnings).toHaveLength(0);
		});
	});
});

describe("detectFormat", () => {
	test("detects custom format (Base64-like IV string)", () => {
		expect(detectFormat("ABCDEFGHIJKL\nsome other line")).toBe("custom");
	});

	test("detects custom format with @nickname", () => {
		expect(detectFormat("ABCDEFGHIJKL@MyPika")).toBe("custom");
	});

	test("detects TSV when first line contains tab", () => {
		const tsv =
			"Nickname\tPokémon\tLevel\tSkill Level\tIng 1\tIng 2\tIng 3\tMain Skill\tNature\tLv10)\tLv25)\tLv50\tLv70\tLv80\tRibbon\tShiny";
		expect(detectFormat(tsv)).toBe("tsv");
	});

	test("detects CSV as fallback", () => {
		const csv =
			"Nickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80,Ribbon,Shiny";
		expect(detectFormat(csv)).toBe("csv");
	});

	test("skips blank lines before first content line", () => {
		const csv =
			"\n\nNickname,Pokémon,Level,Skill Level,Ing 1,Ing 2,Ing 3,Main Skill,Nature,Lv10,Lv25,Lv50,Lv70,Lv80,Ribbon,Shiny";
		expect(detectFormat(csv)).toBe("csv");
	});

	test("returns csv for empty string", () => {
		expect(detectFormat("")).toBe("csv");
	});
});
