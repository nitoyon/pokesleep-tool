// Minimal PNG decoder / encoder for scripts (8-bit, non-interlaced).

import * as zlib from "node:zlib";
import type { RgbaImage } from "../src/util/SubSkillImage";

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function decodePng(buf: Buffer): RgbaImage {
	if (!buf.subarray(0, 8).equals(SIGNATURE)) {
		throw new Error("Not a PNG file");
	}
	let pos = 8;
	let width = 0;
	let height = 0;
	let bitDepth = 0;
	let colorType = 0;
	let interlace = 0;
	let palette: Buffer | null = null;
	let trns: Buffer | null = null;
	const idat: Buffer[] = [];
	while (pos < buf.length) {
		const len = buf.readUInt32BE(pos);
		const type = buf.toString("ascii", pos + 4, pos + 8);
		const body = buf.subarray(pos + 8, pos + 8 + len);
		pos += 12 + len;
		if (type === "IHDR") {
			width = body.readUInt32BE(0);
			height = body.readUInt32BE(4);
			bitDepth = body[8];
			colorType = body[9];
			interlace = body[12];
		} else if (type === "PLTE") {
			palette = body;
		} else if (type === "tRNS") {
			trns = body;
		} else if (type === "IDAT") {
			idat.push(body);
		} else if (type === "IEND") {
			break;
		}
	}
	if (bitDepth !== 8 || interlace !== 0) {
		throw new Error("Only 8-bit non-interlaced PNG is supported");
	}
	const channels: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
	const bpp = channels[colorType];
	if (bpp === undefined) {
		throw new Error(`Unsupported color type: ${colorType}`);
	}

	const raw = zlib.inflateSync(Buffer.concat(idat));
	const stride = width * bpp;
	const pixels = new Uint8Array(stride * height);
	for (let y = 0; y < height; y++) {
		const filter = raw[y * (stride + 1)];
		const src = y * (stride + 1) + 1;
		const dst = y * stride;
		for (let x = 0; x < stride; x++) {
			const a = x >= bpp ? pixels[dst + x - bpp] : 0;
			const b = y > 0 ? pixels[dst - stride + x] : 0;
			const c = x >= bpp && y > 0 ? pixels[dst - stride + x - bpp] : 0;
			let v = raw[src + x];
			switch (filter) {
				case 1:
					v += a;
					break;
				case 2:
					v += b;
					break;
				case 3:
					v += (a + b) >> 1;
					break;
				case 4: {
					const p = a + b - c;
					const pa = Math.abs(p - a);
					const pb = Math.abs(p - b);
					const pc = Math.abs(p - c);
					v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
					break;
				}
			}
			pixels[dst + x] = v & 255;
		}
	}

	const data = new Uint8ClampedArray(width * height * 4);
	for (let i = 0; i < width * height; i++) {
		const s = i * bpp;
		const d = i * 4;
		if (colorType === 0) {
			data.set([pixels[s], pixels[s], pixels[s], 255], d);
		} else if (colorType === 2) {
			data.set([pixels[s], pixels[s + 1], pixels[s + 2], 255], d);
		} else if (colorType === 3) {
			const idx = pixels[s];
			if (palette === null) throw new Error("PLTE not found");
			const alpha = trns !== null && idx < trns.length ? trns[idx] : 255;
			data.set(
				[palette[idx * 3], palette[idx * 3 + 1], palette[idx * 3 + 2], alpha],
				d,
			);
		} else if (colorType === 4) {
			data.set([pixels[s], pixels[s], pixels[s], pixels[s + 1]], d);
		} else {
			data.set([pixels[s], pixels[s + 1], pixels[s + 2], pixels[s + 3]], d);
		}
	}
	return { width, height, data };
}

const crcTable = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(buf: Buffer): number {
	let c = 0xffffffff;
	for (const b of buf) {
		c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
	}
	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, body: Buffer): Buffer {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(body.length);
	const typeAndBody = Buffer.concat([Buffer.from(type, "ascii"), body]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(typeAndBody));
	return Buffer.concat([len, typeAndBody, crc]);
}

/** Encodes RGBA image to PNG. */
export function encodePng(img: RgbaImage): Buffer {
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(img.width, 0);
	ihdr.writeUInt32BE(img.height, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // RGBA
	const stride = img.width * 4;
	const raw = Buffer.alloc((stride + 1) * img.height);
	for (let y = 0; y < img.height; y++) {
		raw[y * (stride + 1)] = 0;
		raw.set(
			img.data.subarray(y * stride, (y + 1) * stride),
			y * (stride + 1) + 1,
		);
	}
	return Buffer.concat([
		SIGNATURE,
		chunk("IHDR", ihdr),
		chunk("IDAT", zlib.deflateSync(raw)),
		chunk("IEND", Buffer.alloc(0)),
	]);
}
