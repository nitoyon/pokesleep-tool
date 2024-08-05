import React from 'react';
import { styled } from '@mui/system';
import { PokemonData } from '../../data/pokemons';
import { isSkillLevelMax7 } from '../../util/MainSkill';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SkillLevelControl = React.memo(({pokemon, value, onChange}: {
    pokemon: PokemonData,
    value: number,
    onChange: (value: number) => void,
}) => {
    const { t } = useTranslation();
    const maxLevel = isSkillLevelMax7(pokemon.skill) ? 7 : 6;

    // prepare menus
    const options = [];
    for (let i = 1; i <= maxLevel; i++) {
        options.push(<MenuItem key={i} value={i} dense>Lv {i}</MenuItem>);
    }

    const _onChange = React.useCallback((e: any) => {
        onChange(e.target.value as number);
    }, [onChange]);

    return <StyledSkillLevel>
        <span style={{marginRight: '1rem'}}>{t(`skills.${pokemon.skill}`)}</span>
        <TextField variant="standard" size="small" select
            value={value}
            SelectProps={{ MenuProps: {
                sx: { height: "400px" },
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={_onChange}>
            {options}
        </TextField>
    </StyledSkillLevel>;
});

const StyledSkillLevel = styled('div')({
    '& .MuiSelect-select': {
        paddingTop: '1px',
        paddingBottom: '1px',
        fontSize: '0.9rem',
    },
});

export default SkillLevelControl;
