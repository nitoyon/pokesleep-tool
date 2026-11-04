// Helpers to read/write the image table used by subskillimage.ts and
// natureimage.ts.
//
// The table is a PNG image where each column holds the pixelated text of
// the corresponding name. Text is drawn in black on white.

import * as fs from "node:fs";
import {
	type GrayImage,
	grayDistance,
	type RgbaImage,
} from "../src/util/SubSkillImage";
import { decodePng, encodePng } from "./png";

/**
 * Returns the text describing the best and the second best match.
 */
export function describeMatch<T extends string>(
	table: Map<T, GrayImage>,
	image: GrayImage,
): string {
	const [best, second] = [...table]
		.map(([name, cell]) => ({ name, distance: grayDistance(image, cell) }))
		.sort((a, b) => a.distance - b.distance);
	const secondText =
		second === undefined
			? ""
			: ` (2nd: ${second.name} ${second.distance.toFixed(3)})`;
	return `${best.name} ${best.distance.toFixed(3)}${secondText}`;
}

/**
 * Writes the image table.
 * Missing names are left blank.
 */
export function writeTable<T extends string>(
	pngPath: string,
	names: T[],
	images: Map<T, GrayImage>,
	size: { width: number; height: number },
): T[] {
	const { width, height } = size;
	const out: GrayImage = {
		width: width * names.length,
		height,
		data: new Uint8Array(width * names.length * height),
	};
	const missing: T[] = [];
	names.forEach((name, col) => {
		const image = images.get(name);
		if (image === undefined) {
			missing.push(name);
			return;
		}
		blit(out, image, col * width, 0);
	});
	fs.writeFileSync(pngPath, encodePng(grayToRgba(out)));
	return missing;
}

/**
 * Loads the image table.
 * Blank cells (missing names) are excluded.
 */
export function loadTable<T extends string>(
	pngPath: string,
	names: T[],
): Map<T, GrayImage> {
	const gray = rgbaToGray(decodePng(fs.readFileSync(pngPath)));
	if (gray.width % names.length !== 0) {
		throw new Error(
			`${pngPath}: width ${gray.width} is not a multiple of ${names.length}`,
		);
	}
	const width = gray.width / names.length;
	const height = gray.height;
	const ret = new Map<T, GrayImage>();
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
