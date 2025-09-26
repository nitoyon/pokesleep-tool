import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions, DialogTitle,
    ToggleButtonGroup, ToggleButton } from '@mui/material';
import SleepScore from './SleepScore';
import {getMinTimeForScore, getMaxTimeForScore} from './Score';
import { useTranslation } from 'react-i18next';

interface ScoreTableDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
    /** event bonus (multiplier) */
    bonus: number;
    /** Current strength.  */
    strength: number;
}

const ScoreTableDialog = React.memo(({open, onClose, bonus, strength}: ScoreTableDialogProps) => {
    const { t } = useTranslation();
    const ref0 = React.useRef<HTMLDivElement|null>(null);
    const ref25 = React.useRef<HTMLDivElement|null>(null);
    const ref50 = React.useRef<HTMLDivElement|null>(null);
    const ref75 = React.useRef<HTMLDivElement|null>(null);
    const ref100 = React.useRef<HTMLDivElement|null>(null);

    const onMoveClick = React.useCallback((_: React.MouseEvent, val: number|null) => {
        if (val === null) { return; }
        let element: HTMLDivElement|null = null;
        switch (val) {
            case 0: element = ref0?.current; break;
            case 25: element = ref25?.current; break;
            case 50: element = ref50?.current; break;
            case 75: element = ref75?.current; break;
            case 100: element = ref100?.current; break;
        }
        if (element !== null) {
            element.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    }, []);

    if (!open) {
        return <></>;
    }

    const scores = [];
    for (let i = 0; i <= 100; i++) {
        scores.push(<div className="sleep_time" key={i}
            ref={i === 0 ? ref0 : i === 25 ? ref25 : i === 50 ? ref50 : 
                i === 75 ? ref75 : i === 100 ? ref100 : null}>
            <SleepScore score={i}/>
            <div className="time">
                {getMinTimeForScore(i).toString(t)}
                <> {t('range separator')} </>
                {getMaxTimeForScore(i).toString(t)}
                <div className="time_power">{t('num', {n: i * strength * bonus})}</div>
            </div>
        </div>);
    }

    return (
        <StyledDialog open={open} onClose={onClose} scroll="paper">
            <DialogTitle>{t('sleep score table')}</DialogTitle>
            <div className="sleep_score_table">
                {scores}
            </div>
            <div className="form">
                <ToggleButtonGroup onChange={onMoveClick} exclusive>
                    <ToggleButton value={0}>0</ToggleButton>
                    <ToggleButton value={25}>25</ToggleButton>
                    <ToggleButton value={50}>50</ToggleButton>
                    <ToggleButton value={75}>75</ToggleButton>
                    <ToggleButton value={100}>100</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </StyledDialog>
    );
});

export default ScoreTableDialog;

const StyledDialog = styled(Dialog)({
    '& div.form': {
        margin: '.4rem 1.2rem 0 1.2rem',
        '& > div > button': {
            width: '3rem',
        },
    },
    '& div.sleep_score_table': {
        overflow: 'scroll',
        padding: '0 1rem',
        '& > div.sleep_time': {
            margin: '.4rem 0',
        },
    },    
});