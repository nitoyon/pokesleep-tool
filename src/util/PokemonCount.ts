/** Pokemon count (3 ~ 8) */
export type PokemonCount = 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Get the number of pokemon we can encounter from the given drowsy power.
 * @param powers An array of drowsy powers to encounter (n + 3) Pokemons
 *               in current research area.
 * @param power  The given drowsy power.
 * @returns The number of Pokemons we can encounter.
 */
export function getPokemonCount(powers: number[], power: number): PokemonCount {
    for (let i = 1; i < 6; i++) {
        if (power < powers[i]) {
            return i + 2 as PokemonCount;
        }
    }
    return 8;
}
