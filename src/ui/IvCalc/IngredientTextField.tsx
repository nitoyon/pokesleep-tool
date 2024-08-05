import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { IngredientType } from '../../util/PokemonRp';
import { PokemonData } from '../../data/pokemons';
import { Badge, TextField, MenuItem } from '@mui/material';
import IngredientIcon from './IngredientIcon';

const BorderedMenuItem = styled(MenuItem)({
    borderTop: '1px dashed #ddd',
    padding: '.3rem .5rem',
    '&:first-of-type': {
        borderTop: 0,
    },
});

const IngredientTextField = React.memo(({pokemon, value, onChange}: {
    pokemon: PokemonData,
    value: IngredientType,
    onChange: (value: IngredientType) => void,    
}) => {
    const _onChange = useCallback((e: any) => {
        onChange(e.target.value as IngredientType);
    }, [onChange]);

    // prepare menus
    const options = [];
    const values: IngredientType[] = ["AAA", "AAB", "ABA", "ABB"];
    if (pokemon.ing3 !== undefined) {
        values.splice(2, 0, "AAC");
        values.push("ABC");
    }
    for (const value of values) {
        options.push(<BorderedMenuItem key={value} value={value} dense>
            <PokemonIngredient pokemon={pokemon} value={value}/>
        </BorderedMenuItem>);
    }

    return (
        <TextField variant="standard" size="small" select
            value={value}
            SelectProps={{ MenuProps: {
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={_onChange}>
            {options}
        </TextField>
    );
});

const IngredientBadge = styled(Badge)(({ theme }) => ({
    marginRight: '.8rem',
    width: 26,
    height: 26,
    '& .MuiBadge-badge': {
        top: 23,
        right: 4,
        border: '1px solid #ccbb88',
        fontSize: '0.5rem',
        height: '0.7rem',
        width: '0.8rem',
        color: "#000",
        backgroundColor: "#ffffff",
        boxShadow: '0 1px 2px 1px rgba(128, 128, 128, 0.4)',
        zIndex: 0,
    },
    '& > svg': {
        width: '20px',
        height: '20px',
    },
}));

const PokemonIngredient = React.memo(({pokemon, value}: {
    pokemon: PokemonData,
    value: IngredientType,
}) => {
    const icon1 = <IngredientBadge badgeContent={"×"+pokemon.ing1.c1}>
        <IngredientIcon name={pokemon.ing1.name}/>
    </IngredientBadge>;

    const ing2char = value.charAt(1);
    const ing2 = ing2char === 'A' ? pokemon.ing1 : pokemon.ing2;
    const icon2 = <IngredientBadge badgeContent={"×"+ing2.c2}>
        <IngredientIcon name={ing2.name}/>
    </IngredientBadge>;
    
    const ing3char = value.charAt(2);
    const ing3 = ing3char === 'C' && pokemon.ing3 !== undefined ? pokemon.ing3 :
        ing3char === 'A' ? pokemon.ing1 : pokemon.ing2;
    const icon3 = <IngredientBadge badgeContent={"×"+ing3.c3}>
        <IngredientIcon name={ing3.name}/>
    </IngredientBadge>;
    return <>{icon1}{icon2}{icon3}</>;
});

export default IngredientTextField;
