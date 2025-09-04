import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { PokemonType } from '../../data/pokemons';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';

const TypeButton = React.memo(
    React.forwardRef<HTMLButtonElement, {
        size?: 'small' | 'medium' | 'large',
        type: PokemonType,
        checked: boolean,
        disabled?: boolean,
        deletable?: boolean,
        onClick: (value: PokemonType) => void,
        onDelete?: (value: PokemonType) => void,
    }>(({size, type, checked, disabled, deletable, onClick, onDelete}, ref) => {
    const { t } = useTranslation();
    const onTypeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const isDelete = (e.nativeEvent.target as HTMLElement)?.closest('.deleteIcon') != null;
        const value = e.currentTarget.value as PokemonType;
        if (isDelete) {
            onDelete?.(value);
        }
        else {
            onClick(value);
        }
    }, [onClick, onDelete]);
    return <StyledTypeButton ref={ref} size={size ?? 'medium'}
            className={`${type}${deletable ? ' deletable' : ''}${disabled ? ' disabled' : ''}`}
            key={type} value={type} onClick={onTypeClick}>
            {t(`types.${type}`)}
            {checked && <CheckIcon/>}
            {deletable && <CancelIcon className="deleteIcon"/>}
        </StyledTypeButton>;
}));

const StyledTypeButton = styled(Button)({
    width: '5rem',
    color: 'white',
    fontSize: '0.9rem',
    padding: 0,
    margin: '0.2rem',
    borderRadius: '0.5rem',
    '&.MuiButton-sizeSmall': {
        width: '4.6rem',
        fontSize: '0.8rem',
        '&.deletable': {
            width: '5.6rem',
        },
        '&.disabled': {
            opacity: 0.7,
        },
    },
    '& > svg': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '18px',
        fontSize: '16px',
        padding: '1px',
        border: '2px solid white',
        right: '-4px',
        top: '-4px',
        '&.deleteIcon': {
            position: 'absolute',
            background: '#ffffff',
            color: '#888888',
            borderRadius: '50%',
            fontSize: '14px',
            border: 0,
            right: '-4px',
            top: '-2px',
        },
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
