import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import SelectEx from '../../common/SelectEx';
import { IngredientType } from '../../../util/PokemonRp';
import PokemonIv from '../../../util/PokemonIv';
import { IngredientName, PokemonData } from '../../../data/pokemons';
import { TextField, MenuItem } from '@mui/material';
import IngredientCountIcon from '../IngredientCountIcon';

const BorderedMenuItem = styled(MenuItem)({
    borderTop: '1px dashed #ddd',
    padding: '.3rem .5rem',
    '&:first-of-type': {
        borderTop: 0,
    },
});

const IngredientTextField = React.memo(({iv, onChange}: {
    iv: PokemonIv,
    onChange: (value: PokemonIv) => void,
}) => {
    const _onChange = useCallback((e: any) => {
        const value = iv.clone();
        value.ingredient = e.target.value as IngredientType;
        onChange(value);
    }, [iv, onChange]);
    const onChange1 = useCallback((ing: string) => {
        const value = iv.clone();
        value.mythIng1 = ing as IngredientName;
        onChange(value);
    }, [iv, onChange]);
    const onChange2 = useCallback((ing: string) => {
        const value = iv.clone();
        value.mythIng2 = ing as IngredientName;
        onChange(value);
    }, [iv, onChange]);
    const onChange3 = useCallback((ing: string) => {
        const value = iv.clone();
        value.mythIng3 = ing as IngredientName;
        onChange(value);
    }, [iv, onChange]);

    if (iv.isMythical) {
        return MythicalIngredientTextField(iv, onChange1, onChange2, onChange3);
    } else {
        return NormalIngredientTextField(iv, _onChange);
    }
});

/** Ingredient text field for normal pokemon */
function NormalIngredientTextField(iv: PokemonIv, _onChange: (e: any) => void) {
    // prepare menus
    const options = [];
    const values: IngredientType[] = ["AAA", "AAB", "ABA", "ABB"];
    if (iv.pokemon.ing3 !== undefined) {
        values.splice(2, 0, "AAC");
        values.push("ABC");
    }
    for (const value of values) {
        options.push(<BorderedMenuItem key={value} value={value} dense>
            <PokemonIngredient pokemon={iv.pokemon} value={value}/>
        </BorderedMenuItem>);
    }

    return (
        <TextField variant="standard" size="small" select
            value={iv.ingredient}
            slotProps={{
                select: { MenuProps: {
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                }}
            }}
            onChange={_onChange}>
            {options}
        </TextField>
    );
}

const PokemonIngredient = React.memo(({pokemon, value}: {
    pokemon: PokemonData,
    value: IngredientType,
}) => {
    const icon1 = <IngredientCountIcon count={pokemon.ing1.c1}
        name={pokemon.ing1.name}/>

    const ing2char = value.charAt(1);
    const ing2 = ing2char === 'A' ? pokemon.ing1 : pokemon.ing2;
    const icon2 = <IngredientCountIcon count={ing2.c2}
        name={ing2.name}/>
    
    const ing3char = value.charAt(2);
    const ing3 = ing3char === 'C' && pokemon.ing3 !== undefined ? pokemon.ing3 :
        ing3char === 'A' ? pokemon.ing1 : pokemon.ing2;
    const icon3 = <IngredientCountIcon count={ing3.c3}
        name={ing3.name}/>
    return <>{icon1}{icon2}{icon3}</>;
});

/** Ingredient text field for normal pokemon */
function MythicalIngredientTextField(iv: PokemonIv, onChange1: (e: any) => void,
    onChange2: (e: any) => void,
    onChange3: (e: any) => void) {
    if (iv.pokemon.mythIng === undefined) {
        return <></>;
    }

    const ing1Menus = [];
    const ing2Menus = [];
    const ing3Menus = [];
    for (const ing of iv.pokemon.mythIng) {
        ing1Menus.push(<MenuItem key={ing.name} value={ing.name}>
            <IngredientCountIcon count={ing.c1} name={ing.name}/>
        </MenuItem>);
        ing2Menus.push(<MenuItem key={ing.name} value={ing.name}>
            <IngredientCountIcon count={ing.c2} name={ing.name}/>
        </MenuItem>);
        ing3Menus.push(<MenuItem key={ing.name} value={ing.name}>
            <IngredientCountIcon count={ing.c3} name={ing.name}/>
        </MenuItem>);
    }
    ing2Menus.push(<MenuItem key="unknown" value="unknown">
            <IngredientCountIcon count={0} name="unknown"/>
        </MenuItem>);
    ing3Menus.push(<MenuItem key="unknown" value="unknown">
            <IngredientCountIcon count={0} name="unknown"/>
        </MenuItem>);

    return <div style={{
        display: 'flex',
        gap: '0.5rem',
    }}>
        <SelectEx value={iv.mythIng1}
            sx={{paddingBottom: '0.4rem'}}
            menuSx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
            }} onChange={onChange1}>
            {ing1Menus}
        </SelectEx>
        <SelectEx value={iv.mythIng2}
            sx={{paddingBottom: '0.4rem'}}
            menuSx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
            }} onChange={onChange2}>
            {ing2Menus}
        </SelectEx>
        <SelectEx value={iv.mythIng3}
            sx={{paddingBottom: '0.4rem'}}
            menuSx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
            }} onChange={onChange3}>
            {ing3Menus}
        </SelectEx>
    </div>;
}

export default IngredientTextField;
