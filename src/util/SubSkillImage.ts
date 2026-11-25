/**
 * Utilities to extract sub-skill labels from a Pokémon Sleep screenshot
 * without OCR.
 *
 * 1. Find the 5 sub-skill buttons (2-column grid: L, R, L, R, L)
 * 2. Binarize each button so that only the text remains
 * 3. Pixelate the text into a coarse density grid (grayscale)
 *
 * All functions work on ImageData-compatible objects so that they can be
 * used in both the browser (canvas) and Node.js scripts.
 */

/** ImageData-compatible RGBA image. */
export interface RgbaImage {
	width: number;
	height: number;
	data: Uint8ClampedArray | Uint8Array;
}

/** Binary image (1: text, 0: background). */
export interface BinaryImage {
	width: number;
	height: number;
	data: Uint8Array;
}

/** Grayscale image (0: background, 255: text). */
export interface GrayImage {
	width: number;
	height: number;
	data: Uint8Array;
}

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Component {
	label: number;
	left: number;
	top: number;
	right: number;
	bottom: number;
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Computes the Otsu threshold for the given histogram (256 bins).
 */
export function otsuThreshold(hist: number[]): number {
	let total = 0;
	let sum = 0;
	for (let i = 0; i < 256; i++) {
		total += hist[i];
		sum += i * hist[i];
	}
	let sumB = 0;
	let wB = 0;
	let best = 0;
	let bestVar = -1;
	for (let t = 0; t < 256; t++) {
		wB += hist[t];
		if (wB === 0) continue;
		const wF = total - wB;
		if (wF === 0) break;
		sumB += t * hist[t];
		const mB = sumB / wB;
		const mF = (sum - sumB) / wF;
		const v = wB * wF * (mB - mF) * (mB - mF);
		if (v > bestVar) {
			bestVar = v;
			best = t;
		}
	}
	return best;
}

/**
 * Binarizes the text area of the button.
 *
 * Text is always darker than the button background (even on locked
 * buttons), so luminance + Otsu threshold is used. The result is cropped
 * to the bounding box of the text.
 *
 * @param margin Ratio of the button size to skip on each side.
 * @returns binarized text and its bounding box in the image.
 */
export function binarizeButton(
	img: RgbaImage,
	button: Rect,
	margin: { x: number; y: number } = { x: 0.04, y: 0.18 },
): { image: BinaryImage; rect: Rect } {
	// Inner area without border, shadow and the "Lv.xx" badge
	const x0 = Math.round(button.x + button.width * margin.x);
	const x1 = Math.round(button.x + button.width * (1 - margin.x));
	const y0 = Math.round(button.y + button.height * margin.y);
	const y1 = Math.round(button.y + button.height * (1 - margin.y));
	const w = x1 - x0;
	const h = y1 - y0;

	const lum = new Uint8Array(w * h);
	const hist = Array.from({ length: 256 }, () => 0);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const i = ((y0 + y) * img.width + x0 + x) * 4;
			const l = Math.round(
				0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2],
			);
			lum[y * w + x] = l;
			hist[l]++;
		}
	}
	const threshold = otsuThreshold(hist);

	let left = w;
	let right = -1;
	let top = h;
	let bottom = -1;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (lum[y * w + x] <= threshold) {
				if (x < left) left = x;
				if (x > right) right = x;
				if (y < top) top = y;
				if (y > bottom) bottom = y;
			}
		}
	}
	if (right < 0) {
		return {
			image: { width: 0, height: 0, data: new Uint8Array(0) },
			rect: { x: x0, y: y0, width: 0, height: 0 },
		};
	}

	const bw = right - left + 1;
	const bh = bottom - top + 1;
	const out = new Uint8Array(bw * bh);
	for (let y = 0; y < bh; y++) {
		for (let x = 0; x < bw; x++) {
			out[y * bw + x] = lum[(top + y) * w + left + x] <= threshold ? 1 : 0;
		}
	}
	return {
		image: { width: bw, height: bh, data: out },
		rect: { x: x0 + left, y: y0 + top, width: bw, height: bh },
	};
}

/**
 * Pixelates the binary image into a width x height grayscale image.
 * Each pixel holds the ratio of text pixels in the corresponding area
 * (0: no text, 255: all text).
 */
