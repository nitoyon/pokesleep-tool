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

/** Result of calcLevelByCandy function. */
export type CalcLevelResult = {
    /** Required exp */
    exp: number;
    /** Remaining exp needed after using available candy */
    expLeft: number;
    /** Maximum level reachable with available candy */
    level: number;
    /** Exp within the current level */
    expGot: number;
    /** Required dream shards */
    shards: number;
    /** Used candy */
    candyUsed: number;
    /** Unused candy */
    candyLeft: number;
};

/** Frequency pattern for using growth incense items. */
export type GrowthIncensePolicy = "none" | "fullMoon" |
    "gsd" | "every2Days" | "everyDay";

/** Result of calcDayToGetSleepExp function. */
export type CalcDayToGetSleepExpResult = {
    /** Required exp */
    exp: number;
    /** Exceeded exp */
    expExceeded: number;
    /** Days required to get sleep EXP */
    days: number;
    /** DateTime to get sleep EXP (local time) */
    date: Date;
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
        const expPerCandy = calcExpPerCandy(i, iv.nature, boost);
        const requiredCandy = Math.ceil(requiredExp / expPerCandy);
        shards += dreamShardsPerCandy[i + 1] * requiredCandy * shardRate;
        candy += Math.ceil(requiredExp / expPerCandy);
        carry = expPerCandy * requiredCandy - requiredExp;
    }

    return { exp, candy, shards };
}

/**
 * Calculate how far a Pokémon can level up with available candy.
 * @param iv The Pokémon's IV containing the current level and nature.
 * @param expGot The experience already gained at the current level.
 * @param dstLevel The maximum target level.
 * @param candy Available candy count.
 * @param boost The boost event type, which can be "none", "mini", or "unlimited".
 * @returns Level progress achievable with available candy.
 */
export function calcLevelByCandy(iv: PokemonIv, expGot: number,
    dstLevel: number, candy: number, boost: BoostEvent): CalcLevelResult {
    const srcLevel = iv.level;

    const exp = calcExp(srcLevel, dstLevel, iv) - expGot;
    let expLeft = exp;

    let shards = 0;
    let carry = expGot;
    const shardRate = (boost === "none" ? 1 : boost === "mini" ? 4 : 5);
    let candyLeft = candy;
    let level;
    for (level = srcLevel; level < dstLevel; level++) {
        const requiredExp = calcExp(level, level + 1, iv) - carry;
        const expPerCandy = calcExpPerCandy(level, iv.nature, boost);
        const requiredCandy = Math.ceil(requiredExp / expPerCandy);
        const candyToUse = Math.min(requiredCandy, candyLeft);
        shards += dreamShardsPerCandy[level + 1] * candyToUse * shardRate;
        candyLeft -= candyToUse;
        expLeft -= expPerCandy * candyToUse;
        if (candyToUse < requiredCandy) {
            // Out of candy before reaching next level
            carry += expPerCandy * candyToUse;
            break;
        }
        carry = expPerCandy * candyToUse - requiredExp;
    }
    const candyUsed = candy - candyLeft;

    return { exp, expLeft, level, expGot: carry, shards, candyUsed, candyLeft };
}

/**
 * Calculate the EXP gained from candy.
 * @param level - Current level.
 * @param nature - The Pokémon's nature.
 * @param boost The boost event type, which can be "none", "mini", or "unlimited".
 * @return EXP.
 */
