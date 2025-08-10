import React from 'react';
import { styled } from '@mui/system';
import IngredientIcon from '../IngredientIcon';
import {
    getMaxSkillLevel, getSkillValue, getSkillSubValue, getSkillRandomRange,
    getIngredientDrawIngredients, getLunarBlessingBerryCount,
    MainSkillName,
} from '../../../util/MainSkill';
import PokemonIv from '../../../util/PokemonIv';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next'

interface SkillLevelDetailContent {
    desc: React.ReactNode;
    detail: React.ReactNode;
    column1: string;
    column2: string | undefined;
}

const SkillDetailDialog = React.memo(({value, open, onClose}: {
    value: PokemonIv,
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }

    const skill = value.pokemon.skill;
    const content = getSkillContent(value, t);
    return (
        <StyledSkillDetailDialog open={open} onClose={onClose}>
            <DialogTitle>{t(`skills.${skill}.name`)}</DialogTitle>
            <DialogContent>
                <header>{content.desc}</header>
                <footer>{content.detail}</footer>
                <SkillTable value={value} content={content}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>{t('close')}</Button>
            </DialogActions>
        </StyledSkillDetailDialog>
    );
});

const SkillTable = React.memo(({value, content}: {
    value: PokemonIv,
    content: SkillLevelDetailContent,
}) => {
    const skill = value.pokemon.skill;

    if (skill.startsWith('Berry Burst')) {
        return <BerryBurstTable value={value}/>;
    } else if (skill === 'Energy for Everyone S (Lunar Blessing)') {
        return <LunarBlessingTable value={value}/>; 
    } else {
        return <NormalTable value={value} content={content}/>;
    }
});

const NormalTable = React.memo(({value, content}: {
    value: PokemonIv,
    content: SkillLevelDetailContent,
}) => {
    const { t } = useTranslation();
    const skill = value.pokemon.skill;

    return <table>
        <thead>
            <tr>
                <th>{t('skill level')}</th>
                <th>{content.column1}</th>
                {content.column2 !== undefined && <th>{content.column2}</th>}
            </tr>
        </thead>
        <tbody>
            {[...Array(getMaxSkillLevel(skill))].map((_, i) => {
                const level = i + 1;
                const value2 = (content.column2 === undefined ? null :
                    <td>{getSkillValue2Text(value, level, t)}</td>);
                return (<tr key={level}>
                    <td>Lv.{level}</td>
                    <td>{getSkillValueText(skill, level, t)}</td>
                    {value2}
                </tr>);
            })}
        </tbody>
    </table>;
});

const BerryBurstTable = React.memo(({value}: {
    value: PokemonIv,
}) => {
    const { t } = useTranslation();
    const skill = value.pokemon.skill;

    return <table>
        <thead>
            <tr>
                <th rowSpan={2}>{t('skill level')}</th>
                <th colSpan={3}>{t('berry')}</th>
            </tr>
            <tr>
                <th>{t('total')}</th>
                <th>{t('own')}</th>
                <th>{t('teammates')}</th>
            </tr>
        </thead>
        <tbody>
            {[...Array(getMaxSkillLevel(skill))].map((_, i) => {
                const level = i + 1;
                const own = getSkillValue(skill, level);
                const team = getSkillSubValue(skill, level);
                const total = own + team * 4;
                return (<tr key={level}>
                    <td>Lv.{level}</td>
                    <td>{total}</td>
                    <td>{own}</td>
                    <td>{team}</td>
                </tr>);
            })}
        </tbody>
    </table>;
});

const LunarBlessingTable = React.memo(({value}: {
    value: PokemonIv,
}) => {
    const { t } = useTranslation();
    const skill = value.pokemon.skill;

    return <table>
        <thead>
            <tr>
                <th rowSpan={2}>{t('skill level')}</th>
                <th rowSpan={2}>{t('nature effect.Energy recovery')}</th>
                <th colSpan={3}>{t('berry')}</th>
            </tr>
            <tr>
                <th>{t('total')}</th>
                <th>{t('own')}</th>
                <th>{t('teammates')}</th>
            </tr>
        </thead>
        <tbody>
            {[...Array(getMaxSkillLevel(skill))].map((_, i) => {
                const level = i + 1;
                const recovery = getSkillValue(skill, level);
                const count = getLunarBlessingBerryCount(level, 3);
                return (<tr key={level}>
                    <td>Lv.{level}</td>
                    <td>{recovery}</td>
                    <td>{count.myBerryCount + 4 * count.othersBerryCount}</td>
                    <td>{count.myBerryCount}</td>
                    <td>{count.othersBerryCount}</td>
                </tr>);
            })}
        </tbody>
    </table>;
});

