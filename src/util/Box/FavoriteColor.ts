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
