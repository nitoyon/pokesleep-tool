import React from 'react';
import { MenuList } from '@mui/material';
import TypeButton from './TypeButton';
import PopperMenu from '../common/PopperMenu';
import { PokemonType, PokemonTypes } from '../../data/pokemons';

const TypeSelect = React.memo(({size, type, disabled, deletable, onChange, onClick, onDelete}: {
    size?: 'small' | 'medium' | 'large',
    type: PokemonType,
    disabled?: boolean,
    deletable?: boolean,
    onChange: (value: PokemonType) => void,
    onClick?: (value: PokemonType) => void,
    onDelete?: (value: PokemonType) => void,
}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const onButtonClick = React.useCallback((value: PokemonType) => {
        onClick?.(value);
        if (disabled === true) {
            return;
        }
        setOpen(true);
    }, [disabled, onClick]);
    const onButtonDelete = React.useCallback((value: PokemonType) => {
        onDelete?.(type);
    }, [type, onDelete]);
    const onSelect = React.useCallback((value: PokemonType) => {
        onChange(value);
        setOpen(false);
    }, [onChange]);
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    const menuItems = PokemonTypes.map(t =>
        <TypeButton key={t} type={t} size={size} onClick={onSelect} checked={t === type}/>);

    return <>
        <TypeButton ref={anchorRef} type={type} size={size} deletable={deletable}
            onClick={onButtonClick} onDelete={onButtonDelete} checked={false}/>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
            <MenuList style={{
                padding: 0,
                width: size === 'small' ? '15rem' : '16.2rem',
            }}>
                {menuItems}
            </MenuList>
        </PopperMenu>
    </>;
});

export default TypeSelect;
