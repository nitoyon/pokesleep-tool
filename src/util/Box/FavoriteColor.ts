/**
 * Colors of the favorite star.
 *
 * The index is the bit position in the favorite bit mask, so new colors
 * must be appended to the end, and the order must not be changed.
 */
export const favoriteColors = [
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
] as const;

export type FavoriteColor = (typeof favoriteColors)[number];

/**
 * Get the favorite colors in the bit mask.
 * Bits for unknown colors are ignored.
 * @param mask Bit mask of the favorite colors.
 * @returns Favorite colors in the order of `favoriteColors`.
 */
export function favoriteMaskToColors(mask: number): FavoriteColor[] {
	return favoriteColors.filter((_, i) => (mask & (1 << i)) !== 0);
}

/**
 * Toggle the color in the bit mask.
 * @param mask Bit mask of the favorite colors.
 * @param color Color to be toggled.
 * @returns New bit mask.
 */
export function toggleFavoriteColor(
	mask: number,
	color: FavoriteColor,
): number {
	return (mask ^ (1 << favoriteColors.indexOf(color))) >>> 0;
}

/** Emoji of each favorite color (used in CSV/TSV). */
export const favoriteEmojis: Record<FavoriteColor, string> = {
	yellow: "💛",
	green: "💚",
	orange: "🧡",
	blue: "💙",
	pink: "🩷",
	brown: "🤎",
	red: "❤️",
	purple: "💜",
	lightblue: "🩵",
	gray: "🩶",
};

/**
 * Convert the bit mask of the favorite colors to emojis.
 * @param mask Bit mask of the favorite colors.
 * @returns Emojis in the order of `favoriteColors`.
 */
export function favoriteMaskToEmojis(mask: number): string {
	return favoriteMaskToColors(mask)
		.map((color) => favoriteEmojis[color])
		.join("");
}

/**
 * Parse emojis of the favorite colors.
 *
 * Variation selectors (U+FE0F) and whitespace are ignored, so both
 * "❤️" and "❤" are read as red.
 * @param text Text containing emojis.
 * @returns Bit mask of the favorite colors, or null if the text contains
 *          other characters.
 */
export function emojisToFavoriteMask(text: string): number | null {
	let mask = 0;
	for (const ch of text.replace(/[\uFE0F\s]/g, "")) {
		const index = favoriteColors.findIndex(
			(color) => favoriteEmojis[color].replace(/\uFE0F/g, "") === ch,
		);
		if (index === -1) {
			return null;
		}
		mask |= 1 << index;
	}
	return mask;
}
