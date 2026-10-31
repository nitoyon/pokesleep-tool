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
	grayDistance,
	type RgbaImage,
} from "../src/util/SubSkillImage";
import { decodePng, encodePng } from "./png";

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
	const { width, height } = size;
	const names = SubSkill.allSubSkillNames;
	for (const jsonPath of jsonPaths) {
		const lang = path.basename(jsonPath, path.extname(jsonPath));
		const sources = loadSources(jsonPath);
		const images = collectImages(lang, sources, size);
		const out: GrayImage = {
			width: width * names.length,
			height,
			data: new Uint8Array(width * names.length * height),
		};
		names.forEach((name, col) => {
			const image = images.get(name);
			if (image === undefined) {
				console.warn(`[${lang}] Missing sub-skill: ${name}`);
				return;
			}
			blit(out, image, col * width, 0);
		});

		const output = path.join(path.dirname(jsonPath), `${lang}.png`);
		fs.writeFileSync(output, encodePng(grayToRgba(out)));
		console.log(`Wrote ${output}`);
	}
}

/**
 * Recognizes the sub-skills in the screenshots using the image table.
 */
function test(tablePath: string, screenshots: string[]) {
	const table = loadTable(tablePath);
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
			const ranking = [...table]
				.map(([name, image]) => ({
					name,
					distance: grayDistance(result.pixelated, image),
				}))
				.sort((a, b) => a.distance - b.distance);
			const [best, second] = ranking;
			const secondText =
				second === undefined
					? ""
					: ` (2nd: ${second.name} ${second.distance.toFixed(3)})`;
			console.log(
				`  ${i + 1}. ${best.name} ${best.distance.toFixed(3)}${secondText}`,
			);
		});
	}
}

/**
 * Loads the image table created by build mode.
 * Blank cells (missing sub-skills) are excluded.
 */
function loadTable(pngPath: string): Map<SubSkillType, GrayImage> {
	const names = SubSkill.allSubSkillNames;
	const gray = rgbaToGray(decodePng(fs.readFileSync(pngPath)));
	if (gray.width % names.length !== 0) {
		throw new Error(
			`${pngPath}: width ${gray.width} is not a multiple of ${names.length}`,
		);
	}
	const width = gray.width / names.length;
	const height = gray.height;
	const ret = new Map<SubSkillType, GrayImage>();
	names.forEach((name, col) => {
		const cell: GrayImage = {
			width,
			height,
			data: new Uint8Array(width * height),
		};
		for (let y = 0; y < height; y++) {
			cell.data.set(
				gray.data.subarray(
					y * gray.width + col * width,
					y * gray.width + (col + 1) * width,
				),
				y * width,
			);
		}
		if (cell.data.some((v) => v !== 0)) {
			ret.set(name, cell);
		}
	});
	return ret;
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

/** Copies src into dst at (x, y). */
function blit(dst: GrayImage, src: GrayImage, x: number, y: number) {
	for (let sy = 0; sy < src.height; sy++) {
		dst.data.set(
			src.data.subarray(sy * src.width, (sy + 1) * src.width),
			(y + sy) * dst.width + x,
		);
	}
}

/** Converts to RGBA (text is drawn in black on white). */
function grayToRgba(gray: GrayImage): RgbaImage {
	const data = new Uint8ClampedArray(gray.width * gray.height * 4);
	for (let i = 0; i < gray.data.length; i++) {
		const v = 255 - gray.data[i];
		data.set([v, v, v, 255], i * 4);
	}
	return { width: gray.width, height: gray.height, data };
}

/** Inverse of grayToRgba. */
function rgbaToGray(img: RgbaImage): GrayImage {
	const data = new Uint8Array(img.width * img.height);
	for (let i = 0; i < data.length; i++) {
		data[i] = 255 - img.data[i * 4];
	}
	return { width: img.width, height: img.height, data };
}

main();
