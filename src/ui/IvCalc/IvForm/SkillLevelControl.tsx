import React from 'react';
import { styled } from '@mui/system';
import { getMaxSkillLevel } from '../../../util/MainSkill';
import PokemonIv from '../../../util/PokemonIv';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SkillLevelControl = React.memo(({value, onChange}: {
    value: PokemonIv,
    onChange: (value: PokemonIv) => void,
}) => {
    const { t } = useTranslation();
    const pokemon = value.pokemon;
    const maxLevel = getMaxSkillLevel(pokemon.skill);

    // prepare menus
    const options = [];
    for (let i = 1; i <= maxLevel; i++) {
        options.push(<MenuItem key={i} value={i} dense>Lv {i}</MenuItem>);
    }

    const _onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const iv = value.clone();
        iv.skillLevel = parseInt(e.target.value, 10);
        onChange(iv);
    }, [onChange]);

    return <StyledSkillLevel>
        <span style={{marginRight: '1rem'}}>{t(`skills.${pokemon.skill}`)}</span>
        <TextField variant="standard" size="small" select
            value={value}
            slotProps={{
                select: { MenuProps: {
                    sx: { height: "400px" },
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                }}
            }}
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
