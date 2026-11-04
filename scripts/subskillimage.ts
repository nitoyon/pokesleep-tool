// npm run subskillimage -- build <lang.json>... [--width=60] [--height=12]
// npm run subskillimage -- test <lang.png> <screenshot.png>...
//
// build mode:
//
// JSON file format:
//
//   {
//     "gold1.png": ["Berry Finding S", "Skill Level Up M", ...],
//     "gold2.png": [...]
//   }
//
// test mode:
//
//   Recognizes the sub-skills in the given screenshots using the image.

import * as fs from "node:fs";
import * as path from "node:path";
import SubSkill, { type SubSkillType } from "../src/util/SubSkill";
import {
	extractSubSkillTexts,
	type GrayImage,
} from "../src/util/SubSkillImage";
import { describeMatch, loadTable, writeTable } from "./grayimage";
import { decodePng } from "./png";

interface Source {
	/** Path of the screenshot */
	file: string;
	/** Sub-skills in the screenshot (game order) */
	subSkills: SubSkillType[];
}

const usage = `Usage:
  npm run subskillimage -- build <lang.json>... [--width=60] [--height=12]
  npm run subskillimage -- test <lang.png> <screenshot.png>...`;

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
 * Builds the sub-skill image table for each JSON file.
 */
function build(jsonPaths: string[], size: { width: number; height: number }) {
	const names = SubSkill.allSubSkillNames;
	for (const jsonPath of jsonPaths) {
		const lang = path.basename(jsonPath, path.extname(jsonPath));
		const sources = loadSources(jsonPath);
		const images = collectImages(lang, sources, size);
		const output = path.join(path.dirname(jsonPath), `${lang}.png`);
		const missing = writeTable(output, names, images, size);
		for (const name of missing) {
			console.warn(`[${lang}] Missing sub-skill: ${name}`);
		}
		console.log(`Wrote ${output}`);
	}
}

/**
 * Recognizes the sub-skills in the screenshots using the image table.
 */
function test(tablePath: string, screenshots: string[]) {
	const table = loadTable(tablePath, SubSkill.allSubSkillNames);
	if (table.size === 0) {
		throw new Error(`${tablePath}: no sub-skill images`);
	}
	const first = table.values().next().value as GrayImage;
	const size = { width: first.width, height: first.height };

	for (const file of screenshots) {
		console.log(`${path.basename(file)}:`);
		const img = decodePng(fs.readFileSync(file));
		const results = extractSubSkillTexts(img, size);
		if (results.length === 0) {
			console.log("  Sub-skills not found");
			continue;
		}
		results.forEach((result, i) => {
			console.log(`  ${i + 1}. ${describeMatch(table, result.pixelated)}`);
		});
	}
}

/**
 * Loads the JSON file.
 * @returns screenshots listed in the file.
 */
function loadSources(jsonPath: string): Source[] {
	const names: string[] = SubSkill.allSubSkillNames;
	const file = path.basename(jsonPath);
	const dir = path.dirname(jsonPath);
	const json: unknown = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
	if (typeof json !== "object" || json === null || Array.isArray(json)) {
		throw new Error(`${file}: must be an object`);
	}
	const sources: Source[] = [];
	for (const [png, subSkills] of Object.entries(json)) {
		if (
			!Array.isArray(subSkills) ||
			!subSkills.every((s) => typeof s === "string")
		) {
			throw new Error(`${file}: ${png} must be an array of strings`);
		}
		for (const s of subSkills) {
			if (!names.includes(s)) {
				throw new Error(`${file}: ${png} has unknown sub-skill: ${s}`);
			}
		}
		sources.push({
			file: path.join(dir, png),
			subSkills: subSkills as SubSkillType[],
		});
	}
	return sources;
}

/**
 * Extracts the sub-skill images from the screenshots of the language.
 * The first image is used for duplicated sub-skills.
 */
function collectImages(
	lang: string,
	sources: Source[],
	size: { width: number; height: number },
): Map<SubSkillType, GrayImage> {
	const ret = new Map<SubSkillType, GrayImage>();
	for (const source of sources) {
		const img = decodePng(fs.readFileSync(source.file));
		const results = extractSubSkillTexts(img, size);
		if (results.length !== source.subSkills.length) {
			console.warn(
				`[${lang}] ${path.basename(source.file)}: found ${results.length} sub-skills, but ${source.subSkills.length} are listed`,
			);
		}
		const n = Math.min(results.length, source.subSkills.length);
		for (let i = 0; i < n; i++) {
			const name = source.subSkills[i];
			if (!ret.has(name)) {
				ret.set(name, results[i].pixelated);
			}
		}
	}
	return ret;
}

main();
