import React from 'react';
import { styled } from '@mui/system';
import InfoButton from '../InfoButton';
import { getMaxSkillLevel, getSkillValue, MainSkillName } from '../../../util/MainSkill';
import PokemonIv from '../../../util/PokemonIv';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    MenuItem, TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next'

interface SkillLevelDetailContent {
    desc: string;
    valueName: string;
}

const SkillLevelControl = React.memo(({value, onChange}: {
    value: PokemonIv,
    onChange: (value: PokemonIv) => void,
}) => {
    const { t } = useTranslation();
    const [infoOpen, setInfoOpen] = React.useState(false);
    const onInfoClick = React.useCallback(() => {
        setInfoOpen(true);
    }, []);
    const onInfoClose = React.useCallback(() => {
        setInfoOpen(false);
    }, []);

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

    const content = getSkillContent(skill, t);
    return (
        <StyledSkillDetailDialog open={open} onClose={onClose}>
            <DialogTitle>{t(`skills.${skill}`)}</DialogTitle>
            <DialogContent dividers>
                <header>{t(`skills desc.${skill}`)}</header>
                <footer>{t(`skills desc2.${skill}`)}</footer>
                <table>
                    <thead>
                        <tr>
                            <th>{t('skill level')}</th>
                            <th>{content.valueName}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(getMaxSkillLevel(skill))].map((_, i) => {
                            const level = i + 1;
                            return (<tr key={level}>
                                <td>Lv.{level}</td>
                                <td>{getSkillValue(skill, level)}</td>
                            </tr>);
                        })}
                    </tbody>
                </table>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>{t('close')}</Button>
            </DialogActions>
        </StyledSkillDetailDialog>
    );
});

function getSkillContent(skill: MainSkillName,
    t: typeof i18next.t
): SkillLevelDetailContent {
    return {
        desc: t(`skills desc.${skill}`),
        valueName: t(`skills value name.${skill}`),
    };
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
    return {
        desc: '----',
        valueName: '----',
    };
}

const StyledSkillDetailDialog = styled(Dialog)({
    '& .MuiDialogTitle-root': {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        padding: '0.8rem 1rem',
    },
    '& .MuiDialogContent-root': {
        padding: '1rem',
        '& > header': {
            marginBottom: '0.2rem',
            fontSize: '0.9rem',
        },
        '& > footer': {
            marginBottom: '0.5rem',
            fontSize: '0.8rem',
        },
        '& > table': {
            borderCollapse: 'separate',
            borderSpacing: '2px',
            '& > thead': {
                background: '#006',
                fontSize: '0.9rem',
                '& > tr > th': {
                    color: '#fff',
                    padding: '0.1rem 0.4rem',
                    fontWeight: 'normal',
                    textAlign: 'center',
                },
            },
            '& > tbody': {
                background: '#f3f3f3',
                fontSize: '0.9rem',
                '& > tr:nth-child(even)': {
                    background: '#e8e8f0',
                },
                '& > tr > td': {
                    padding: '0.1rem 0.4rem',
                    fontWeight: 'normal',
                    textAlign: 'right',
                    '&:nth-of-type(1)': {
                        textAlign: 'center',
                    },
                },
            },
        },
        '& > div.config': {
            background: '#f0f0f0',
            padding: '0.5rem',
            borderRadius: '0.9rem',
            fontSize: '0.9rem',
            margin: '0 .5rem',
            '& > section': {
                display: 'flex',
                flex: '0 auto',
                marginTop: '0.5rem',
                '&:first-of-type': {
                    marginTop: 0,
                },
                '& > label': {
                    marginRight: 'auto',
                    marginTop: 0,
                },
                '& > div': {
                    display: 'flex',
                    alignItems: 'center',
                },
            },
        },
    }
});

export default SkillLevelControl;
