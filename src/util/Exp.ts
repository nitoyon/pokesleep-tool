import { ExpType } from '../data/pokemons';
import PokemonIv from './PokemonIv';

// special thanks to 
// https://github.com/Kerusu-1984/pokemon-sleep-calc-required-candy/blob/main/src/lib/calculator.ts

const totalExpToTheLevel: number[] = [
    0, 0, 54, 125, 233, 361, 525, 727, 971, 1245, 1560,
    1905, 2281, 2688, 3107, 3536, 3976, 4430, 4899, 5382, 5879,
    6394, 6931, 7489, 8068, 8668, 9290, 9933, 10598, 11284, 11992,
    12721, 13469, 14235, 15020, 15823, 16644, 17483, 18340, 19215, 20108,
    21018, 21946, 22891, 23854, 24834, 25831, 26846, 27878, 28927, 29993,
    31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493
];

const dreamShardsPerCandy: number[] = [
    0, 0, 14, 18, 22, 27, 30, 34, 39, 44, 48,
    50, 52, 53, 56, 59, 62, 66, 68, 71, 74,
    78, 81, 85, 88, 92, 95, 100, 105, 111, 117,
    122, 126, 130, 136, 143, 151, 160, 167, 174, 184,
    192, 201, 211, 221, 227, 236, 250, 264, 279, 295,
    309, 323, 338, 356, 372, 391, 437, 486, 538, 593
];

const expTypeRatio: {[key in ExpType]: number} = {
    600: 1,
    900: 1.5,
    1080: 1.8,
};

/** Result of calcExpAndCandy function. */
export type CalcExpAndCandyResult = {
    /** Required exp */
    exp: number;
    /** Required candy count */
    candy: number;
    /** Required dream shards */
    shards: number;
};

export default function calcExpAndCandy(iv: PokemonIv, dstLevel: number)
: CalcExpAndCandyResult|undefined {
    const srcLevel = iv.level;
    if (srcLevel < 0 || srcLevel > 60 ||
        dstLevel < 0 || dstLevel > 60) {
        return undefined;
    }
    const level1 = Math.min(srcLevel, dstLevel);
    const level2 = Math.max(srcLevel, dstLevel);

    const ratio = expTypeRatio[iv.pokemon.exp];

    // cal exp
    const exp = calcExp(level1, level2, ratio);

    // cal candy
    const expPerCandy = iv.nature.isExpGainsUp ? 30 :
        iv.nature.isExpGainsDown ? 21 : 25;
    const candy = Math.ceil(exp / expPerCandy);

    // calc dream shards
    let shards = 0;
    let carry = 0;
    for (let i = level1; i < level2; i++) {
        const requiredExp = calcExp(i, i + 1, ratio) - carry;
        const requiredCandy = Math.ceil(requiredExp / expPerCandy);
        shards += dreamShardsPerCandy[i + 1] * requiredCandy;
        carry = expPerCandy * requiredCandy - requiredExp;
    }

    return { exp, candy, shards };
}

function calcExp(level1: number, level2: number, ratio: number) {
    return Math.round(totalExpToTheLevel[level2] * ratio) -
        Math.round(totalExpToTheLevel[level1] * ratio);
}