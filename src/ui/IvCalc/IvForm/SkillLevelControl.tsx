import React from 'react';
import { styled } from '@mui/system';
import SelectEx from '../../common/SelectEx';
import {
    getMaxSkillLevel, MainSkillName, VersatileCandidates,
} from '../../../util/MainSkill';
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
    const isVersatile = (iv.pokemon.skill === "Versatile");
    const versatileOptions = React.useMemo(() => {
        if (!isVersatile) {
            return [];
        }
        return VersatileCandidates.map((name) =>
            <MenuItem
                key={name} value={name} dense
            >
                {t('skills.Versatile')} ({t(`skills.${name.replace(" (Random)", "")}`)})
            </MenuItem>
        );
    }, [isVersatile, t]);

    const levelOptions = React.useMemo(() => {
        const ret = [];
        for (let i = 1; i <= maxLevel; i++) {
            ret.push(<MenuItem key={i} value={i} dense>Lv {i}</MenuItem>);
        }
        return ret;
    }, [maxLevel]);

    const onSkillLevelChange = React.useCallback((value: string) => {
        onChange(iv.clone({skillLevel: parseInt(value, 10)}));
    }, [iv, onChange]);

    const onVersatileChange = React.useCallback((value: string) => {
        onChange(iv.clone({versatileSkill: value as MainSkillName}));
    }, [iv, onChange]);

    return <StyledSkillLevel>
        {!isVersatile &&
            <span style={{marginRight: '10px'}}>
                {t(`skills.${iv.pokemon.skill}`)}
            </span>
        }
        {isVersatile &&
            <SelectEx sx={{marginRight: '10px'}}
                value={iv.versatileSkill} onChange={onVersatileChange}>
                {versatileOptions}
            </SelectEx>
        }
        <SelectEx value={iv.skillLevel} onChange={onSkillLevelChange} sx={{padding: '0 8px'}}>
            {levelOptions}
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
