import React from 'react';
import { Button } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { InputAreaData, fields } from './InputArea'
import { Rank } from './Rank';
import SleepScore from './SleepScore'
import { BetterSecondSleepData } from './Dialog/BetterSecondSleepDialog';
import { useTranslation, Trans } from 'react-i18next'
import i18next from 'i18next'

type PokemonCount = 3 | 4 | 5 | 6 | 7 | 8;

interface PreviewScoreProps {
    /** pokemon count */
    count: PokemonCount;

    /** form data */
    data: InputAreaData;

    /** score range */
    ranges:MultipleScoreRange;

    /** second sleep detail is clicked */
    onSecondSleepDetailClick: (data:BetterSecondSleepData)=>void;
}

interface MultipleScoreRange {
    /** first sleep range */
    firstSleep: ScoreRange;

    /** second sleep range */
    secondSleep: ScoreRange | null;

    /** required strength to get 1 more pokemon on the second research */
    nextStrength: number | null;
}

class TimeLength {
    /** Hour */
    h: number;

    /** Minute */
    m: number;

    constructor(h:number, m:number) {
        this.h = h;
        this.m = m;
    }

    toString(t:typeof i18next.t):string {
        return t('hhmm', {h: this.h, m: this.m});
    }
}

interface ScoreRange {
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
    minTime: TimeLength;

    /** power when we get minScore */
    minPower: number;

    /** max score to reach this count */
    maxScore: number;

    /** sleep time to get maxScore */
    maxTime: TimeLength;

    /** poewr when we get maxScore */
    maxPower: number;
}

export default function PreviewScore(props:PreviewScoreProps) {
    const { t }  = useTranslation();

    const ranges = props.ranges;
    const range = ranges.firstSleep;
    const firstElement = renderRange(range, props.data, t);
    if (!range.canGet || range.tooMuch) {
        return (
            <div className="preview_count">
                <div className="preview_warning">
                    {firstElement}
                </div>
            </div>
        )
    }
    if (ranges.secondSleep == null) {
        return (
            <div className="preview_count">
                <div className="preview_grid">
                    {firstElement}
                </div>
            </div>
        )
    }
    const secondElement = renderRange(ranges.secondSleep, props.data, t);
    const sum = range.count + ranges.secondSleep.count;
    let nextElement = null;
    if (ranges.nextStrength !== null) {
        const count = ranges.secondSleep.count + 1;
        const secondRequiredStrength = ranges.nextStrength - props.data.strength;

        const onDetailClick = function(event:React.MouseEvent<HTMLElement>) {
            const data:BetterSecondSleepData = {
                first: {
                    count: ranges.firstSleep.count,
                    score: ranges.firstSleep.minScore,
                    strength: props.data.strength,
                },
                second: {
                    count,
                    score: 100 - ranges.firstSleep.minScore,
                    strength: props.data.strength + secondRequiredStrength,
                },
            };
            props.onSecondSleepDetailClick(data);
        }
        
        nextElement = <div className="meet1more">
            <InfoOutlinedIcon/>
                <div>
                    <Trans i18nKey="next strength to get 1 more pokemon"
                        components={{
                            score1: <strong>{ranges.firstSleep.minScore}</strong>,
                            count2: <strong>{count}</strong>,
                            strength2: <strong>{t("num", {n: secondRequiredStrength})}</strong>,
                        }}/>
                    <Button onClick={onDetailClick}>[{t("details")}]</Button>
                </div>
            </div>;
    }
    return (
        <div className="preview_count">
            <div className="sum-tooltip">
                <Trans i18nKey="total n pokemon"
                    components={{
                        n: <strong>{sum}</strong>,
                    }}/>
            </div>
            <div className="preview_grid">
                {firstElement}
                {secondElement}
            </div>
            {nextElement}
        </div>
    )
}

function renderRange(range:ScoreRange, data:InputAreaData, t:typeof i18next.t) {
    const countElement = (
        <div className="count_box">
            <div className="count">
                <span className="ball">◓</span>
                <span className="multiply">×</span>
                <span className="value">{range.count}</span>
            </div>
            {range.power > 0 && <div className="power">
                <span>
                    {t('num', {n: range.power})}
                    {t('range separator')}
                </span>
            </div>}
        </div>
    );
    if (!range.canGet || range.tooMuch) {
        let warningElement;
        if (range.canGet) {
            warningElement = <span>{t('strength too much')}</span>;
        } else {
            const ranks = fields[data.fieldIndex].ranks;
            const rank = new Rank(range.requiredStrength, ranks);
            const percent = Math.floor((range.requiredStrength - rank.thisStrength) /
                (rank.nextStrength - rank.thisStrength) * 100 + 0.5);
            warningElement = <span>
                <Trans i18nKey="strength too low"
                    components={{strength:
                        <>
                            <strong>{t('num', {n: range.requiredStrength})} </strong>
                            (<span className={"rank_ball_" + rank.type}>◓</span>
                            <span className="rank_number">{rank.rankNumber}</span>
                            <span> + {percent}%</span>
                            )
                        </>
                    }}/>
            </span>;
        }

        return (
            <>
                {countElement}
                <div className="warning">
                    {warningElement}
                </div>
            </>
        );
    }
    return (
        <>
            {countElement}
            <div className="start">
                <div className="sleep_time">
                    <SleepScore score={range.minScore}/>
                    <div className="time">
                        {range.minTime.toString(t)}
                        <div className="time_power">{t("num", {n: range.minPower})}</div>
                    </div>
                </div>
            </div>
            <div className="score_separator">{t('range separator')}</div>
            <div className="end">
                <div className="sleep_time">
                    <SleepScore score={range.maxScore}/>
                    <div className="time">
                        {range.maxTime.toString(t)}
                        <div className="time_power">{t("num", {n: range.maxPower})}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * Get minimum sleep time to get the score
 * @param score score
 * @returns sleep time length
 */
export function getMinTimeForScore(score: number): TimeLength {
    const minutes = Math.max(0, Math.ceil((score - 0.5) / 100 * 8.5 * 60));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return new TimeLength(h, m);
}

/**
 * Get maximum sleep time to get the score
 * @param score score
 * @returns sleep time
 */
export function getMaxTimeForScore(score: number): TimeLength {
    const minutes = Math.min(510, Math.ceil((score + 1 - 0.5) / 100 * 8.5 * 60) - 1);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return new TimeLength(h, m);
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
    let secondCount = 3;
    for (let i = 0; i < powers.length; i++) {
        if (powerLeft < powers[i]) {
            break;
        }
        secondCount = 3 + i;
    }
    if (secondCount !== 3 && secondCount !== 4 && secondCount !== 5 &&
        secondCount !== 6 && secondCount !== 7 && secondCount !== 8) {
        return ret;
    }

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
function getScoreRangeForCount(count: PokemonCount, data: InputAreaData,
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

