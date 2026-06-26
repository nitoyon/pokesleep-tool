import type { TFunction } from "i18next";
import type { PokemonBoxItem } from "../PokemonBox";
import { escapeCsvField } from "./CsvFormatter";

type CsvTsvFormat = "csv" | "tsv";

const RIBBON_HOURS = [0, 200, 500, 1000, 2000] as const;

/**
 * Export box items to CSV or TSV format.
 * @param items Box items.
 * @param t i18n formatter.
 * @param format "tsv" or "csv".
 * @returns Formtted string.
 */
export function exportToCsvTsv(
	items: PokemonBoxItem[],
	t: TFunction,
	format: CsvTsvFormat,
): string {
	const isCsv = format === "csv";
	const sep = isCsv ? "," : "\t";

	const header = exportHeaders(t, isCsv);

	const rows = items.map((item) => {
		const iv = item.iv;
		const ingName = (name: string) =>
			name === "unknown" ? "" : t(`ingredients.${name}`);
		const cols = [
			item.nickname,
			t(`pokemons.${iv.pokemonName}`),
			String(iv.level),
			String(iv.skillLevel),
			ingName(iv.ingredient1.name),
			ingName(iv.ingredient2.name),
			ingName(iv.ingredient3.name),
			t(`skills.${iv.versatileSkill}.name`),
			t(`natures.${iv.nature.name}`),
			iv.subSkills.lv10 ? t(`subskill.${iv.subSkills.lv10.name}`) : "",
			iv.subSkills.lv25 ? t(`subskill.${iv.subSkills.lv25.name}`) : "",
			iv.subSkills.lv50 ? t(`subskill.${iv.subSkills.lv50.name}`) : "",
			iv.subSkills.lv70 ? t(`subskill.${iv.subSkills.lv70.name}`) : "",
			iv.subSkills.lv80 ? t(`subskill.${iv.subSkills.lv80.name}`) : "",
			String(RIBBON_HOURS[iv.ribbon]),
			iv.shiny ? "1" : "0",
		];
		return isCsv ? cols.map(escapeCsvField).join(sep) : cols.join(sep);
	});

	return [header, ...rows].join("\n");
}

/**
 * Export default column layout (16 columns):
 *
 * - 0: nickname
 * - 1: pokemon
 * - 2: level
 * - 3: skill level
 * - 4: ing 1
 * - 5: ing 2
 * - 6: ing 3
 * - 7: main skill
 * - 8: nature
 * - 9-13: subskills (Lv10/25/50/75/100)
 * - 14: ribbon
 * - 15: shiny
 */
function exportHeaders(t: TFunction, isCsv: boolean): string {
	const fields = [
		t("nickname"),
		t("pokemon"),
		t("level"),
		t("skill level"),
		t("ing n", { n: 1 }),
		t("ing n", { n: 2 }),
		t("ing n", { n: 3 }),
		t("main skill"),
		t("nature"),
		"Lv10",
		"Lv25",
		"Lv50",
		"Lv70",
		"Lv80",
		t("sleeping time shared"),
		t("shiny"),
	];
	const sep = isCsv ? "," : "\t";
	return isCsv ? fields.map(escapeCsvField).join(sep) : fields.join(sep);
}
