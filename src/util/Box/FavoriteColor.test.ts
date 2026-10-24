import { describe, expect, test } from "vitest";
import {
	emojisToFavoriteMask,
	favoriteColors,
	favoriteMaskToColors,
	favoriteMaskToEmojis,
	toggleFavoriteColor,
} from "./FavoriteColor";

describe("FavoriteColor", () => {
	test("favoriteColors order", () => {
		// The order must not be changed because it is saved as a bit mask
		expect(favoriteColors).toEqual([
			"yellow",
			"green",
			"orange",
			"blue",
			"pink",
			"brown",
			"red",
			"purple",
			"lightblue",
			"gray",
		]);
	});

	test("favoriteMaskToColors", () => {
		expect(favoriteMaskToColors(0)).toEqual([]);
		expect(favoriteMaskToColors(0b1000000101)).toEqual([
			"yellow",
			"orange",
			"gray",
		]);
		// unknown bits are ignored
		expect(favoriteMaskToColors(1 << 20)).toEqual([]);
	});

	test("toggleFavoriteColor", () => {
		expect(toggleFavoriteColor(0, "yellow")).toBe(1);
		expect(toggleFavoriteColor(1, "yellow")).toBe(0);
		expect(toggleFavoriteColor(1, "gray")).toBe(0b1000000001);
		// unknown bits are kept
		expect(toggleFavoriteColor(1 << 20, "green")).toBe((1 << 20) | 2);
	});

	test("favoriteMaskToEmojis", () => {
		expect(favoriteMaskToEmojis(0)).toBe("");
		expect(favoriteMaskToEmojis(0b1111111111)).toBe("💛💚🧡💙🩷🤎❤️💜🩵🩶");
	});

	test("emojisToFavoriteMask", () => {
		expect(emojisToFavoriteMask("")).toBe(0);
		expect(emojisToFavoriteMask("💛💚🧡💙🩷🤎❤️💜🩵🩶")).toBe(0b1111111111);
		expect(emojisToFavoriteMask("❤")).toBe(1 << 6);
		expect(emojisToFavoriteMask("❤️❤️")).toBe(1 << 6);
		expect(emojisToFavoriteMask("💛 💚")).toBe(0b11);
		expect(emojisToFavoriteMask("⭐")).toBeNull();
		expect(emojisToFavoriteMask("yellow")).toBeNull();
	});
});
