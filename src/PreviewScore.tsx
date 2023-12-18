import React from 'react';
import { InputAreaData } from './InputArea'
import { Rank } from './Rank';
import SleepTime from './SleepTime'
import { t } from 'i18next'

type PokemonCount = 3 | 4 | 5 | 6 | 7 | 8;

type PreviewScoreProps = {
    /** pokemon count */
    count: PokemonCount;

    /** form data */
    data: InputAreaData;
}

interface MultipleScoreRange {
    /** first sleep range */
    firstSleep: ScoreRange;

    /** second sleep range */
    secondSleep: ScoreRange | null;
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
    minTime: string;

    /** power when we get minScore */
    minPower: number;

    /** max score to reach this count */
    maxScore: number;

    /** sleep time to get maxScore */
    maxTime: string;

    /** poewr when we get maxScore */
    maxPower: number;
}

class PreviewScore extends React.Component<PreviewScoreProps> {
    /**
     * Get minimum sleep time to get the score
     * @param score score
     * @returns sleep time
     */
    getMinTimeForScore(score: number): string {
        const minutes = Math.max(0, Math.ceil((score - 0.5) / 100 * 8.5 * 60));
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return t('hhmm', {h, m});
    }

    /**
     * Get maximum sleep time to get the score
     * @param score score
     * @returns sleep time
     */
    getMaxTimeForScore(score: number): string {
        const minutes = Math.min(510, Math.ceil((score + 1 - 0.5) / 100 * 8.5 * 60) - 1);
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return t('hhmm', {h, m});
    }

    /**
     * Get ScoreRange for this props
     * @returns ScoreRange
     */
    getScoreRange(): MultipleScoreRange {
        const range:ScoreRange = this.getScoreRangeForCount(this.props.count, 100);

        let ret = {
            firstSleep: range,
            secondSleep: null,
        };

        if (!this.props.data.secondSleep || !range.canGet || range.tooMuch || range.minScore === 100) {
            return ret;
        }

        // find second count
        const powerLeft = (100 - range.minScore) * this.props.data.strength;
        let secondCount = 3;
        for (let i = 0; i < this.props.data.powers.length; i++) {
            if (powerLeft < this.props.data.powers[i]) {
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
        const secondRange:ScoreRange = this.getScoreRangeForCount(_secondCount, 100 - range.minScore);

        // fix first sleep range
        ret.firstSleep.maxScore = Math.min(range.maxScore, 100 - secondRange.minScore);
        ret.firstSleep.maxTime = this.getMaxTimeForScore(ret.firstSleep.maxScore);
        ret.firstSleep.maxPower = ret.firstSleep.maxScore * this.props.data.strength;

        return {
            firstSleep: range,
            secondSleep: secondRange,
        };
    }

    getScoreRangeForCount(count: PokemonCount, availableScore: number): ScoreRange {
        const strength = this.props.data.strength;
        const powers = this.props.data.powers;
        const power = powers[count - 3];
        const requiredStrength = Math.ceil(power / availableScore);

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
            minTime: this.getMinTimeForScore(minScore),
            minPower: minScore * strength,
            maxScore: maxScore,
            maxTime: this.getMaxTimeForScore(maxScore),
            maxPower: maxScore * strength,
        };
    }

    render() {
        const ranges:MultipleScoreRange = this.getScoreRange();
        const range = ranges.firstSleep;
        const firstElement = this.renderRange(range);
        if (ranges.secondSleep == null) {
            return (
                <div className="preview_count">
                    {firstElement}
                </div>
            )
        } else {
            const secondElement = this.renderRange(ranges.secondSleep);
            const sum = range.count + ranges.secondSleep.count;
            return (
                <div className="preview_count">
                    <div className="sum-tooltip-container">
                        <div className="sum-tooltip">
                            {t('total n pokemon prefix')}
                            <strong>{sum}</strong>
                            {t('total n pokemon suffix')}
                        </div>
                    </div>
                    {firstElement}
                    {secondElement}
                </div>
            )
        }
    }

    renderRange(range:ScoreRange) {
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
                const rank = new Rank(range.requiredStrength,
                    this.props.data.ranks);
                const percent = Math.floor((range.requiredStrength - rank.thisStrength) /
                    (rank.nextStrength - rank.thisStrength) * 1000) / 10;
                warningElement = <span>
                    {t('strength too low prefix')}
                    <strong>{t('num', {n: range.requiredStrength})} </strong>
                     (<span className={"rank_ball_" + rank.type}>◓</span>
                    <span className="rank_number">{rank.rankNumber}</span>
                    <span> + {t('num', {n: range.requiredStrength - rank.thisStrength})}</span>
                    )
                    {t('strength too low suffix')}
                </span>;
            }

            return (
                <div className="preview_sleep">
                    {countElement}
                    <div className="warning">
                        {warningElement}
                    </div>
                </div>
            );
        }
        return (
            <div className="preview_sleep">
                {countElement}
                <div className="score_range">
                    <div className="start">
                        <SleepTime score={range.minScore} time={range.minTime} power={range.minPower}/>
                    </div>
                    <div className="score_separator">{t('range separator')}</div>
                    <div className="end">
                        <SleepTime score={range.maxScore} time={range.maxTime} power={range.maxPower}/>
                    </div>
                </div>
            </div>
        );
    }
}
export default PreviewScore;
