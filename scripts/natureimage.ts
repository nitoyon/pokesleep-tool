// npm run natureimage -- build <lang.json>... [--width=60] [--height=12]
// npm run natureimage -- test <lang.png> <screenshot.png>...
//
// build mode:
//
// JSON file format:
//
//   ["Timid", "Mild", ...]
//
//   The N-th nature (1-origin) is read from N.png in the same directory.
//
// test mode:
//
//   Recognizes the nature in the given screenshots using the image.

import * as fs from "node:fs";
import * as path from "node:path";
import Nature, { type NatureType } from "../src/util/Nature";
import { extractNatureText, type GrayImage } from "../src/util/SubSkillImage";
import { describeMatch, loadTable, writeTable } from "./grayimage";
import { decodePng } from "./png";

interface Source {
	/** Path of the screenshot */
	file: string;
	/** Nature in the screenshot */
	nature: NatureType;
}

const usage = `Usage:
  npm run natureimage -- build <lang.json>... [--width=60] [--height=12]
  npm run natureimage -- test <lang.png> <screenshot.png>...`;

const allNatureNames: NatureType[] = Nature.allNatures.map((n) => n.name);

function main() {
	const args = process.argv.slice(2);
	const options = new Map<string, string>();
	const positional: string[] = [];
	for (const arg of args) {
		const m = arg.match(/^--(\w+)=(.*)$/);
		if (m !== null) {
			options.set(m[1], m[2]);
		} else {
			positional.push(arg);
		}
	}
	const [mode, ...files] = positional;
	if (mode === "build" && files.length >= 1) {
		const width = parseInt(options.get("width") ?? "60", 10);
		const height = parseInt(options.get("height") ?? "12", 10);
		build(files, { width, height });
	} else if (mode === "test" && files.length >= 2) {
		test(files[0], files.slice(1));
	} else {
		console.error(usage);
		process.exit(1);
	}
}

/**
 * Builds the nature image table for each JSON file.
 */
function build(jsonPaths: string[], size: { width: number; height: number }) {
	for (const jsonPath of jsonPaths) {
		const lang = path.basename(jsonPath, path.extname(jsonPath));
		const sources = loadSources(jsonPath);
		const images = collectImages(lang, sources, size);
		const output = path.join(path.dirname(jsonPath), `${lang}.png`);
		const missing = writeTable(output, allNatureNames, images, size);
		for (const name of missing) {
			console.warn(`[${lang}] Missing nature: ${name}`);
		}
		console.log(`Wrote ${output}`);
	}
}

/**
 * Recognizes the nature in the screenshots using the image table.
 */
function test(tablePath: string, screenshots: string[]) {
	const table = loadTable(tablePath, allNatureNames);
	if (table.size === 0) {
		throw new Error(`${tablePath}: no nature images`);
	}
	const first = table.values().next().value as GrayImage;
	const size = { width: first.width, height: first.height };

	for (const file of screenshots) {
		const img = decodePng(fs.readFileSync(file));
		const result = extractNatureText(img, size);
		const text =
			result === null
				? "Nature not found"
				: describeMatch(table, result.pixelated);
		console.log(`${path.basename(file)}: ${text}`);
	}
}

/**
 * Loads the JSON file.
 * @returns screenshots for the natures listed in the file.
 */
function loadSources(jsonPath: string): Source[] {
	const names: string[] = allNatureNames;
	const file = path.basename(jsonPath);
	const dir = path.dirname(jsonPath);
	const json: unknown = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
	if (!Array.isArray(json) || !json.every((s) => typeof s === "string")) {
		throw new Error(`${file}: must be an array of strings`);
	}
	return json.map((nature, i) => {
		if (!names.includes(nature)) {
			throw new Error(`${file}: unknown nature: ${nature}`);
		}
		return {
			file: path.join(dir, `${i + 1}.png`),
			nature: nature as NatureType,
		};
	});
}

/**
 * Extracts the nature images from the screenshots of the language.
 * The first image is used for duplicated natures.
 */
function collectImages(
	lang: string,
	sources: Source[],
	size: { width: number; height: number },
): Map<NatureType, GrayImage> {
	const ret = new Map<NatureType, GrayImage>();
	for (const source of sources) {
		const img = decodePng(fs.readFileSync(source.file));
		const result = extractNatureText(img, size);
		if (result === null) {
			console.warn(`[${lang}] ${path.basename(source.file)}: nature not found`);
			continue;
		}
		if (!ret.has(source.nature)) {
			ret.set(source.nature, result.pixelated);
		}
	}
	return ret;
}

main();