function calcExpPerCandy(level: number, nature: Nature, boost: BoostEvent): number {
    const boostFactor = (boost !== "none" ? 2 : 1);
    if (level < 25) {
        return (nature.isExpGainsUp ? 41 :
            nature.isExpGainsDown ? 29 : 35) * boostFactor;
    }
    if (level < 30) {
        return (nature.isExpGainsUp ? 35 :
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
    const rate = expTypeRate[iv.pokemon.exp];
    if (level1 < 0 || level1 > maxLevel ||
        level2 < 0 || level2 > maxLevel) {
        return 0;
    }

    return Math.round(totalExpToTheLevel[level2] * rate) -
        Math.round(totalExpToTheLevel[level1] * rate);
}

/**
 * Calculate the number of days needed to earn the specified EXP through sleep sessions.
 * @param exp Target EXP to earn.
 * @param expBonus Number of Sleep EXP Bonus (0-5).
 * @param score Expected average sleep score per day.
 * @param expGainRate The Pokémon's exp gain rate by its nature.
 * @param policy Usage pattern for growth incense.
 * @param today Today.
 * @returns The number of days.
 */
export function calcDayToGetSleepExp(exp: number, expBonus: number,
    score: number, expGainRate: number, policy: GrowthIncensePolicy,
    today: Date = new Date()
): CalcDayToGetSleepExpResult {
    const ret: CalcDayToGetSleepExpResult = {
        exp,
        expExceeded: 0,
        days: Number.POSITIVE_INFINITY,
        date: new Date(8640000000000000),
    };


    const baseExp = Math.round(score * (1 + expBonus * 0.14));
    if (baseExp <= 0) {
        return ret;
    }

    // Loop with date variable d set to 1 day before
    // to detect if the previous day was a full moon
    ret.days = 0;
    const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    let d = new Date(utcToday.setDate(utcToday.getDate() - 1));

    while (true) {
        // Get the number of days until the full moon (-1 to 29)
        const dates = getNextFullMoon(d) - 1;

        if (dates > 1) {
            // If the full moon day is ahead
            const expPerDay = Math.floor(baseExp *
                getExpRateForDay("normal", policy) * expGainRate);

            // If the accumulated experience meets the condition,
            // find the day that satisfies it
            if (expPerDay * dates >= exp) {
                const days = Math.ceil(exp / expPerDay);
                ret.days += days;
                ret.expExceeded = expPerDay * days - exp;
                break;
            }

            // Advance d to the day before the specified full moon
            ret.days += dates - 1;
            exp -= expPerDay * (dates - 1);
            d = new Date(d.getTime() + (dates - 1) * 24 * 60 * 60 * 1000);
            continue;
        }
        else if (dates === 0) {
            // When it's a full moon day
            const expPerDay = Math.floor(baseExp *
                getExpRateForDay("fullmoon", policy) * expGainRate);
            ret.days += 1;
            if (expPerDay >= exp) {
                ret.expExceeded = expPerDay - exp;
                break;
            }

            exp -= expPerDay;
            d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
            continue;
        }
        else {
            // When it's the day before or after the full moon
            const expPerDay = Math.floor(baseExp *
                getExpRateForDay("gsd", policy) * expGainRate);
            ret.days += 1;
            if (expPerDay >= exp) {
                ret.expExceeded += expPerDay - exp;
                break;;
            }

            exp -= expPerDay;
            d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
            continue;
        }
    }

    ret.date = new Date();
    ret.date.setDate(ret.date.getDate() + ret.days);
    return ret;
}

function getExpRateForDay(date: "normal" | "gsd" | "fullmoon", policy: GrowthIncensePolicy) {
    const baseExp = date === "fullmoon" ? 3 :
        date === "gsd" ? 2 : 1;
    switch (policy) {
        case "none": return baseExp;
        case "fullMoon": return baseExp === 3 ? 6 : baseExp;
        case "gsd": return baseExp > 1 ? baseExp * 2 : baseExp;
        case "every2Days": return baseExp > 1 ? baseExp * 2 : baseExp * 1.5;
        case "everyDay": return baseExp * 2;
    }
}

const lunarCycle = 29.530588;

/**
 * Return days until next full moon (approximation)
 * @param date date.
 * @returns days.
 */
export function getNextFullMoon(date: Date): number {
    const fullMoonStartRatio = 0.48;
    const fullMoonEndRatio = 0.52;
    const currentAge = getMoonAge(date);
    const currentRatio = currentAge / lunarCycle;

    if (currentRatio > fullMoonStartRatio && currentRatio < fullMoonEndRatio) {
        // Currently in full moon range
        return 0;
    } else if (currentRatio < fullMoonStartRatio) {
        // Next full moon is in this cycle
        return Math.ceil(fullMoonStartRatio * lunarCycle - currentAge);
    } else {
        // Past full moon - next full moon is in the next cycle
        return Math.ceil((1 + fullMoonStartRatio) * lunarCycle - currentAge);
    }
}

/**
 * Detect the day is full moon or not (approximation)
 * @param date The date to be checked.
 * @returns Full moon or not.
 */
export function isFullMoon(date: Date): boolean {
    const age = getMoonAge(date) / lunarCycle;
    return age > 0.48 && age < 0.52;
}

/**
 * Get moon age (approximation)
 * @param date The date to be checked.
 * @returns Moon age.
 */
export function getMoonAge(date: Date): number {
    const reference = new Date(Date.UTC(2000, 0, 6, 18, 14));
    const days = (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24);
    return (days % lunarCycle + lunarCycle) % lunarCycle;
}
