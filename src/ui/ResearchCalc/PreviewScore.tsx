import { styled } from '@mui/system';
import { Button } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { InputAreaData } from './ResearchCalcAppConfig'
import Rank from '../../util/Rank';
import { PokemonCount } from '../../util/PokemonCount';
import SleepScore from './SleepScore'
import { MultipleScoreRange, ScoreRange } from './Score';
import fields from '../../data/fields';
import { BetterSecondSleepData } from './BetterSecondSleepDialog';
import { useTranslation, Trans } from 'react-i18next'
import i18next from 'i18next'

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

export default function PreviewScore(props:PreviewScoreProps) {
    const { t }  = useTranslation();

    const ranges = props.ranges;
    const range = ranges.firstSleep;
    const firstElement = renderRange(range, props.data, t);
    if (!range.canGet || range.tooMuch) {
        return (
            <StyledPreviewScore>
                <div className="preview_warning">
                    {firstElement}
                </div>
            </StyledPreviewScore>
        )
    }
    if (ranges.secondSleep == null) {
        return (
            <StyledPreviewScore>
                <div className="preview_grid">
                    {firstElement}
                </div>
            </StyledPreviewScore>
        )
    }
    const secondElement = renderRange(ranges.secondSleep, props.data, t);
    const sum = range.count + ranges.secondSleep.count;
    let nextElement = null;
    if (ranges.nextStrength !== null) {
        const count = ranges.secondSleep.count + 1;
        const secondRequiredStrength = ranges.nextStrength - props.data.strength;

        const onDetailClick = function() {
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
        <StyledPreviewScore>
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
        </StyledPreviewScore>
    )
}

const StyledPreviewScore = styled('div')({
    padding: '.7rem 0',
    borderBottom: '3px dotted #ddd',

    '& > .preview_grid': {
        display: 'grid',
        width: '100%',
        gridTemplateColumns: '4.5rem max-content 1.5rem max-content',
        rowGap: '.5rem',

        '& > .count_box': {
            width: '5rem',
        },
    },

    '& > .preview_warning': {
        display: 'grid',
        width: '100%',
        gridTemplateColumns: '4.5rem 1fr',
    },

    '& div.count': {
        '& > span.ball': {
            color: '#ff6347',
            fontSize: '1.2rem',
        },
        '& > span.multiply': {
            color: '#666',
            fontSize: '1.2rem',
        },
        '& > span.value': {
            color: '#e6a83a',
            fontSize: '1.4rem',
        },
    },
    '& div.power': {
        color: '#aaaaaa',
        fontSize: '.7rem',
        marginTop: '-.2rem',
        whiteSpace: 'nowrap',
    },

    '& div.start, div.end': {
        paddingTop: '.3rem',
        '& > div.sleep_time': {
            display: 'flex',
            alignItems: 'flex-start',
            '& > div.time': {
                fontSize: '.9rem',
                fontWeight: 700,
                marginLeft: '.3rem',
                marginTop: '0rem',

                '& > div.time_power': {
                    color: '#aaaaaa',
                    fontSize: '.8rem',
                    fontWeight: 500,
                    marginTop: '-.2rem',
                }
            },
        }
    },
    '& div.score_separator': {
        padding: '.3rem .2rem',
        textAlign: 'center',
    },

    '& > .sum-tooltip': {
        display: 'inline-block',
        position: 'relative',
        border: '3px solid #ffffff',
        backgroundColor: '#f7ac33',
        color: 'white',
        fontSize: '.9rem',
        borderRadius: '.5rem',
        padding: '.1rem .5rem',
        boxShadow: '0 0 .1rem #999',
        marginBottom: '.2rem',

        '&::before': {
            content: "''",
            position: 'absolute',
            display: 'block',
            width: '0px',
            left: '50%',
            bottom: 0,
            border: '10px solid transparent',
            borderBottom: 0,
            borderTop: '10px solid #f7ac33',
            transform: 'translate(-50%, calc(100% - .1rem))',
        },

        '& > strong': {
            fontSize: '1rem',
            fontWeight: 700,
        },
    },

    '& div.meet1more': {
        color: '#888',
        fontSize: '.95rem',
        marginTop: '.8rem',
        display: 'flex',
        gap: '.5rem',

        '& > svg': {
            color: '#bbb',
            paddingTop: '.2rem',
        },
        '& strong': {
            fontSize: '1rem',
        },
        '& button': {
            padding: 0,
            minWidth: '2rem',
        },
    },

    '& div.warning': {
        paddingLeft: '2.2rem',
        textIndent: '-1.2rem',
        color: '#666',
        '&::before': {
            content: "'\\26a0\\fe0f'",
        },
        '& .rank_ball_basic': { color: '#ff0000' },
        '& .rank_ball_great': { color: '#0000ff' },
        '& .rank_ball_ultra': { color: '#000000' },
        '& .rank_ball_master': { color: '#cc00cc' },
    }
});

function renderRange(range:ScoreRange, data:InputAreaData, t:typeof i18next.t) {
    const countElement = (
        <div className="count_box">
            <div className="count">
                <span className="ball">◓</span>
                <span className="multiply">×</span>
                <span className="value">{range.count}</span>
            </div>
            <div className="power">
                <span>
                    {t('num', {n: range.power})}
                    {t('range separator')}
                </span>
            </div>
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
