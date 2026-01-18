import React from 'react';
import { styled } from '@mui/system';
import {
    Button, Dialog, DialogActions, DialogContent,
} from '@mui/material';
import PokemonIv from '../../../util/PokemonIv';
import { StrengthParameter } from '../../../util/PokemonStrength';
import FrequencyInfoState, {
    applyStateToParameter, createDefaultState, createFrequencyState,
} from '../Panel/FrequencyInfoState';
import FrequencyInfoPanel from '../Panel/FrequencyInfoPanel';
import { IvAction } from '../IvState';
import { useTranslation } from 'react-i18next';

const FrequencyInfoDialog = React.memo(({iv, open, parameter, dispatch, onClose}: {
    iv: PokemonIv,
    open: boolean,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
    onClose: () => void
}) => {
    const { t } = useTranslation();
    const openRef = React.useRef(open);
    const [state, setState] = React.useState<FrequencyInfoState>(
        createDefaultState());

    React.useEffect(() => {
        // execute only after this dialog is opened
        if (!(open && !openRef.current)) {
            openRef.current = open;
            return;
        }
        openRef.current = open;

        // Initialize state from parameter
        setState(createFrequencyState(iv, parameter,
            createDefaultState()));
    }, [iv, open, state, parameter]);

    const onStateChange = React.useCallback((value: FrequencyInfoState) => {
        applyStateToParameter(parameter, state, value, dispatch);
        setState(value);
    }, [dispatch, parameter, state]);

    if (!open) {
        return <></>;
    }

    return <StyledFrequencyDialog open={open} onClose={onClose}>
        <DialogContent>
            <FrequencyInfoPanel iv={iv} state={state}
                onStateChange={onStateChange}/>
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
        '& div.MuiDialogContent-root': {
            padding: '1rem 0 0',
        },
    },
});

export default FrequencyInfoDialog;
