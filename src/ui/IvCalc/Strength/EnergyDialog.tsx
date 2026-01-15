import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from '../IvState';
import PokemonIv from '../../../util/PokemonIv';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { EnergyResult } from '../../../util/Energy';
import { EnergyChart } from '../Chart/EnergyChart';
import EnergyPanel from '../Panel/EnergyPanel';
import { useElementWidth } from '../../common/Hook';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
 } from '@mui/material';
import { useTranslation } from 'react-i18next';

const EnergyDialog = React.memo(({open, iv, energy, parameter, onClose, dispatch}: {
    open: boolean,
    iv: PokemonIv,
    energy: EnergyResult,
    parameter: StrengthParameter,
    onClose: () => void,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const [width, dialogRef] = useElementWidth();

    return <StyledEnergyDialog open={open} onClose={onClose}>
        <DialogTitle ref={dialogRef}>
            <EnergyChart width={width - 20} period={parameter.period} result={energy}/>
        </DialogTitle>
        <DialogContent>
            <EnergyPanel energy={energy} dispatch={dispatch}
                iv={iv} parameter={parameter}/>
        </DialogContent>
        <DialogActions disableSpacing>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledEnergyDialog>;
});

const StyledEnergyDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
        maxHeight: 'calc(100% - 20px)',
        '& > .MuiDialogTitle-root': {
            padding: '0.5rem 10px',
            fontSize: '1rem',
            '& > svg': {
                flexShrink: 0,
                userSelect: 'none',
            },
        },
        '& > .MuiDialogContent-root': {
            padding: '0 1rem',
        },
    },
});

export default EnergyDialog;