export function pixelate(
	bin: BinaryImage,
	width: number,
	height: number,
): GrayImage {
	const sums = Array.from({ length: width * height }, () => 0);
	const counts = Array.from({ length: width * height }, () => 0);
	for (let y = 0; y < bin.height; y++) {
		const cy = Math.min(height - 1, Math.floor((y * height) / bin.height));
		for (let x = 0; x < bin.width; x++) {
			const cx = Math.min(width - 1, Math.floor((x * width) / bin.width));
			const c = cy * width + cx;
			sums[c] += bin.data[y * bin.width + x];
			counts[c]++;
		}
	}
	const data = new Uint8Array(width * height);
	for (let i = 0; i < data.length; i++) {
		data[i] = counts[i] > 0 ? Math.round((sums[i] / counts[i]) * 255) : 0;
	}
	return { width, height, data };
}

/**
 * Returns the RMS difference between two grayscale images of the same size.
 * @returns 0 (identical) to 1 (completely different).
 */
export function grayDistance(a: GrayImage, b: GrayImage): number {
	if (a.width !== b.width || a.height !== b.height) {
		throw new Error("Image size mismatch");
	}
	if (a.data.length === 0) {
		return 0;
	}
	let sum = 0;
	for (let i = 0; i < a.data.length; i++) {
		const d = (a.data[i] - b.data[i]) / 255;
		sum += d * d;
	}
	return Math.sqrt(sum / a.data.length);
}

/**
 * Finds the sub-skill buttons and returns the pixelated text of each.
 *
 * @param img Screenshot.
 * @param size Size of the pixelated text image.
 * @returns 5 results in the game order, or an empty array if buttons are
 *          not found.
 */
export function extractSubSkillTexts(
	img: RgbaImage,
	size: { width: number; height: number },
): {
	button: Rect;
	text: Rect;
	pixelated: GrayImage;
	widthRatio: number;
}[] {
	const buttons = findSubSkillButtons(img);
	if (buttons === null) {
		return [];
	}
	return buttons.map((button) => {
		const { image, rect } = binarizeButton(img, button);
		return {
			button,
			text: rect,
			pixelated: pixelate(image, size.width, size.height),
			widthRatio: rect.width / button.width,
		};
	});
}

/**
 * Finds the 5 sub-skill buttons in the screenshot.
 *
 * Buttons are detected as connected components of non-background pixels
 * (their border and shadow form a closed ring), then the 2-column grid
 * pattern is searched among button-shaped components.
 *
 * @returns 5 rectangles in the game order, or null if not found.
 */
export function findSubSkillButtons(img: RgbaImage): Rect[] | null {
	return findGrid(findButtonCandidates(img), img.width);
}

/**
 * Finds the nature button in the screenshot.
 *
 * The nature button is placed in the left column below the sub-skill
 * buttons, and has the same width as them.
 *
 * @returns rectangle of the button, or null if not found.
 */
export function findNatureButton(img: RgbaImage): Rect | null {
	const candidates = findButtonCandidates(img);
	const grid = findGrid(candidates, img.width);
	if (grid === null) {
		return null;
	}
	const last = grid[4];
	const bottom = last.y + last.height;
	const found = candidates
		.filter(
			(r) =>
				r.y >= bottom &&
				Math.abs(r.x - last.x) <= last.width * 0.05 &&
				Math.abs(r.width - last.width) <= last.width * 0.05,
		)
		.sort((a, b) => a.y - b.y);
	return found[0] ?? null;
}

/**
 * Finds the nature button and returns the pixelated text.
 *
 * @param img Screenshot.
 * @param size Size of the pixelated text image.
 * @returns result, or null if the button is not found.
 */
export function extractNatureText(
	img: RgbaImage,
	size: { width: number; height: number },
): { button: Rect; text: Rect; pixelated: GrayImage } | null {
	const button = findNatureButton(img);
	if (button === null) {
		return null;
	}
	// Skip the rounded green border
	const { image, rect } = binarizeButton(img, button, {
		x: 0.15,
		y: 0.22,
	});
	return {
		button,
		text: rect,
		pixelated: pixelate(image, size.width, size.height),
	};
}

/**
 * Finds button-shaped connected components of non-background pixels.
 */
