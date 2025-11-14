import React from 'react';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { InputAreaData, TrackingData } from './ResearchCalcAppConfig';
import ScoreTableDialog from './ScoreTableDialog';
import TrackingDialog from './TrackingDialog';
import { useTranslation } from 'react-i18next';

const TrackingPanel = React.memo(({data}: {
    data: InputAreaData,
}) => {
    const { t } = useTranslation();
    const [isScoreTableDialogOpen, setIsScoreTableDialogOpen] = React.useState(false);
    const [isTrackingDialogOpen, setTrackingDialogOpen] = React.useState(false);

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
        console.log("start tracking:", tracking.score);
    }, []);

    const strength = data.strength;

    return (<StyledTrackingPanel>
        <div className="buttons">
            <Button startIcon={<ScheduleIcon/>} onClick={onScoreTableButtonClick}>{t('sleep score table')}</Button>
            <Button startIcon={<TimerOutlinedIcon/>} onClick={onTrackingButtonClick}>{t('start tracking')}</Button>
        </div>
        <ScoreTableDialog open={isScoreTableDialogOpen}
            onClose={onScoreTableDialogClose} bonus={data.bonus} strength={strength}/>
        <TrackingDialog open={isTrackingDialogOpen} data={data}
            onClose={onTrackingDialogClose} onStart={onStartTracking}/>
    </StyledTrackingPanel>);
});

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
});

export default TrackingPanel;
