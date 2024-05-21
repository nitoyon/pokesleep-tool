import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { PokemonType, PokemonTypes } from '../../data/pokemons';
import { Button, Dialog, DialogActions,
    ToggleButton, ToggleButtonGroup } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

/**
 * Pokemon select dialog configuration.
 */
export interface PokemonFilterDialogConfig {
    /** Filter type */
    filterType: PokemonType|null;
    /** Filter by evolve */
    filterEvolve: "all"|"non"|"final";
}

const PokemonFilterDialog = React.memo(({open, value, onChange, onClose}: {
    open: boolean,
    value: PokemonFilterDialogConfig,
    onChange: (value: PokemonFilterDialogConfig) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const onClearClick = useCallback(() => {
        onChange({...value, filterType: null, filterEvolve: "all"});
    }, [value, onChange]);
    const onCloseClick = useCallback(() => {
        onClose();
    }, [onClose]);
    const onTypeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const selected = e.currentTarget.value as PokemonType;
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
        <StyledTypeButton
            key={type} className={type} value={type} onClick={onTypeClick}>
            {t(`types.${type}`)}
            {type === value.filterType && <CheckIcon/>}
        </StyledTypeButton>
    );

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

const StyledTypeButton = styled(Button)({
    width: '5rem',
    color: 'white',
    fontSize: '0.9rem',
    padding: 0,
    margin: '0.2rem',
    borderRadius: '0.5rem',
    '& > svg': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '10px',
        fontSize: '20px',
        border: '2px solid white',
        right: '-4px',
        top: '-4px',
    },
    '&.normal': { backgroundColor: '#939393' },
    '&.fire': { backgroundColor: '#e8554d' },
    '&.water': { backgroundColor: '#579bf3' },
    '&.electric': { backgroundColor: '#f1c525' },
    '&.grass': { backgroundColor: '#57a747' },
    '&.ice': { backgroundColor: '#68c5df' },
    '&.fighting': { backgroundColor: '#e8a33b' },
    '&.poison': { backgroundColor: '#ab7aca' },
    '&.ground': { backgroundColor: '#c8a841' },
    '&.flying': { backgroundColor: '#add5ea' },
    '&.psychic': { backgroundColor: '#ed6c94' },
    '&.bug': { backgroundColor: '#a5ab39' },
    '&.rock': { backgroundColor: '#b2b194' },
    '&.ghost': { backgroundColor: '#8d658e' },
    '&.dragon': { backgroundColor: '#7482e9' },
    '&.dark': { backgroundColor: '#706261' },
    '&.steel': { backgroundColor: '#94b1c2' },
    '&.fairy': { backgroundColor: '#e48fe3' },
});

export default PokemonFilterDialog;