function getSkillContent(
    value: PokemonIv,
    t: typeof i18next.t
): SkillLevelDetailContent {
    const skill = value.pokemon.skill;

    const components = {ingredients: <></>};
    if (skill.startsWith('Ingredient Draw S')) {
        components.ingredients = <span>
            {getIngredientDrawIngredients(value.pokemon).map(ing =>
                <IngredientIcon key={ing} name={ing}/>)}
        </span>;
    }

    return {
        desc: <Trans i18nKey={`skills.${skill}.desc`}
            components={components}/>,
        detail: t(`skills.${skill}.detail`)
            .split("\n").map(x => <p>{x}</p>),
        column1: getSkillUnit(skill, t),
        column2: getSkillUnit2(skill, t),
    };
}

function getSkillUnit(skill: MainSkillName,
    t: typeof i18next.t
): string {
    if (skill.startsWith('Ingredient Magnet S') ||
        skill.startsWith("Ingredient Draw S") ||
        skill.startsWith('Cooking Assist S')
    ) {
        return t('ing count');
    }
    if (skill.startsWith('Charge Energy S') ||
        skill.startsWith('Energizing Cheer S')
    ) {
        return t('nature effect.Energy recovery');
    }
    if (skill === 'Charge Strength S' ||
        skill.startsWith('Charge Strength M')
    ) {
        return t('strength2');
    }
    if (skill === 'Charge Strength S (Random)' ||
        skill === 'Charge Strength S (Stockpile)'
    ) {
        return t('expected value', {value: ''});
    }
    if (skill.startsWith('Charge Strength S')) {
        return t('expected value', {value: t('strength2')});
    }
    if (skill === 'Dream Shard Magnet S') {
        return t('dream shard');
    }
    if (skill === 'Dream Shard Magnet S (Random)') {
        return t('expected value', {value: ''});
    }
    if (skill.startsWith('Energy for Everyone S')) {
        return t('e4e per pokemon');
    }
    if (skill === 'Extra Helpful S' ||
        skill === 'Helper Boost'
    ) {
        return t('help count');
    }
    if (skill.startsWith('Cooking Power-Up S')) {
        return t('pot size power up');
    }
    if (skill === 'Tasty Chance S') {
        return t('tasty chance increase');
    }
    if (skill.startsWith('Berry Burst')) {
        return t('total');
    }
    return t('unknown');
}

function getSkillUnit2(skill: MainSkillName,
    t: typeof i18next.t
): string | undefined {
    if (skill === 'Charge Strength S (Random)' ||
        skill === 'Charge Strength S (Stockpile)'
    ) {
        return t('range value', {value: ''});
    }
    if (skill === 'Dream Shard Magnet S (Random)') {
        return t('range value', {value: ''});
    }
    if (skill === 'Ingredient Draw S (Super Luck)') {
        return t('dream shard');
    }
    if (skill === 'Ingredient Magnet S (Plus)') {
        return t('additional ingredients');
    }
    if (skill === 'Energizing Cheer S (Heal Pulse)') {
        return t('help count per pokemon');
    }
    if (skill === 'Versatile') {
        return t('candy');
    }
    if (skill === 'Cooking Power-Up S (Minus)') {
        return t('nature effect.Energy recovery');
    }
    if (skill === 'Cooking Assist S (Bulk Up)') {
        return t('tasty chance increase');
    }
    return undefined;
}

function getSkillValueText(skill: MainSkillName, level: number,
    t: typeof i18next.t
): React.ReactNode {
    const n = getSkillValue(skill, level);
    const baseText = t('num', {n});
    return baseText;
}

function getSkillValue2Text(value: PokemonIv, level: number,
    t: typeof i18next.t
): React.ReactNode {
    const skill = value.pokemon.skill;

    // Handle range
    if (skill === 'Charge Strength S (Random)' ||
        skill === 'Charge Strength S (Stockpile)' ||
        skill === 'Dream Shard Magnet S (Random)'
    ) {
        const range = getSkillRandomRange(skill, level);
        return <small>
            {t('num', {n: range[0]})}
            {t('range separator')}
            {t('num', {n: range[1]})}
        </small>;
    }

    if (skill === 'Ingredient Magnet S (Plus)') {
        return getSkillSubValue(skill, level, value.pokemon.ing1.name)
    }

    if (skill === 'Ingredient Draw S (Super Luck)') {
        const shards = getSkillSubValue(skill, level);
        return t('num', {n: shards}) + ' / ' +
            t('num', {n: shards * 5});
    }

    if (skill === 'Cooking Power-Up S (Minus)') {
        return getSkillSubValue(skill, level)
    }

    if (skill === 'Cooking Assist S (Bulk Up)') {
        return getSkillSubValue(skill, level)
    }

    if (skill === 'Energizing Cheer S (Heal Pulse)') {
        return getSkillSubValue(skill, level);
    }

    return null;
}

const StyledSkillDetailDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
    },

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
            '& > span > svg': {
                width: '1rem',
                height: '1rem',
                paddingRight: '0.2rem',
            },
        },
        '& > footer': {
            marginBottom: '0.5rem',
            fontSize: '0.8rem',
            '& > p': {
                margin: 0,
            },
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
