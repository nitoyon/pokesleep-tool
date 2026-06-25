// npm run ingredientgfit < data.tsv
//
// This script estimates ingredientG values for levels 66-70 from RP data.
//
// TSV should contain Pokémon at levels 66-70 (mixed levels are OK).
// Read tsv from stdin (RP collection sheet format).
// See src/util/RpParse.ts for details

import * as fs from "node:fs";
import PokemonRp from "../src/util/PokemonRp";
import parseTsv, { type RpData } from "../src/util/RpParse";

const SEARCH_START = 2.0;
const SEARCH_END = 4.0;

function checkIngredientG(data: RpData[], ingredientG: number): boolean {
	for (const datum of data) {
		const iv = datum.iv.clone();
		const rp = new PokemonRp(iv);
		Object.defineProperty(rp, "ingredientG", {
			get() {
				return ingredientG;
			},
			configurable: true,
		});
		if (rp.Rp !== datum.rp) {
			return false;
		}
	}
	return true;
}

// Read from stdin
const tsv = fs.readFileSync(0).toString();
console.log("read done");

const data = parseTsv(tsv);
for (const name of Object.keys(data)) {
	console.log(`- ${name}: ${data[name].length}`);
}

// Group by level
const byLevel: Record<number, RpData[]> = {};
for (const items of Object.values(data)) {
	for (const item of items) {
		const level = item.iv.level;
		if (!byLevel[level]) {
			byLevel[level] = [];
		}
		byLevel[level].push(item);
	}
}

// Search for fitting ingredientG values per level
console.log("\nResults:");
for (const levelStr of Object.keys(byLevel).sort(
	(a, b) => parseInt(a, 10) - parseInt(b, 10),
)) {
	const level = parseInt(levelStr, 10);
	const items = byLevel[level];
	const candidates: number[] = [];

	for (
		let v = Math.round(SEARCH_START * 1000);
		v <= Math.round(SEARCH_END * 1000);
		v++
	) {
		const ingredientG = v / 1000;
		if (checkIngredientG(items, ingredientG)) {
			candidates.push(ingredientG);
		}
	}

	if (candidates.length === 0) {
		console.log(`Level ${level}: no match found (${items.length} data points)`);
	} else {
		console.log(
			`Level ${level}: ${candidates.join(", ")} (${items.length} data points)`,
		);
	}
}
