import React from 'react';
import { styled } from '@mui/system';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import PokemonIv from '../../../util/PokemonIv';
import {
    FrequencyInfoState, FrequencyInfoPreview, FrequencyForm,
} from '../Panel/FrequencyInfoPanel';
import { useTranslation } from 'react-i18next';

const FrequencyInfoDialog = React.memo(({iv, open, onClose}: {
    iv: PokemonIv,
    open: boolean,
    onClose: () => void
}) => {
    const { t } = useTranslation();
    const [state, setState] = React.useState<FrequencyInfoState>({
        helpingBonus: 0,
        campTicket: false,
        berryBonus: 0,
        ingBonus: 0,
        expertMode: false,
        expertBerry: 2,
        expertIngBonus: 0,
        displayValue: "frequency",
        energy: 5,
        distributionMode: "pmf",
        highlighted: 90,
    });

    const onStateChange = React.useCallback((value: FrequencyInfoState) => {
        setState(value);
    }, []);

    if (!open) {
        return <></>;
    }

    return <StyledFrequencyDialog open={open} onClose={onClose}>
        <DialogTitle>
            <FrequencyInfoPreview iv={iv} state={state}
                onStateChange={onStateChange}/>
        </DialogTitle>
        <DialogContent>
            <FrequencyForm state={state} onStateChange={setState}/>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledFrequencyDialog>;
});

const StyledFrequencyDialog = styled(Dialog)({
    '& div.MuiPaper-root': {
        // expand dialog width
        width: '100%',
        margin: '20px',
        '& h2.MuiDialogTitle-root': {
            padding: '1rem 1rem 0 1rem',
            fontSize: '1rem',
        },
        '& div.MuiDialogContent-root': {
            padding: '0.2rem 1rem 0 1rem',
        },
    },
});

export default FrequencyInfoDialog;
