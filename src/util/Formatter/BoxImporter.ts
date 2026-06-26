import type { TFunction } from "i18next";
import pokemons, {
	type IngredientName,
	IngredientNames,
} from "../../data/pokemons";
import { type MainSkillName, VersatileCandidates } from "../MainSkill";
import Nature from "../Nature";
import PokemonIv, { type PokemonIvProps } from "../PokemonIv";
import { type IngredientType, IngredientTypes } from "../PokemonRp";
import SubSkill, { type SubSkillType } from "../SubSkill";
import SubSkillList from "../SubSkillList";
import { CsvParser } from "./CsvFormatter";
import {
	DEFAULT_FIELD_ORDER,
	type FieldName,
	HEADER_ALIASES,
	normalizeHeader,
} from "./FieldMap";
import { TsvParser } from "./TsvFormatter";

export type BoxImportFormat = "custom" | "csv" | "tsv";

export type ImportWarning = { row: number; fields: FieldName[] };

export type CsvTsvImportResult = {
	items: Array<{ iv: PokemonIv; nickname: string }>;
	warnings: ImportWarning[];
};

type CsvTsvFormat = "csv" | "tsv";

type RowReader = { get(col: string): string };
type FieldGetter = (row: RowReader, field: FieldName) => string;

type ReverseMaps = {
	pokemon: Map<string, string>;
	nature: Map<string, string>;
	subSkill: Map<string, string>;
	versatileSkill: Map<string, MainSkillName>;
	ingredient: Map<string, IngredientName>;
};

function normalizeKey(s: string): string {
	return s.toLowerCase().replace(/\s/g, "");
}

/**
 * Import box items from CSV or TSV.
 * @param text Text to be imported.
 * @param format Import format ("tsv" or "csv").
 * @param t i18n formatter.
 * @returns Imported box items.
 */
export function importFromCsvTsv(
	text: string,
	format: CsvTsvFormat,
	t: TFunction,
): CsvTsvImportResult {
	const lines = text
		.replace(/\r/g, "")
		.split("\n")
		.filter((l) => l.trim() !== "");

	if (lines.length < 2) {
		return { items: [], warnings: [] };
	}

	const headerLine = lines[0];
	const dataLines = lines.slice(1);

	const parser =
		format === "csv" ? new CsvParser(headerLine) : new TsvParser(headerLine);

	const { fieldToColumn, hasHeader } = buildFieldColumnMap(parser.headers, t);

	// Helper: get a field value from a row, with positional fallback
	const getField = (
		row: { get(col: string): string },
		field: FieldName,
	): string => {
		if (fieldToColumn.has(field)) {
			return row.get(fieldToColumn.get(field) as string);
		}
		if (hasHeader) {
			return "";
		}
		// Positional fallback: use DEFAULT_FIELD_ORDER index against raw headers
		const defaultIdx = DEFAULT_FIELD_ORDER.indexOf(field);
		if (defaultIdx >= 0 && defaultIdx < parser.headers.length) {
			return row.get(parser.headers[defaultIdx]);
		}
		return "";
	};

	const rows = parser.parse(dataLines);

	const maps = initializeReverseMap(t);

	const items: Array<{ iv: PokemonIv; nickname: string }> = [];
	const warnings: ImportWarning[] = [];

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const rowNumber = i + 2; // header is row 1, data rows start at 2

		// Empty pokemon field → skip silently (blank row)
		const pokemonRaw = getField(row, "pokemon").trim();
		if (!pokemonRaw) continue;

		try {
			const result = parseBoxRow(row, getField, maps);
			if (result.kind === "ok") {
				items.push({ iv: result.iv, nickname: result.nickname });
			} else {
				warnings.push({ row: rowNumber, fields: result.fields });
			}
		} catch {
			warnings.push({ row: rowNumber, fields: [] });
		}
	}

	return { items, warnings };
}

export function detectFormat(text: string): BoxImportFormat {
	const firstLine =
		text
			.replace(/\r/g, "")
			.split("\n")
			.find((l) => l.trim() !== "") ?? "";
	// Custom format: Base64-encoded IV (12–16 chars from [A-Za-z0-9+\-]) optionally followed by @nickname
	if (/^[A-Za-z0-9+-]{12,16}(@|$)/.test(firstLine)) {
		return "custom";
	}
	if (firstLine.includes("\t")) {
		return "tsv";
	}
	return "csv";
}

