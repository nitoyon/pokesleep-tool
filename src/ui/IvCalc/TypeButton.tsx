import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { PokemonType } from '../../data/pokemons';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

const TypeButton = React.memo(
    React.forwardRef<HTMLButtonElement, {
        type: PokemonType,
        checked: boolean,
        onClick: (value: PokemonType) => void,
    }>(({type, checked, onClick}, ref) => {
    const { t } = useTranslation();
    const onTypeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as PokemonType;
        onClick(value);
    }, [onClick]);
    return <StyledTypeButton ref={ref}
            key={type} className={type} value={type} onClick={onTypeClick}>
            {t(`types.${type}`)}
            {checked && <CheckIcon/>}
        </StyledTypeButton>;
}));

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
        borderRadius: '18px',
        fontSize: '16px',
        padding: '1px',
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

export default TypeButton;
