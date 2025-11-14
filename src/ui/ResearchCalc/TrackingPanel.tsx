import React from 'react';
import { styled } from '@mui/system';
import { Button, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import { InputAreaData, TrackingData } from './ResearchCalcAppConfig';
import TrackingDetail, {
    formatTime, TrackingStage,
} from './TrackingDetail';
import RankBallLabel from './RankBallLabel';
import ScoreTableDialog from './ScoreTableDialog';
import SpawnCountLabel from './SpawnCountLabel';
import TrackingDialog from './TrackingDialog';
import CollapseEx from '../common/CollapseEx';
import MessageDialog from '../Dialog/MessageDialog';
import fields from '../../data/fields';
import Rank from '../../util/Rank';
import { getPokemonCount } from '../../util/PokemonCount';
import i18next from 'i18next'
import { useTranslation, Trans } from 'react-i18next';

const TrackingPanel = React.memo(({data, onChange}: {
    data: InputAreaData,
    onChange: (value: Partial<InputAreaData>) => void;
}) => {
    const { t, i18n } = useTranslation();
    const [isScoreTableDialogOpen, setIsScoreTableDialogOpen] = React.useState(false);
    const [isTrackingDialogOpen, setTrackingDialogOpen] = React.useState(false);
    const [isDetailDialogOpen, setDetailDialogOpen] = React.useState(false);

    const stages = React.useRef<TrackingStage[]>([]);
    const [currentStage, setCurrentStage] = React.useState<TrackingStage>({
        type: 'init', start: new Date(), startMinute: 0, end: new Date(), endMinute: 0,
    });
    const [totalRemainingSeconds, setTotalRemainingSeconds] = React.useState(0);
    const [currentRemainingSeconds, setCurrentRemainingSeconds] = React.useState(0);

    const update = React.useCallback(() => {
        if (data.tracking === undefined) {
            return;
        }
        stages.current = new TrackingDetail(data.tracking).calculateStage();
        if (stages.current.length === 0) {
            return;
        }

        // find current stage
        const now = new Date().getTime();
        let _curStage = stages.current.find(s =>
            s.start.getTime() <= now && now < s.end.getTime()
        );
        if (_curStage === undefined) {
            _curStage = stages.current[stages.current.length - 1];
        }
        setCurrentStage(_curStage);
        setTotalRemainingSeconds(_curStage.type === 'finish' ? 0 :
            Math.ceil((stages.current[stages.current.length - 2].end.getTime() - now) / 1000)
        );
        setCurrentRemainingSeconds(_curStage.type === 'finish' ? 0 :
            Math.ceil((_curStage.end.getTime() - now) / 1000)
        );
    }, [data]);

    React.useEffect(() => {
        update();
        if (data.tracking === undefined) {
            return;
        }
        const timerId = setInterval(() => {
            update();
        }, 1000);
        return () => {
            clearInterval(timerId);
        };
    }, [data, update]);

    const onScoreTableButtonClick = React.useCallback(() => {
        setIsScoreTableDialogOpen(true);
    }, [setIsScoreTableDialogOpen]);
    
    const onScoreTableDialogClose = React.useCallback(() => {
        setIsScoreTableDialogOpen(false);
    }, [setIsScoreTableDialogOpen]);

    const onTrackingButtonClick = React.useCallback(() => {
        setTrackingDialogOpen(true);
    }, []);
    
    const onTrackingDialogClose = React.useCallback(() => {
        setTrackingDialogOpen(false);
    }, []);

    const onStartTracking = React.useCallback((tracking: TrackingData) => {
        onChange({tracking});
    }, [onChange]);

    const onEndTracking = React.useCallback(() => {
        onChange({tracking: undefined});
    }, [onChange]);

    const onDetailClick = React.useCallback(() => {
        setDetailDialogOpen(true);
    }, []);

    const onDetailDialogClose = React.useCallback(() => {
        setDetailDialogOpen(false);
    }, []);

    const start = stages.current.length === 0 ? "" :
    formatTime(stages.current[0].start, i18n.language);
    const end = stages.current.length === 0 ? "" :
    formatTime(stages.current[stages.current.length - 2].end, i18n.language);
    const completed = (data.tracking !== undefined && currentStage.type === 'finish');
    const strength = data.tracking?.strength ?? 0;
    const dp = data.tracking?.dp ?? 0;
    const fieldIndex = data?.tracking?.area ?? 0;
    const field = fields[fieldIndex];
    const rank = new Rank(strength, field.ranks);
    const spawnCount = getPokemonCount(fields[data.fieldIndex].powers, dp);

    return (<StyledTrackingPanel>
        <CollapseEx show={data.tracking !== undefined}>
            <section>
                <article className={currentStage.type}>
                    {completed ? <CheckIcon fontSize="large"/> :
                        <CircularProgress size={30} />
                    }
                    <header>
                        <h2>
                            {t(completed ? 'tracked' : 'tracking')}
                        </h2>
                        <h3>
                            <strong>{start}</strong>
                            {t('range separator')}
                            <strong>{end}</strong>
                            {!completed && <span className="remain">
                                ({t('remaining time', {time: formatSeconds(totalRemainingSeconds, t)})})
                            </span>}
                        </h3>
                        <article>
                            <label>{t('strength')}:</label>
                            <section>
                                <strong>{t('num', {n: data.tracking?.strength ?? 0})}</strong>
                                <small>({t(`area.${fieldIndex}`)}&ensp;<RankBallLabel type={rank.type} number={rank.rankNumber}/>)</small>
                            </section>
                            <label>{t('sleep score')}:</label>
                            <section>
                                <strong>{data.tracking?.score ?? 0}</strong>
                            </section>
                            <label>{t('drowsy power')}:</label>
                            <section>
                                <strong>{t('num', {n: dp})}</strong>
                                <small>(<SpawnCountLabel count={spawnCount}/>)</small>
                            </section>
                        </article>
                    </header>
                </article>
                <footer><Trans i18nKey={`sleep state.${currentStage.type}`}
                    components={{
                        time: <strong>{formatSeconds(currentRemainingSeconds, t)}</strong>,
                        score: <strong>{data.tracking?.score ?? 0}</strong>,
                        detail: <Button onClick={onDetailClick}>[{t('details')}]</Button>,
                        br: <br/>,
                    }}/>
                </footer>
            </section>
        </CollapseEx>
        <div className="buttons">
            <Button startIcon={<ScheduleIcon/>} onClick={onScoreTableButtonClick}>{t('sleep score table')}</Button>
            {completed &&
                <Button startIcon={<TimerOffOutlinedIcon/>} onClick={onEndTracking}>{t('reset')}</Button>
            }
            {!completed && data.tracking &&
                <Button startIcon={<TimerOffOutlinedIcon/>} onClick={onEndTracking} color="error">{t('abort tracking')}</Button>
            }
            {!completed && !data.tracking &&
                <Button startIcon={<TimerOutlinedIcon/>} onClick={onTrackingButtonClick}>{t('start tracking')}</Button>
            }
        </div>
        <ScoreTableDialog open={isScoreTableDialogOpen}
            onClose={onScoreTableDialogClose} bonus={data.bonus} strength={strength}/>
        <TrackingDialog open={isTrackingDialogOpen} data={data}
            onClose={onTrackingDialogClose} onStart={onStartTracking}/>
        <MessageDialog open={isDetailDialogOpen} onClose={onDetailDialogClose}
            message={
                <StyledDetailContent>
                    <h1>{t('aim sleep type')}</h1>
                    <dl>
                        <dt className="dozing">{t('dozing')}</dt>
                        <dd>{t('aim dozing')}</dd>
                        <dt className="snoozing">{t('snoozing')}</dt>
                        <dd>{t('aim snoozing')}</dd>
                        <dt className="slumbering">{t('slumbering')}</dt>
                        <dd>{t('aim slumbering')}</dd>
                    </dl>
                </StyledDetailContent>
            }/>
    </StyledTrackingPanel>);
});

function formatSeconds(seconds: number, t: typeof i18next.t): string {
    if (seconds >= 3600) {
        return t('hhmm_short', {
            h: Math.floor(seconds / 3600),
            m: Math.floor((seconds / 60) % 60),
        });
    }
    if (seconds >= 60) {
        return t('mmss_short', {
            m: Math.floor(seconds / 60),
            s: Math.floor(seconds % 60),
        });
    }
    return t('ss_short', {
        s: Math.floor(seconds % 60),
    });
}

const StyledTrackingPanel = styled('div')({
    '& > div.buttons': {
        textAlign: 'right',
        '& > button': {
            textTransform: 'none',
            '& > span.MuiButton-icon': {
                marginRight: 2,
            },
        },
    },
    '& > div > div > section': {
        border: '1px solid #aaa',
        background: '#f3f3f3',
        borderRadius: 12,
        padding: '0.5rem',
        '& > article': {
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            gap: '0.5rem',
            '& > header > h2': {
                color: '#1976d2',
            },
            '&.finish': {
                '& > svg': {
                    color: '#24d76a'
                },
                '& > header > h2': {
                    color: '#24d76a',
                },
            },
            '& > header': {
                '& > h2': {
                    margin: 0,
                    fontSize: '1.2rem',
                },
                '& > h3': {
                    margin: 0,
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    '& > span': {
                        paddingLeft: '0.5rem',
                        fontSize: '0.8rem',
                    },
                },
                '& > article': {
                    margin: '0.8rem 0 0 0',
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    display: 'grid',
                    gridTemplateColumns: 'max-content 1fr',
                    gap: '0.3rem 0.5rem',
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
        },
        '& > footer': {
            marginTop: '.8rem',
            fontSize: '0.8rem',
            color: '#777',
            '& > button': {
                padding: '0 0 0 0.2rem',
                fontSize: '0.8rem',
                minWidth: 0,
            },
        },
    },
});

const StyledDetailContent = styled('div')({
    '& > h1': {
        fontSize: '1.2rem',
        padding: 0,
        margin: 0,
    },
    '& > dl': {
        margin: '0.8rem 0 0 0',
        fontSize: '0.9rem',
        '& > dt': {
            marginTop: '0.8rem',
            padding: '0.1rem 0.2rem',
            borderRadius: 5,
            display: 'inline',
            '&.dozing': { backgroundColor: '#fdec6e', color: '#862' },
            '&.snoozing': { backgroundColor: '#85fbff', color: '#226' },
            '&.slumbering': { backgroundColor: '#5592fc' },
        },
        '& > dd': {
            fontSize: '0.8rem',
            display: 'block',
            padding: '0.3rem 0 1rem',
            margin: 0,
            '&:last-of-type': {
                paddingBottom: 0,
            }
        },
    }
});

export default TrackingPanel;
