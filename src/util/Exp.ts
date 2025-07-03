import { ExpType } from '../data/pokemons';
import Nature from './Nature';
import PokemonIv from './PokemonIv';
import { maxLevel } from './PokemonRp';

// special thanks to 
// https://github.com/Kerusu-1984/pokemon-sleep-calc-required-candy/blob/main/src/lib/calculator.ts

const totalExpToTheLevel: number[] = [
    0, 0, 54, 125, 233, 361, 525, 727, 971, 1245, 1560,
    1905, 2281, 2688, 3107, 3536, 3976, 4430, 4899, 5382, 5879,
    6394, 6931, 7489, 8068, 8668, 9290, 9933, 10598, 11284, 11992,
    12721, 13469, 14235, 15020, 15823, 16644, 17483, 18340, 19215, 20108,
    21018, 21946, 22891, 23854, 24834, 25831, 26846, 27878, 28927, 29993,
    31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493,
    54358, 57280, 60257, 63286, 66363,
];

const dreamShardsPerCandy: number[] = [
    0, 0, 14, 18, 22, 27, 30, 34, 39, 44, 48,
    50, 52, 53, 56, 59, 62, 66, 68, 71, 74,
    78, 81, 85, 88, 92, 95, 100, 105, 111, 117,
    122, 126, 130, 136, 143, 151, 160, 167, 174, 184,
    192, 201, 211, 221, 227, 236, 250, 264, 279, 295,
    309, 323, 338, 356, 372, 391, 437, 486, 538, 593,
    651, 698, 750, 804, 866,
];

const expTypeRate: {[key in ExpType]: number} = {
    600: 1,
    900: 1.5,
    1080: 1.8,
    1320: 2.2,
};

/** Boost event type */
export type BoostEvent = "none" | "mini" | "unlimited";

/** Result of calcExpAndCandy function. */
export type CalcExpAndCandyResult = {
    /** Required exp */
    exp: number;
    /** Required candy count */
    candy: number;
    /** Required dream shards */
    shards: number;
};

/**
 * Calculate the experience and candy required to level up a Pokémon.
 * @param iv The Pokémon's IV containing the current level and nature.
 * @param expGot The experience already gained at the current level.
 * @param dstLevel The target level to which the Pokémon should be leveled up.    
 * @param boost The boost event type, which can be "none", "mini", or "unlimited".
 * @returns An object containing the required experience, candy, and dream shards.
 */
export default function calcExpAndCandy(iv: PokemonIv, expGot: number,
    dstLevel: number, boost: BoostEvent): CalcExpAndCandyResult {
    const srcLevel = iv.level;
    if (srcLevel < 0 || srcLevel > maxLevel ||
        dstLevel < 0 || dstLevel > maxLevel ||
        srcLevel >= dstLevel
    ) {
        return {
            exp: 0,
            candy: 0,
            shards: 0,
        };
    }

    // cal exp
    const exp = calcExp(srcLevel, dstLevel, iv) - expGot;

    // calc dream shards
    let shards = 0;
    let candy = 0;
    let carry = expGot;
    const shardRate = (boost === "none" ? 1 : boost === "mini" ? 4 : 5);
    for (let i = srcLevel; i < dstLevel; i++) {
        const requiredExp = calcExp(i, i + 1, iv) - carry;
        const expPerCandy = calcExpFromCandy(i, iv.nature, boost);
        const requiredCandy = Math.ceil(requiredExp / expPerCandy);
        shards += dreamShardsPerCandy[i + 1] * requiredCandy * shardRate;
        candy += Math.ceil(requiredExp / expPerCandy);
        carry = expPerCandy * requiredCandy - requiredExp;
    }

    return { exp, candy, shards };
}

/**
 * Calculate the EXP gained from candy.
 * @param level - Current level.
 * @param nature - The Pokémon's nature.
 * @param boost The boost event type, which can be "none", "mini", or "unlimited".
 * @return EXP.
 */
function calcExpFromCandy(level: number, nature: Nature, boost: BoostEvent): number {
    const boostFactor = (boost !== "none" ? 2 : 1);
    if (level < 25) {
        return (nature.isExpGainsUp ? 42 :
            nature.isExpGainsDown ? 29 : 35) * boostFactor;
    }
    if (level < 30) {
        return (nature.isExpGainsUp ? 36 :
            nature.isExpGainsDown ? 25 : 30) * boostFactor;
    }
    return (nature.isExpGainsUp ? 30 :
        nature.isExpGainsDown ? 21 : 25) * boostFactor;
}

/**
 * Calculate the experience required to level up from level1 to level2.
 * @param level1 - The starting level.
 * @param level2 - The target level.
 * @param iv - The Pokémon's IV containing the experience type.
 * @return The exp required to level up.
 */
export function calcExp(level1: number, level2: number, iv: PokemonIv): number {
    const ratio = expTypeRate[iv.pokemon.exp];
    if (level1 < 0 || level1 > maxLevel ||
        level2 < 0 || level2 > maxLevel) {
        return 0;
    }

    return Math.round(totalExpToTheLevel[level2] * ratio) -
        Math.round(totalExpToTheLevel[level1] * ratio);
}
