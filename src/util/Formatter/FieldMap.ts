export type FieldName =
	| "nickname"
	| "pokemon"
	| "level"
	| "skillLevel"
	| "ing1"
	| "ing2"
	| "ing3"
	| "mainSkill"
	| "nature"
	| "lv10"
	| "lv25"
	| "lv50"
	| "lv70"
	| "lv80"
	| "ribbon"
	| "shiny";

// Well-known header labels (English and translated) mapped to canonical field names
export const HEADER_ALIASES: Array<[string[], FieldName]> = [
	[["nickname"], "nickname"],
	[["Pokemon", "Pokémon"], "pokemon"],
	[["level"], "level"],
	[["skill level"], "skillLevel"],
	[["ing 1", "Ingredient 1"], "ing1"],
	[["ing 2", "Ingredient 2"], "ing2"],
	[["ing 3", "Ingredient 3"], "ing3"],
	[["main skill"], "mainSkill"],
	[["nature"], "nature"],
	[["lv10"], "lv10"],
	[["lv25"], "lv25"],
	[["lv50"], "lv50"],
	[["lv70"], "lv70"],
	[["lv80"], "lv80"],
	[["ribbon", "sleeping time shared"], "ribbon"],
	[["shiny"], "shiny"],
];

/** Default column order when no header mapping is applied */
export const DEFAULT_FIELD_ORDER: FieldName[] = [
	"nickname",
	"pokemon",
	"level",
	"skillLevel",
	"ing1",
	"ing2",
	"ing3",
	"mainSkill",
	"nature",
	"lv10",
	"lv25",
	"lv50",
	"lv70",
	"lv80",
	"ribbon",
	"shiny",
];

export const normalizeHeader = (s: string) =>
	s.trim().replace(/\s+/g, " ").toLowerCase();
