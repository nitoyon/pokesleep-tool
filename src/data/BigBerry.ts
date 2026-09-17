import type { PokemonData } from "./pokemons";

/**
 * Result of {@link getEventBerryRate}.
 */
export interface BigBerryRate {
	/** Probability of getting the big berry (0.12 means 12%) */
	rate: number;
	/** Number of big berries obtained */
	count: number;
}

/** Pokémon ID of Mew */
const MEW_ID = 151;
/** Pokémon ID of Mewtwo */
const MEWTWO_ID = 150;

/**
 * Get the big berry rate for the given event and Pokémon.
 *
 * @param name Event name.
 * @param pokemon Pokémon to check.
 * @returns Event berry rate.
 */
export function getBigBerryRate(
	name: string,
	pokemon: PokemonData,
): BigBerryRate {
	if (name === "mewtwo1") {
		if (pokemon.id === MEW_ID || pokemon.id === MEWTWO_ID) {
			return { rate: 0.12, count: 2 };
		}
		if (pokemon.type === "psychic") {
			return { rate: 0.06, count: 1 };
		}
		return { rate: 0.03, count: 1 };
	}
	return { rate: 0, count: 0 };
}
