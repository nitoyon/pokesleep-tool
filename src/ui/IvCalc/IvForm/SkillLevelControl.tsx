import React from 'react';
import InfoButton from '../InfoButton';
import { styled } from '@mui/system';
import { PokemonData } from '../../../data/pokemons';
import { getMaxSkillLevel, MainSkillName } from '../../../util/MainSkill';
import {
    Button, Dialog, DialogActions, MenuItem, TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next'

const SkillLevelControl = React.memo(({pokemon, value, onChange}: {
    pokemon: PokemonData,
    value: number,
    onChange: (value: number) => void,
}) => {
    const { t } = useTranslation();
    const [infoOpen, setInfoOpen] = React.useState(false);
    const onInfoClick = React.useCallback(() => {
        setInfoOpen(true);
    }, []);
    const onInfoClose = React.useCallback(() => {
        setInfoOpen(false);
    }, []);

    const maxLevel = getMaxSkillLevel(pokemon.skill);

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
        <InfoButton onClick={onInfoClick}/>
        <SkillDetailDialog skill={pokemon.skill}
            open={infoOpen} onClose={onInfoClose}/>
    </StyledSkillLevel>;
});

const StyledSkillLevel = styled('div')({
    '& .MuiSelect-select': {
        paddingTop: '1px',
        paddingBottom: '1px',
        fontSize: '0.9rem',
    },
});

const SkillDetailDialog = React.memo(({skill, open, onClose}: {
    onClose: () => void,
    open: boolean,
    skill: MainSkillName,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }
    return (
        <StyledSkillDetailDialog open={open} onClose={onClose}>
            <article>
                {getSkillContent(skill, t)}
            </article>
            <DialogActions>
                <Button onClick={onClose} autoFocus>{t('close')}</Button>
            </DialogActions>
        </StyledSkillDetailDialog>
    );
});

function getSkillContent(skill: MainSkillName,
    t: typeof i18next.t
): React.ReactNode {
    if (skill.startsWith('Charge Energy')) {
        return getChargeEnergyContent(t);
    }
    /*if (skill.startsWith('Charge Strength')) {
        return getChargeStrengthValueText(strength, skillLevel, t);
    }
    if (skill.startsWith('Ingredient Magnet S') ||
        skill.startsWith("Ingredient Draw S")
    ) {
        return getIngredientGetValueText(strength, skillLevel, t);
    }
    if (skill.startsWith('Dream Shard Magnet')) {
        return getDreamShardMagnetValueText(strength, skillLevel, t);
    }
    if (skill === 'Energizing Cheer S') {
        const val = getSkillValue(skill, skillLevel);
        return getEnergyRecoveryValueText(val, skillLevel, t,
            t('nature effect.Energy recovery'));
    }
    if (skill.startsWith('Energy for Everyone S')) {
        const val = getSkillValue(skill, skillLevel);
        return getEnergyRecoveryValueText(val, skillLevel, t,
            t('e4e per pokemon'));
    }
    if (skill.startsWith('Cooking Power-Up S')) {
        return getNormalSkillValueText(t, t('pot size power up'));
    }
    if (skill === 'Tasty Chance S') {
        return getNormalSkillValueText(t, t('tasty chance increase'));
    }
    if (skill === 'Extra Helpful S') {
        return getNormalSkillValueText(t, t('help count'));
    }
    if (skill === 'Helper Boost') {
        return getNormalSkillValueText(t, t('help count per pokemon'));
    }
    if (skill.startsWith('Berry Burst')) {
        return getNormalSkillValueText(t, t('berry strength per berry burst'));
    }*/
    return <></>;
}

function getChargeEnergyContent(t: typeof i18next.t): React.ReactNode {
    return <>
        自分のげんきを回復する。
    </>;
}

const StyledSkillDetailDialog = styled(Dialog)({
    '& article': {
        padding: '1rem 1rem 0 1rem',
    }
});

export default SkillLevelControl;
