import React from 'react';
import { styled } from '@mui/system';
import { MenuList } from '@mui/material';
import TypeButton from './TypeButton';
import PopperMenu from '../common/PopperMenu';
import { PokemonType, PokemonTypes } from '../../data/pokemons';

const TypeSelect = React.memo(({type, onChange}: {
    type: PokemonType,
    onChange: (value: PokemonType) => void,
}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const onButtonClick = React.useCallback((value: PokemonType) => {
        setOpen(true);
    }, []);
    const onSelect = React.useCallback((value: PokemonType) => {
        onChange(value);
        setOpen(false);
    }, [onChange]);
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    const menuItems = PokemonTypes.map(t =>
        <TypeButton key={t} type={t} onClick={onSelect} checked={t === type}/>);

    return <>
        <TypeButton ref={anchorRef} type={type} onClick={onButtonClick} checked={false}/>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
            <StyledMenuList>
                {menuItems}
            </StyledMenuList>
        </PopperMenu>
    </>;
});

const StyledMenuList = styled(MenuList)({
    padding: 0,
    width: '16.2rem',
});

export default TypeSelect;
