import React from 'react';
import { styled } from '@mui/system';
import SelectEx from '../../common/SelectEx';
import { getMaxSkillLevel } from '../../../util/MainSkill';
import PokemonIv from '../../../util/PokemonIv';
import { MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SkillLevelControl = React.memo(({iv, onChange}: {
    iv: PokemonIv,
    onChange: (value: PokemonIv) => void,
}) => {
    const { t } = useTranslation();
    const maxLevel = getMaxSkillLevel(iv.pokemon.skill);

    // prepare menus
    const options = [];
    for (let i = 1; i <= maxLevel; i++) {
        options.push(<MenuItem key={i} value={i} dense>Lv {i}</MenuItem>);
    }

    const onSkillLevelChange = React.useCallback((value: string) => {
        onChange(iv.clone({skillLevel: parseInt(value, 10)}));
    }, [iv, onChange]);

    return <StyledSkillLevel>
        <span style={{marginRight: '10px'}}>{t(`skills.${iv.pokemon.skill}`)}</span>
        <SelectEx value={iv.skillLevel} onChange={onSkillLevelChange} sx={{padding: '0 8px'}}>
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