type ParseRowResult =
	| { kind: "ok"; iv: PokemonIv; nickname: string }
	| { kind: "error"; fields: FieldName[] };

function parseBoxRow(
	row: RowReader,
	getField: FieldGetter,
	maps: ReverseMaps,
): ParseRowResult {
	const props: Partial<PokemonIvProps> = {};
	const nickname = getField(row, "nickname").trim();

	// Pokemon
	props.pokemonName = maps.pokemon.get(
		normalizeKey(getField(row, "pokemon").trim()),
	);
	if (!props.pokemonName) {
		return { kind: "error", fields: ["pokemon"] };
	}
	const pokemon = pokemons.find((p) => p.name === props.pokemonName);
	if (!pokemon) {
		return { kind: "error", fields: ["pokemon"] };
	}

	// Level
	const level = parseInt(getField(row, "level").trim(), 10);
	if (!Number.isNaN(level)) {
		props.level = level;
	}

	// Skill level
	const skillLevel = parseInt(getField(row, "skillLevel").trim(), 10);
	if (!Number.isNaN(skillLevel)) {
		props.skillLevel = skillLevel;
	}

	// Ingredient
	const ing1Raw = getField(row, "ing1").trim();
	const ing2Raw = getField(row, "ing2").trim();
	const ing3Raw = getField(row, "ing3").trim();
	const ing1Name = ing1Raw
		? maps.ingredient.get(normalizeKey(ing1Raw))
		: undefined;
	const ing2Name = ing2Raw
		? maps.ingredient.get(normalizeKey(ing2Raw))
		: undefined;
	const ing3Name = ing3Raw
		? maps.ingredient.get(normalizeKey(ing3Raw))
		: undefined;
	const ingWarningFields: FieldName[] = [];
	if (ing1Raw && !ing1Name) ingWarningFields.push("ing1");
	if (ing2Raw && !ing2Name) ingWarningFields.push("ing2");
	if (ing3Raw && !ing3Name) ingWarningFields.push("ing3");
	if (ingWarningFields.length > 0) {
		return { kind: "error", fields: ingWarningFields };
	}
	if (pokemon.mythIng !== undefined) {
		props.mythIng1 = ing1Name;
		props.mythIng2 = ing2Name;
		props.mythIng3 = ing3Name;
	} else {
		const slot2 = ing2Name === pokemon.ing1.name ? "A" : "B";
		let slot3: string;
		if (ing3Name === pokemon.ing1.name) {
			slot3 = "A";
		} else if (ing3Name === pokemon.ing2.name) {
			slot3 = "B";
		} else if (pokemon.ing3 !== undefined && ing3Name === pokemon.ing3.name) {
			slot3 = "C";
		} else {
			slot3 = "A";
		}
		const ingredient = `A${slot2}${slot3}` as IngredientType;
		props.ingredient = IngredientTypes.includes(ingredient)
			? ingredient
			: "AAA";
	}

	// Versatile skill
	const mainSkillRaw = getField(row, "mainSkill").trim();
	if (mainSkillRaw && pokemon.mythIng !== undefined) {
		const versatile = maps.versatileSkill.get(normalizeKey(mainSkillRaw));
		if (!versatile) {
			return { kind: "error", fields: ["mainSkill"] };
		}
		props.versatileSkill = versatile;
	}

	// Nature
	const natureRaw = getField(row, "nature").trim();
	const natureName =
		maps.nature.get(normalizeKey(natureRaw)) ??
		(natureRaw === "" ? "Bashful" : undefined);
	if (!natureName) {
		return { kind: "error", fields: ["nature"] };
	}
	props.nature = new Nature(natureName);

	// SubSkill
	const subSkillWarnings: FieldName[] = [];
	const resolveSubSkill = (str: string, field: FieldName): SubSkill | null => {
		const name = str.trim();
		if (name === "") {
			return null;
		}
		const internalName = maps.subSkill.get(normalizeKey(name));
		if (!internalName) {
			subSkillWarnings.push(field);
			return null;
		}
		try {
			return new SubSkill(internalName as SubSkillType);
		} catch {
			subSkillWarnings.push(field);
			return null;
		}
	};

	props.subSkills = new SubSkillList({
		lv10: resolveSubSkill(getField(row, "lv10"), "lv10"),
		lv25: resolveSubSkill(getField(row, "lv25"), "lv25"),
		lv50: resolveSubSkill(getField(row, "lv50"), "lv50"),
		lv70: resolveSubSkill(getField(row, "lv70"), "lv70"),
		lv80: resolveSubSkill(getField(row, "lv80"), "lv80"),
	});
	if (subSkillWarnings.length > 0) {
		return { kind: "error", fields: subSkillWarnings };
	}

	// Ribbon
	const ribbonHours = parseInt(getField(row, "ribbon").trim(), 10);
	if (!Number.isNaN(ribbonHours) && ribbonHours >= 0) {
		props.ribbon = hoursToRibbon(ribbonHours);
	}

	// Shiny
	const shinyStr = getField(row, "shiny").trim();
	props.shiny = shinyStr === "1" || shinyStr.toLowerCase() === "true";

	return { kind: "ok", iv: new PokemonIv(props), nickname };
}

