import type { PokemonType } from "../data/pokemons";

/**
 * Base berry strength per Pokémon type.
 */
export const berryBaseStrength: { [type in PokemonType]: number } = {
	normal: 28,
	fire: 27,
	water: 31,
	electric: 25,
	grass: 30,
	ice: 32,
	fighting: 27,
	poison: 32,
	ground: 29,
	flying: 24,
	psychic: 26,
	bug: 24,
	rock: 30,
	ghost: 26,
	dragon: 35,
	dark: 31,
	steel: 33,
	fairy: 26,
};

/**
 * Calculates the berry strength for a Pokémon at a given level,
 * optionally applying a field bonus and a berry strength multiplier.
 *
 * @param type - Pokémon type.
 * @param level - Pokémon level.
 * @param fieldBonus - Area bonus in percent (e.g. 25 means 25%). Defaults to 0.
 * @param berryStrengthMultiplier - Multiplier for favorite berry etc. Defaults to 1.
 */
export function getBerryStrength(
	type: PokemonType,
	level: number,
	fieldBonus = 0,
	berryStrengthMultiplier = 1,
): number {
	const b0 = berryBaseStrength[type];
	const rawStrength = Math.max(
		b0 + level - 1,
		Math.round(1.025 ** (level - 1) * b0),
	);
	const withFieldBonus = Math.ceil(rawStrength * (1 + fieldBonus / 100));
	return Math.ceil(withFieldBonus * berryStrengthMultiplier);
}

export function getBerryRank(type: PokemonType): number {
	return (
		Object.values(berryBaseStrength)
			.sort()
			.reverse()
			.indexOf(berryBaseStrength[type]) + 1
	);
}
