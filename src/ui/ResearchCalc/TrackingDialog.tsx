import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { InputAreaData, TrackingData } from './ResearchCalcAppConfig';
import { getScoreRangeForCount } from './Score';
import {
    getAverageMinuteForScore, getTrackingPeriod, minutesTakenToFallAsleep,
} from './TrackingDetail';
import MessageDialog from '../Dialog/MessageDialog';
import RankBallLabel from './RankBallLabel';
import SleepScore from './SleepScore';
import SpawnCountLabel from './SpawnCountLabel';
import ArrowButton from '../common/ArrowButton';
import CollapseEx from '../common/CollapseEx';
import SliderEx from '../common/SliderEx';
import fields from '../../data/fields';
import { getPokemonCount, PokemonCount } from '../../util/PokemonCount';
import Rank from '../../util/Rank';
import { AmountOfSleep } from '../../util/TimeUtil';
import { useTranslation, Trans } from 'react-i18next';

const TrackingDialog = React.memo(({data, open, onClose, onStart}: {
    data: InputAreaData,
    open: boolean,
    onClose: () => void,
    onStart: (data: TrackingData) => void,
}) => {
    const { t, i18n } = useTranslation();
    const [goPlusWarningShown, setGoPlusWarningShown] = React.useState(false);
    const [score, setScore] = React.useState(100);
    const [initialStart, initialEnd] = getTrackingPeriod(new Date(), score, i18n.language);
    const [start, setStart] = React.useState(initialStart);
    const [end, setEnd] = React.useState(initialEnd);

    const onGoPlusWarningClick = React.useCallback(() => {
        setGoPlusWarningShown(true);
    }, []);
    const onGoPlusWarningClose = React.useCallback(() => {
        setGoPlusWarningShown(false);
    }, []);
    
    const updateTime = React.useCallback((s: number) => {
        const [newStart, newEnd] = getTrackingPeriod(new Date(), s, i18n.language);
        if (start !== newStart) {
            setStart(newStart);
        }
        if (end !== newEnd) {
            setEnd(newEnd);
        }
    }, [i18n.language, start, end]);
    const onScoreDownClick = React.useCallback(() => {
        const newScore = Math.max(0, score - 1);
        setScore(newScore);
        updateTime(newScore);
    }, [score, updateTime]);
    const onScoreUpClick = React.useCallback(() => {
        const newScore = Math.min(100, score + 1);
        setScore(newScore);
        updateTime(newScore);
    }, [score, updateTime]);
    const onScoreChange = React.useCallback((value: number) => {
        setScore(value);
        updateTime(value);
    }, [updateTime]);

    const onCountChange = React.useCallback((count: PokemonCount) => {
        const scores = getScoreRangeForCount(count, data, 100);
        setScore(scores.minScore);
        updateTime(scores.minScore);
    }, [data, updateTime]);

    const onStartClick = React.useCallback(() => {
        onStart({
            score,
            start: Math.floor(new Date().getTime() / 1000),
            area: data.fieldIndex,
            strength: data.strength,
            dp: Math.round(data.strength * data.bonus * score),
        });
        onClose();
    }, [data, score, onStart, onClose]);

    React.useEffect(() => {
        if (!open) {
            return;
        }
        updateTime(score);
        const id = setInterval(() => {
            updateTime(score);
        }, 1000);
        return () => {
            clearInterval(id);
        };
    }, [open, updateTime, score]);

    if (!open) {
        return <></>;
    }

    const buttons: React.ReactNode[] = [];
    for (let i = 4; i <= 8; i++) {
        const count = i as PokemonCount;
        const scores = getScoreRangeForCount(count, data, 100);
        if (!scores.canGet || scores.tooMuch) {
            continue;
        }
        const isCurrent = (scores.minScore <= score && score <= scores.maxScore);
        buttons.push(<Button variant="outlined" key={i}
            className={isCurrent ? "selected" : ""}
            onClick={() => {onCountChange(count)}}>
            <SpawnCountLabel count={i}/>
        </Button>)
    }

    const hhmm = new AmountOfSleep(Math.max(90,
        getAverageMinuteForScore(score) + minutesTakenToFallAsleep));
    const dp = Math.round(score * data.strength * data.bonus);
    const rank = new Rank(data.strength, fields[data.fieldIndex].ranks);
    const spawnCount = getPokemonCount(fields[data.fieldIndex].powers, dp);

    return (<>
        <StyledDialog open={open} onClose={onClose}>
            <DialogContent>
                <div className="notice">
                    <p>{t('tracking title')}</p>
                    <label>❶</label>
                    <div>
                        {t('tracking desc1')}
                        <Button onClick={onGoPlusWarningClick}>{t('tracking go plus+ title')}</Button>
                    </div>
                    <label>❷</label>
                    <div>{t('tracking desc2')}</div>
                    <label>❸</label>
                    <div>{t('tracking desc3')}</div>
                </div>
                <label>{t('sleep score')}:</label>
                <header>
                    <SleepScore score={score}/>
                    <div className="slider">
                        <ArrowButton label="◀" disabled={score === 1} onClick={onScoreDownClick}/>
                        <SliderEx min={1} max={100} size="small" style={{userSelect: "none"}}
                            value={score} onChange2={onScoreChange}/>
                        <ArrowButton label="▶" disabled={score === 100} onClick={onScoreUpClick}/>
                    </div>
                    <div className="buttons">
                        {buttons}
                    </div>
                </header>
                <CollapseEx show={score < 17}>
                    <section className="warning">
                        <Trans i18nKey="score is too low"
                            components={{score: <strong>{score}</strong>}}/>
                    </section>
                </CollapseEx>
                <div className="grid">
                    <label>{t('strength2')}:</label>
                    <section>
                        <strong>{t('num', {n: data.strength})}</strong><br/>
                        <small>({t(`area.${data.fieldIndex}`)}&ensp;<RankBallLabel type={rank.type} number={rank.rankNumber}/>)</small>
                    </section>
                    <label>{t('drowsy power')}:</label>
                    <section>
                        <strong>{t('num', {n: dp})}</strong>
                        <small>(<SpawnCountLabel count={spawnCount}/>)</small>
                    </section>
                    <label>{t('time range')}:</label>
                    <section style={{display: 'block'}}>
                        <span>
                            <strong>{start}</strong>
                            {t('range separator')}
                            <strong>{end}</strong>
                        </span>
                        <small style={{display: 'block'}}>({hhmm.toString(t)})</small>
                    </section>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onStartClick} variant="contained" size="small">
                    {t('start tracking')}
                </Button>
                <Button onClick={onClose} size="small">{t('cancel')}</Button>
            </DialogActions>
        </StyledDialog>
        <MessageDialog open={goPlusWarningShown} onClose={onGoPlusWarningClose}
            message={<>
                <p style={{fontSize: '0.9rem', margin: 0}}>{t('tracking go plus+ detail.0')}</p>
                <p style={{fontSize: '0.9rem', margin: '0.5rem 0'}}>{t('tracking go plus+ detail.1')}</p>
                <p style={{fontSize: '0.9rem', margin: 0}}>{t('tracking go plus+ detail.2')}</p>
            </>}
        />
    </>);
});