function findButtonCandidates(img: RgbaImage): Rect[] {
	const { width, height, data } = img;
	const bg = findBackgroundColor(img);

	// Mask of pixels that differ from the background
	const mask = new Uint8Array(width * height);
	for (let i = 0, p = 0; p < mask.length; i += 4, p++) {
		const d = Math.max(
			Math.abs(data[i] - bg[0]),
			Math.abs(data[i + 1] - bg[1]),
			Math.abs(data[i + 2] - bg[2]),
		);
		mask[p] = d > 16 ? 1 : 0;
	}

	// Label connected components (4-connectivity)
	const labels = new Int32Array(width * height);
	const components: Component[] = [];
	const stack: number[] = [];
	for (let start = 0; start < mask.length; start++) {
		if (mask[start] === 0 || labels[start] !== 0) {
			continue;
		}
		const label = components.length + 1;
		const c: Component = {
			label,
			left: width,
			top: height,
			right: -1,
			bottom: -1,
		};
		labels[start] = label;
		stack.push(start);
		while (stack.length > 0) {
			const p = stack.pop() as number;
			const x = p % width;
			const y = (p - x) / width;
			if (x < c.left) c.left = x;
			if (x > c.right) c.right = x;
			if (y < c.top) c.top = y;
			if (y > c.bottom) c.bottom = y;
			if (x > 0 && mask[p - 1] && !labels[p - 1]) {
				labels[p - 1] = label;
				stack.push(p - 1);
			}
			if (x < width - 1 && mask[p + 1] && !labels[p + 1]) {
				labels[p + 1] = label;
				stack.push(p + 1);
			}
			if (y > 0 && mask[p - width] && !labels[p - width]) {
				labels[p - width] = label;
				stack.push(p - width);
			}
			if (y < height - 1 && mask[p + width] && !labels[p + width]) {
				labels[p + width] = label;
				stack.push(p + width);
			}
		}
		components.push(c);
	}

	// Keep button-shaped components
	const candidates: Rect[] = [];
	for (const c of components) {
		const w = c.right - c.left + 1;
		const h = c.bottom - c.top + 1;
		if (w < width * 0.3 || w > width * 0.48) {
			continue;
		}
		if (h < w * 0.12 || h > w * 0.45) {
			continue;
		}
		// The "Lv.xx" badge of a locked sub-skill sticks out of the top-left
		// of the button. Use the median of the top edge of each column and
		// the median of the left edge of each row.
		const tops: number[] = [];
		for (let x = c.left; x <= c.right; x++) {
			for (let y = c.top; y <= c.bottom; y++) {
				if (labels[y * width + x] === c.label) {
					tops.push(y);
					break;
				}
			}
		}
		const lefts: number[] = [];
		for (let y = c.top; y <= c.bottom; y++) {
			for (let x = c.left; x <= c.right; x++) {
				if (labels[y * width + x] === c.label) {
					lefts.push(x);
					break;
				}
			}
		}
		const top = median(tops);
		const left = median(lefts);
		candidates.push({
			x: left,
			y: top,
			width: c.right - left + 1,
			height: c.bottom - top + 1,
		});
	}
	return candidates;
}

/**
 * Returns the most frequent color in the image (quantized).
 */
export function findBackgroundColor(img: RgbaImage): [number, number, number] {
	const counts = new Map<number, number>();
	const { data } = img;
	// Sample every 4th pixel for speed
	for (let i = 0; i < data.length; i += 16) {
		const key =
			((data[i] >> 2) << 12) | ((data[i + 1] >> 2) << 6) | (data[i + 2] >> 2);
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	let best = 0;
	let bestCount = -1;
	for (const [key, count] of counts) {
		if (count > bestCount) {
			best = key;
			bestCount = count;
		}
	}
	return [
		((best >> 12) << 2) | 2,
		(((best >> 6) & 63) << 2) | 2,
		((best & 63) << 2) | 2,
	];
}

/**
 * Finds 5 rectangles placed in the following layout:
 *
 *   [0] [1]
 *   [2] [3]
 *   [4]
 */
function findGrid(candidates: Rect[], imageWidth: number): Rect[] | null {
	const center = imageWidth / 2;
	const lefts = candidates
		.filter((r) => r.x + r.width / 2 < center)
		.sort((a, b) => a.y - b.y);
	const rights = candidates.filter((r) => r.x + r.width / 2 >= center);
	const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
	const findAt = (list: Rect[], y: number, tol: number) =>
		list.find((r) => near(r.y, y, tol));

	for (let i = 0; i + 2 < lefts.length; i++) {
		const l1 = lefts[i];
		const tol = l1.height * 0.15;
		const r1 = findAt(rights, l1.y, tol);
		if (r1 === undefined || !near(r1.width, l1.width, l1.width * 0.05)) {
			continue;
		}
		const l2 = lefts[i + 1];
		const pitch = l2.y - l1.y;
		if (pitch < l1.height || pitch > l1.height * 2.5) {
			continue;
		}
		const r2 = findAt(rights, l2.y, tol);
		const l3 = findAt(lefts.slice(i + 2), l2.y + pitch, tol);
		if (r2 === undefined || l3 === undefined) {
			continue;
		}
		return [l1, r1, l2, r2, l3];
	}
	return null;
}
