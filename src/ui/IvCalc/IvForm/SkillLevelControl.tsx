import React from 'react';
import { styled } from '@mui/system';
import SelectEx from '../../common/SelectEx';
import { PokemonData } from '../../../data/pokemons';
import { getMaxSkillLevel } from '../../../util/MainSkill';
import { MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SkillLevelControl = React.memo(({pokemon, value, onChange}: {
    pokemon: PokemonData,
    value: number,
    onChange: (value: number) => void,
}) => {
    const { t } = useTranslation();
    const maxLevel = getMaxSkillLevel(pokemon.skill);

    // prepare menus
    const options = [];
    for (let i = 1; i <= maxLevel; i++) {
        options.push(<MenuItem key={i} value={i} dense>Lv {i}</MenuItem>);
    }

    const _onChange = React.useCallback((value: string) => {
        onChange(parseInt(value, 10));
    }, [onChange]);

    return <StyledSkillLevel>
        <span style={{marginRight: '10px'}}>{t(`skills.${pokemon.skill}`)}</span>
        <SelectEx value={value} onChange={_onChange} sx={{padding: '0 8px'}}>
            {options}
        </SelectEx>
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