export default TrackingDialog;

const StyledDialog = styled(Dialog)({
    '& div.MuiDialogContent-root': {
        minWidth: '250px',
        paddingBottom: "0.5rem",
        '& > div.notice': {
            gap: '0.5rem 0.3rem',
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            fontSize: '0.9rem',
            marginBottom: '1.4rem',
            '& > p': {
                gridColumn: '1 / -1',
                fontSize: '0.9rem',
                margin: '0 0 0.4rem 0',
                lineHeight: 1.2,
            },
            '& > label': {
                color: '#24da6d',
            },
            '& > div': {
                fontSize: '0.8rem',
                '& > button': {
                    fontSize: '0.8rem',
                    lineHeight: 1.2,
                    padding: 0,
                    textTransform: 'none',
                    textAlign: 'left',
                },
            },
        },
        '& > label': {
            fontSize: '0.9rem',
            marginTop: '1rem',
            display: 'block',
            '&:first-of-type': {
                marginTop: '0',
            },
        },
        '& > header': {
            paddingTop: '0.2rem',
            display: 'grid',
            gridTemplateColumns: '40px 1fr',
            gap: '0.2rem 0.6rem',
            '& > div:first-of-type': {
                gridRow: '1 / span 2',
            },
            '& > div.slider': {
                display: 'flex',
                alignItems: 'center',
                gap: '.7rem',
                height: '1.8rem',
                '& .MuiSlider-track': {
                    color: '#489eff',
                    height: '.4rem',
                },
                '& .MuiSlider-rail': {
                    color: '#cccccc',
                    height: '.4rem',
                },
                '& .MuiSlider-thumb': {
                    color: '#489eff',
                },
            },
            '& > div.buttons': {
                gridColumn: '2 / -1',
                '& > button': {
                    minWidth: 0,
                    fontSize: '0.8rem',
                    lineHeight: 1,
                    padding: '0.2rem 0.2rem',
                    marginRight: '0.2rem',
                    borderColor: '#bbb',
                    '&.selected': {
                        background: '#eee',
                    },
                    '& > span': {
                        padding: 0,
                    },
                },
            },
        },
        '& > div section.warning': {
            paddingTop: '0.8rem',
            paddingLeft: '1.2rem',
            textIndent: '-1.2rem',
            fontSize: '0.8rem',
            color: '#666',
            '&::before': {
                content: "'\\26a0\\fe0f'",
            },
        },
        '& > div.grid': {
            marginTop: '1.5rem',
            gap: '0.8rem 0.7rem',
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            fontSize: '0.9rem',
            lineHeight: 1.3,
            '& > section': {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0 0.4rem',
                alignItems: 'center',
                '& > small': {
                    textWrap: 'nowrap',
                    '& > div': {
                        display: 'inline',
                    },
                },
            },
        },
    },
});