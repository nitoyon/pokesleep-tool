import React from 'react';
import { styled } from '@mui/system';
import { frequencyToString, formatHoursLong } from '../../../util/TimeUtil';
import EnergyIcon from '../../Resources/EnergyIcon';
import { useTranslation } from 'react-i18next';

const EnergyPreviewPanel = React.memo(({baseFreq, pityProc, display}: {
    baseFreq: number,
    pityProc?: number,
    display: "frequency"|"count"|"full"|"pity",
}) => {
    const { t } = useTranslation();

    const convertToVal = (rate: number) => {
        switch (display) {
            case "frequency":
                return frequencyToString(Math.floor(baseFreq * rate), t);
            case "count":
                return t('help count per hour', {n: (3600 / baseFreq / rate).toFixed(2)});
            case "pity":
                return formatHoursLong(
                    (pityProc ?? 0) * (baseFreq * rate / 3600),
                    t);
        }
        return "";
    };
    const val0 = convertToVal(1);
    const val40 = convertToVal(0.66);
    const val60 = convertToVal(0.58);
    const val80 = convertToVal(0.52);
    const val100 = convertToVal(0.45);

    return <StyledEnergyPreview>
        <span className="energy"><EnergyIcon energy={100}/>81{t('range separator')}150</span>
        <span>{val100}</span>
        <span className="energy"><EnergyIcon energy={80}/>61{t('range separator')}80</span>
        <span>{val80}</span>
        <span className="energy"><EnergyIcon energy={60}/>41{t('range separator')}60</span>
        <span>{val60}</span>
        <span className="energy"><EnergyIcon energy={40}/>1{t('range separator')}40</span>
        <span>{val40}</span>
        <span className="energy"><EnergyIcon  energy={20}/>0</span>
        <span>{val0}</span>
    </StyledEnergyPreview>;
});

const StyledEnergyPreview = styled('article')({
    margin: '0 1rem 1rem',
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gridGap: '1rem',
    rowGap: '0.5rem',
    fontSize: '0.9rem',
    alignItems: 'start',
    '& > span.energy': {
        display: 'flex',
        alignItems: 'center',
    },
});

export default EnergyPreviewPanel;
