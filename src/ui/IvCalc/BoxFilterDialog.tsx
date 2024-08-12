import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import TypeButton from './TypeButton';
import { BoxFilterConfig } from './BoxView';
import { PokemonType, PokemonTypes } from '../../data/pokemons';
import { Button, Dialog, DialogActions,
    ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxFilterDialog = React.memo(({open, value, onChange, onClose}: {
    open: boolean,
    value: BoxFilterConfig,
    onChange: (value: BoxFilterConfig) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const onClearClick = useCallback(() => {
        onChange({...value, filterType: null, filterEvolve: "all"});
    }, [value, onChange]);
    const onCloseClick = useCallback(() => {
        onClose();
    }, [onClose]);
    const onTypeClick = useCallback((selected: PokemonType) => {
        onChange({...value,
            filterType: value.filterType === selected ? null : selected});
        onClose();
    }, [value, onChange, onClose]);
    const onEvolveChange = useCallback((e: any, val: string|null) => {
        if (val === null || value.filterEvolve === val) { return; }
        onChange({...value, filterEvolve: val as "all"|"non"|"final"});
        onClose();
    }, [value, onChange, onClose]);

    const buttons: React.ReactElement[] = PokemonTypes.map(type =>
        <TypeButton key={type} type={type} onClick={onTypeClick}
            checked={type === value.filterType}/>);

    return <StyledPokemonFilterDialog open={open} onClose={onClose}>
        <div>
            <h3>{t('type')}</h3>
            {buttons}
        </div>
        <div>
            <h3>{t('evolve')}</h3>
            <ToggleButtonGroup value={value.filterEvolve} exclusive
                onChange={onEvolveChange}>
                <ToggleButton value="all">{t('all')}</ToggleButton>
                <ToggleButton value="non">{t('non-evolve')}</ToggleButton>
                <ToggleButton value="final">{t('final-evoltion')}</ToggleButton>
            </ToggleButtonGroup>
        </div>
        <DialogActions>
            <Button onClick={onClearClick}>{t('clear')}</Button>
            <Button onClick={onCloseClick}>{t('close')}</Button>
        </DialogActions>
    </StyledPokemonFilterDialog>;
});

const StyledPokemonFilterDialog = styled(Dialog)({
    'div.MuiPaper-root > div': {
        margin: '.5rem .5rem 0 .5rem',
        '& > h3': {
            margin: '0.5rem 0',
            fontSize: '1rem',
        },
        '& > div': {
            '& > button:first-of-type': {
                borderRadius: '1rem 0 0 1rem',
            },
            '& > button:last-of-type': {
                borderRadius: '0 1rem 1rem 0',
            },
        },
    },
});

export default BoxFilterDialog;
