import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SleepScore from '../SleepScore';
import {getMinTimeForScore, getMaxTimeForScore} from './PreviewScore';
import { useTranslation, Trans } from 'react-i18next';

interface BetterSecondSleepDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
    /** display data */
    data: BetterSecondSleepData;
}

export interface BetterSecondSleepData {
    /** first sleep */
    first: BetterSecondSleepEntry;
    /** second sleep */
    second: BetterSecondSleepEntry;
}

interface BetterSecondSleepEntry {
    /** pokemon count */
    count: number;
    /** strength */
    strength: number;
    /** sleep score */
    score: number;
}

export default function BetterSecondSleepDialog({open, onClose, data}: BetterSecondSleepDialogProps) {
    const { t } = useTranslation();

    if (!open) {
        return <></>;
    }

    const details = [];
    for (let i = 0; i < 2; i++) {
        const entry = [data.first, data.second][i];
        const minTime = getMinTimeForScore(entry.score).toString(t);
        const maxTime = getMaxTimeForScore(entry.score).toString(t);
        details.push(<div className="better_preview" key={i}>
            <div className="ball">◓</div>
            <span className="ball_value">{entry.count}</span>
            <span className="strength"><LocalFireDepartmentIcon/></span>
            <span className="strength_value">
                {t("num", {n: entry.strength})}
                {i === 1 && " " + t('range separator')}
            </span>
            <SleepScore score={entry.score}/>
            <span className="time_value">
                <span>{minTime}</span>
                <span> {t('range separator')} </span>
                {i === 0 && <span>{maxTime}</span>}
            </span>
        </div>);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <StyledContent dividers className="better_dialog">
                <Trans i18nKey="next strength to get 1 more pokemon"
                    components={{
                        count2: <strong>{data.second.count}</strong>,
                        score1: <strong>{data.first.score}</strong>,
                        strength2: <strong>{t("num", {n: data.second.strength - data.first.strength})}</strong>,
                    }}/>
                <h3>{t("first sleep")}</h3>
                <div>{details[0]}</div>
                <h3>{t("second sleep")}</h3>
                <div>{details[1]}</div>
            </StyledContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}

const StyledContent = styled(DialogContent)({
    '& > h3': {
        marginBottom: '.2rem',
        fontSize: '1.1rem',
    },

    '& div.better_preview': {
        padding: '0 .5rem',
        display: 'grid',
        gridTemplateColumns: '2.5rem auto',
        gap: '.5rem .3rem',
        alignItems: 'center',

        '& > div.ball': {
            color: '#ff6347',
            textAlign: 'center',
            alignItems: 'center',
            fontSize: '1.3rem',
        },

        '& > span.ball_value': {
            fontSize: '1.3rem',
        },

        '& > span.strength': {
            color: '#ff944b',
            textAlign: 'center',
            '& > svg': {
                transform: 'scale(1.2)',
            },
        },

        '& > span.strength_value': {
            fontSize: '1.2rem',
        },
    },
});