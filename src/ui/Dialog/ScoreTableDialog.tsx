import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@mui/material';
import SleepScore from '../SleepScore';
import {getMinTimeForScore, getMaxTimeForScore} from '../ResearchCalc/PreviewScore';
import { useTranslation } from 'react-i18next';

interface ScoreTableDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
}

export default function ScoreTableDialog({open, onClose}: ScoreTableDialogProps) {
    const { t } = useTranslation();

    const scores = [];
    for (let i = 0; i <= 100; i++) {
        scores.push(<React.Fragment key={i}>
            <SleepScore score={i}/>
            <span>{getMinTimeForScore(i).toString(t)}</span>
            <span>{t('range separator')}</span>
            <span>{getMaxTimeForScore(i).toString(t)}</span>
        </React.Fragment>);
    }

    return (
        <StyledDialog open={open} onClose={onClose} scroll="paper">
            <DialogTitle>{t('sleep score table')}</DialogTitle>
            <DialogContent dividers>
                <div className="sleep_score_table">
                    {scores}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </StyledDialog>
    );
}

const StyledDialog = styled(Dialog)({
    '& div.sleep_score_table': {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto',
        rowGap: '.5rem',
        columnGap: '.3rem',
        '& > span': {
            fontSize: '.9rem',
            paddingTop: '.4rem',
        },
    },    
});