function hoursToRibbon(hours: number): 0 | 1 | 2 | 3 | 4 {
	if (hours >= 2000) return 4;
	if (hours >= 1000) return 3;
	if (hours >= 500) return 2;
	if (hours >= 200) return 1;
	return 0;
}

/**
 * Build a map from FieldName to the raw column name string found in the
 * parser's headers. Returns null for fields with no matching header.
 * Falls back to positional DEFAULT_FIELD_ORDER when no recognized header
 * is found at all (hasHeader === false).
 */
function buildFieldColumnMap(
	headers: string[],
	t: TFunction,
): { fieldToColumn: Map<FieldName, string>; hasHeader: boolean } {
	// Build normalized label -> FieldName lookup
	const labelToField = new Map<string, FieldName>();
	for (const [aliases, field] of HEADER_ALIASES) {
		for (const alias of aliases) {
			labelToField.set(normalizeHeader(alias), field);
		}
	}
	// Add translated labels
	labelToField.set(normalizeHeader(t("nickname")), "nickname");
	labelToField.set(normalizeHeader(t("pokemon")), "pokemon");
	labelToField.set(normalizeHeader(t("level")), "level");
	labelToField.set(normalizeHeader(t("skill level")), "skillLevel");
	labelToField.set(normalizeHeader(t("ing n", { n: 1 })), "ing1");
	labelToField.set(normalizeHeader(t("ing n", { n: 2 })), "ing2");
	labelToField.set(normalizeHeader(t("ing n", { n: 3 })), "ing3");
	labelToField.set(normalizeHeader(t("main skill")), "mainSkill");
	labelToField.set(normalizeHeader(t("nature")), "nature");
	labelToField.set(normalizeHeader(t("sleeping time shared")), "ribbon");
	labelToField.set(normalizeHeader(t("shiny")), "shiny");

	// Map FieldName -> raw column name string
	const fieldToColumn = new Map<FieldName, string>();
	for (const header of headers) {
		const field = labelToField.get(normalizeHeader(header));
		if (field !== undefined && !fieldToColumn.has(field)) {
			fieldToColumn.set(field, header);
		}
	}

	return { fieldToColumn, hasHeader: fieldToColumn.size > 0 };
}

function initializeReverseMap(t: TFunction): ReverseMaps {
	const pokemon = new Map<string, string>();
	for (const p of pokemons) {
		pokemon.set(normalizeKey(p.name), p.name);
		pokemon.set(normalizeKey(t(`pokemons.${p.name}`)), p.name);
	}

	const nature = new Map<string, string>();
	for (const n of Nature.allNatures) {
		nature.set(normalizeKey(n.name), n.name);
		nature.set(normalizeKey(t(`natures.${n.name}`)), n.name);
	}

	const subSkill = new Map<string, string>();
	for (const s of SubSkill.allSubSkills) {
		subSkill.set(normalizeKey(s.name), s.name);
		subSkill.set(normalizeKey(t(`subskill.${s.name}`)), s.name);
	}

	const ingredient = new Map<string, IngredientName>();
	for (const name of IngredientNames) {
		ingredient.set(normalizeKey(name), name);
		ingredient.set(normalizeKey(t(`ingredients.${name}`)), name);
	}

	const versatileSkill = new Map<string, MainSkillName>();
	for (const name of VersatileCandidates) {
		versatileSkill.set(normalizeKey(name), name);
		versatileSkill.set(normalizeKey(t(`skills.${name}.name`)), name);
	}

	return { pokemon, nature, subSkill, versatileSkill, ingredient };
}
