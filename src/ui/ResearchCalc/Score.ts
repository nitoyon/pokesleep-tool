import { InputAreaData } from './InputArea'
import { AmountOfSleep } from '../../util/TimeUtil';
import { PokemonCount, getPokemonCount } from '../../util/PokemonCount';
import fields from '../../data/fields';

export interface MultipleScoreRange {
    /** first sleep range */
    firstSleep: ScoreRange;

    /** second sleep range */
    secondSleep: ScoreRange | null;

    /** required strength to get 1 more pokemon on the second research */
    nextStrength: number | null;
}

export interface ScoreRange {
    /** pokemon count */
    count: PokemonCount;

    /** required power for this count */
    power: number;

    /** can get this count */
    canGet: boolean;

    /** cannot get this count because of too much power */
    tooMuch: boolean;

    /** required strength to reach this count */
    requiredStrength: number;

    /** min score to reach this count */
    minScore: number;

    /** sleep time to get minScore */
    minTime: AmountOfSleep;

    /** power when we get minScore */
    minPower: number;

    /** max score to reach this count */
    maxScore: number;

    /** sleep time to get maxScore */
    maxTime: AmountOfSleep;

    /** poewr when we get maxScore */
    maxPower: number;
}

/**
 * Get minimum sleep time to get the score
 * @param score score
 * @returns sleep time length
 */
export function getMinTimeForScore(score: number): AmountOfSleep {
    return new AmountOfSleep(Math.max(0,
        Math.ceil((score - 0.5) / 100 * 8.5 * 60)));
}

/**
 * Get maximum sleep time to get the score
 * @param score score
 * @returns sleep time
 */
export function getMaxTimeForScore(score: number): AmountOfSleep {
    return new AmountOfSleep(Math.min(510,
        Math.ceil((score + 1 - 0.5) / 100 * 8.5 * 60) - 1));
}

/**
 * Get ScoreRange for the props
 * @param count Pokemon count
 * @param data  Input form data
 * @returns ScoreRange
 */
export function getScoreRange(count:PokemonCount, data:InputAreaData): MultipleScoreRange {
    const range:ScoreRange = getScoreRangeForCount(count, data, 100);
    const powers = fields[data.fieldIndex].powers;

    let ret: MultipleScoreRange = {
        firstSleep: range,
        secondSleep: null,
        nextStrength: null,
    };

    if (!data.secondSleep || !range.canGet || range.tooMuch || range.minScore === 100) {
        return ret;
    }

    // find second count
    const powerLeft = (100 - range.minScore) * data.strength * data.bonus;
    const secondCount = getPokemonCount(powers, powerLeft);

    // get second sleep
    const _secondCount:PokemonCount = secondCount;
    const secondRange:ScoreRange = getScoreRangeForCount(_secondCount, data,
        100 - range.minScore);

    // fix first sleep range
    ret.firstSleep.maxScore = Math.min(range.maxScore, 100 - secondRange.minScore);
    ret.firstSleep.maxTime = getMaxTimeForScore(ret.firstSleep.maxScore);
    ret.firstSleep.maxPower = ret.firstSleep.maxScore * data.strength * data.bonus;

    // calc next strength
    let nextStrength = null;
    if (secondRange.count < 8) {
        const nextCount = secondRange.count + 1 as PokemonCount;
        const oneMoreRange:ScoreRange = getScoreRangeForCount(nextCount, data,
            100 - range.minScore);
        nextStrength = oneMoreRange.requiredStrength;
    }

    return {
        firstSleep: range,
        secondSleep: secondRange,
        nextStrength,
    };
}

/**
 * Get score range for the pokemon count
 *
 * @param count Pokemon count
 * @param data Input data
 * @param availableScore available score (0 - 100)
 * @returns Score range
 */
export function getScoreRangeForCount(count: PokemonCount, data: InputAreaData,
    availableScore: number): ScoreRange {
    const strength = data.strength * data.bonus;
    const powers = fields[data.fieldIndex].powers;
    const power = powers[count - 3];
    const requiredStrength = Math.ceil(power / data.bonus / availableScore);

    // calc minScore
    const minScore = Math.max(1, Math.ceil(power / strength));
    const canGet = minScore <= availableScore;

    // calc maxScore
    let maxScore = availableScore;
    const isLast = (count === 8);
    if (!isLast) {
        const nextPower = powers[count - 2];
        maxScore = Math.max(0, Math.ceil(nextPower / strength) - 1);
        maxScore = Math.min(availableScore, maxScore);
    }
    const tooMuch =  maxScore === 0;

    return {
        count,
        power,
        canGet,
        tooMuch,
        requiredStrength,
        minScore,
        minTime: getMinTimeForScore(minScore),
        minPower: minScore * strength,
        maxScore: maxScore,
        maxTime: getMaxTimeForScore(maxScore),
        maxPower: maxScore * strength,
    };
}
