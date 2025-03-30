import React, { useState } from 'react';
import { InputAreaData } from './InputArea';
import BetterSecondSleepDialog, { BetterSecondSleepData } from './BetterSecondSleepDialog';
import PreviewScore, {getScoreRange} from './PreviewScore';
import { isInCresseliaEvent } from '../../data/events';

export default function GeneralPanel({data: _data}: {data: InputAreaData}) {
    const [isBetterSecondSleepDialogOpen, setBetterSecondSleepOpen] = useState(false);
    const onBetterSecondSleepDialogClose = () => {
        setBetterSecondSleepOpen(false);
    };

    const data = {..._data};
    if (isInCresseliaEvent() && data.isCresseliaInTeam) {
        data.bonus = Math.max(data.bonus, 1.2);
    }

    const [betterSecondSleepData, setBetterSecondSleepData] = useState<BetterSecondSleepData>({
        first: {count: 0, score: 0, strength: 0},
        second: {count: 0, score: 0, strength: 0},
    });
    function onSecondSleepDetailClick(data:BetterSecondSleepData) {
        setBetterSecondSleepData(data);
        setBetterSecondSleepOpen(true);
    }

    return (
        <div className="preview">
            <PreviewScore count={4} data={data} ranges={getScoreRange(4, data)}
                onSecondSleepDetailClick={onSecondSleepDetailClick}/>
            <PreviewScore count={5} data={data} ranges={getScoreRange(5, data)}
                onSecondSleepDetailClick={onSecondSleepDetailClick}/>
            <PreviewScore count={6} data={data} ranges={getScoreRange(6, data)}
                onSecondSleepDetailClick={onSecondSleepDetailClick}/>
            <PreviewScore count={7} data={data} ranges={getScoreRange(7, data)}
                onSecondSleepDetailClick={onSecondSleepDetailClick}/>
            <PreviewScore count={8} data={data} ranges={getScoreRange(8, data)}
                onSecondSleepDetailClick={onSecondSleepDetailClick}/>
            <BetterSecondSleepDialog data={betterSecondSleepData}
                open={isBetterSecondSleepDialogOpen} onClose={onBetterSecondSleepDialogClose}/>
        </div>
    );
}
