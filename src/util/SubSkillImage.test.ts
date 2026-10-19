import {
	binarizeButton,
	findSubSkillButtons,
	otsuThreshold,
	pixelate,
	type Rect,
	type RgbaImage,
} from "./SubSkillImage";

function createImage(width: number, height: number): RgbaImage {
	const data = new Uint8ClampedArray(width * height * 4).fill(254);
	return { width, height, data };
}

function fill(img: RgbaImage, r: Rect, color: number[]) {
	for (let y = r.y; y < r.y + r.height; y++) {
		for (let x = r.x; x < r.x + r.width; x++) {
			img.data.set(
				[color[0], color[1], color[2], 255],
				(y * img.width + x) * 4,
			);
		}
	}
}

/** Draws a button with a gray border and a dark "text" block. */
function drawButton(img: RgbaImage, r: Rect, badge: boolean) {
	fill(img, r, [180, 180, 180]);
	fill(
		img,
		{ x: r.x + 3, y: r.y + 3, width: r.width - 6, height: r.height - 6 },
		[248, 248, 248],
	);
	fill(
		img,
		{ x: r.x + 100, y: r.y + 40, width: 200, height: 20 },
		[120, 60, 20],
	);
	if (badge) {
		fill(
			img,
			{ x: r.x - 10, y: r.y - 20, width: 120, height: 30 },
			[150, 110, 90],
		);
	}
}

describe("findSubSkillButtons", () => {
	test("finds 5 buttons in the game order", () => {
		const img = createImage(1080, 1200);
		const expected: Rect[] = [
			{ x: 80, y: 300, width: 434, height: 100 },
			{ x: 568, y: 300, width: 434, height: 100 },
			{ x: 80, y: 470, width: 434, height: 100 },
			{ x: 568, y: 470, width: 434, height: 100 },
			{ x: 80, y: 640, width: 434, height: 100 },
		];
		expected.forEach((r, i) => {
			drawButton(img, r, i >= 3);
		});
		// Similar shaped box without a pair (like the nature box)
		drawButton(img, { x: 80, y: 900, width: 434, height: 100 }, false);

		expect(findSubSkillButtons(img)).toEqual(expected);
	});

	test("returns null when buttons are not found", () => {
		const img = createImage(1080, 1200);
		drawButton(img, { x: 80, y: 300, width: 434, height: 100 }, false);
		expect(findSubSkillButtons(img)).toBeNull();
	});
});

describe("binarizeButton", () => {
	test("extracts text area", () => {
		const img = createImage(1080, 1200);
		const button = { x: 80, y: 300, width: 434, height: 100 };
		drawButton(img, button, false);
		const { image, rect } = binarizeButton(img, button);
		expect(rect).toEqual({ x: 180, y: 340, width: 200, height: 20 });
		expect(image.data.every((v) => v === 1)).toBe(true);
	});
});

describe("otsuThreshold", () => {
	test("separates two peaks", () => {
		const hist = Array.from({ length: 256 }, () => 0);
		hist[50] = 100;
		hist[200] = 300;
		const t = otsuThreshold(hist);
		expect(t).toBeGreaterThanOrEqual(50);
		expect(t).toBeLessThan(200);
	});
});

describe("pixelate", () => {
	test("computes density of each cell", () => {
		const bin = {
			width: 4,
			height: 2,
			data: new Uint8Array([1, 1, 0, 1, 1, 1, 0, 0]),
		};
		expect(pixelate(bin, 2, 1)).toEqual({
			width: 2,
			height: 1,
			data: new Uint8Array([1, 0]),
		});
		expect(pixelate(bin, 2, 1, 0.25).data).toEqual(new Uint8Array([1, 1]));
	});
});
