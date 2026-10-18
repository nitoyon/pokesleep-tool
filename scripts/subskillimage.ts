// npm run subskillimage -- <screenshot.png> [outDir] [--cols=24] [--rows=4]
//
// Finds the 5 sub-skill buttons in a Pokémon Sleep screenshot and writes
// the following images to outDir (default: current directory):
//
// - subskill-buttons.png: screenshot with detected buttons/text marked
// - subskill-N-bin.png: binarized text of the N-th sub-skill
// - subskill-N-pix.png: pixelated text of the N-th sub-skill (enlarged)
//
// Also prints the pixelated density data as JSON.

import * as fs from "node:fs";
import * as path from "node:path";
import {
	type BinaryImage,
	extractSubSkillTexts,
	type Rect,
	type RgbaImage,
} from "../src/util/SubSkillImage";
import { decodePng, encodePng } from "./png";

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
	if (positional.length < 1) {
		console.error(
			"Usage: npm run subskillimage -- <screenshot.png> [outDir] [--cols=24] [--rows=4]",
		);
		process.exit(1);
	}
	const input = positional[0];
	const outDir = positional[1] ?? ".";
	const cols = parseInt(options.get("cols") ?? "24", 10);
	const rows = parseInt(options.get("rows") ?? "4", 10);

	const img = decodePng(fs.readFileSync(input));
	const results = extractSubSkillTexts(img, cols, rows);
	if (results === null) {
		console.error("Sub-skill buttons not found");
		process.exit(1);
	}
	fs.mkdirSync(outDir, { recursive: true });

	// Detected areas
	const marked: RgbaImage = {
		width: img.width,
		height: img.height,
		data: new Uint8ClampedArray(img.data),
	};
	for (const r of results) {
		drawRect(marked, r.button, [255, 0, 0]);
		drawRect(marked, r.text, [0, 160, 0]);
	}
	fs.writeFileSync(
		path.join(outDir, "subskill-buttons.png"),
		encodePng(marked),
	);

	results.forEach((r, i) => {
		const n = i + 1;
		fs.writeFileSync(
			path.join(outDir, `subskill-${n}-bin.png`),
			encodePng(binaryToRgba(r.binary)),
		);
		fs.writeFileSync(
			path.join(outDir, `subskill-${n}-pix.png`),
			encodePng(densityToRgba(r.pixelated.data, cols, rows, 16)),
		);
	});

	console.log(
		JSON.stringify(
			results.map((r) => ({
				button: r.button,
				text: r.text,
				widthRatio: Math.round(r.pixelated.widthRatio * 1000) / 1000,
				data: r.pixelated.data.map((v) => Math.round(v * 100) / 100),
			})),
			null,
			"\t",
		),
	);
	results.forEach((r, i) => {
		console.error(`#${i + 1}`);
		console.error(toAscii(r.pixelated.data, cols, rows));
	});
}

function drawRect(img: RgbaImage, r: Rect, color: number[]) {
	const set = (x: number, y: number) => {
		if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
		const i = (y * img.width + x) * 4;
		img.data[i] = color[0];
		img.data[i + 1] = color[1];
		img.data[i + 2] = color[2];
		img.data[i + 3] = 255;
	};
	for (let t = 0; t < 3; t++) {
		for (let x = r.x - t; x < r.x + r.width + t; x++) {
			set(x, r.y - t);
			set(x, r.y + r.height - 1 + t);
		}
		for (let y = r.y - t; y < r.y + r.height + t; y++) {
			set(r.x - t, y);
			set(r.x + r.width - 1 + t, y);
		}
	}
}

function binaryToRgba(bin: BinaryImage): RgbaImage {
	const data = new Uint8ClampedArray(bin.width * bin.height * 4);
	for (let i = 0; i < bin.data.length; i++) {
		const v = bin.data[i] ? 0 : 255;
		data.set([v, v, v, 255], i * 4);
	}
	return { width: bin.width, height: bin.height, data };
}

function densityToRgba(
	values: number[],
	cols: number,
	rows: number,
	scale: number,
): RgbaImage {
	const width = cols * scale;
	const height = rows * scale;
	const data = new Uint8ClampedArray(width * height * 4);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const v = Math.round(
				255 *
					(1 - values[Math.floor(y / scale) * cols + Math.floor(x / scale)]),
			);
			data.set([v, v, v, 255], (y * width + x) * 4);
		}
	}
	return { width, height, data };
}

function toAscii(values: number[], cols: number, rows: number): string {
	const chars = " .:-=+*#%@";
	const lines: string[] = [];
	for (let y = 0; y < rows; y++) {
		let line = "";
		for (let x = 0; x < cols; x++) {
			line += chars[Math.min(9, Math.floor(values[y * cols + x] * 10))];
		}
		lines.push(`|${line}|`);
	}
	return lines.join("\n");
}

main();
