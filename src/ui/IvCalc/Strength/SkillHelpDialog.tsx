import React from 'react';
import { getEventBonus, getEventBonusIfTarget } from '../../../data/events';
import Nature from '../../../util/Nature';
import { round1, round2, formatNice, formatWithComma } from '../../../util/NumberUtil';
import PokemonStrength, { StrengthResult } from '../../../util/PokemonStrength';
import { getSkillRandomRange as getSkillRange, getMaxSkillLevel, getSkillValue,
    getSkillSubValue, MainSkillName } from '../../../util/MainSkill';
import { Button, Dialog, DialogActions, DialogContent,
    FormControl, ToggleButtonGroup, ToggleButton } from '@mui/material';
import MainSkillIcon from '../MainSkillIcon';
import { StyledNatureUpEffect, StyledNatureDownEffect } from '../IvForm/NatureTextField';
import { IvAction } from '../IvState';
import { StyledInfoDialog } from './StrengthBerryIngSkillView';
import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next'

const SkillHelpDialog = React.memo(({open, dispatch, onClose, strength, result}: {
    open: boolean,
    dispatch: React.Dispatch<IvAction>,
    onClose: () => void,
    strength: PokemonStrength,
    result: StrengthResult,
}) => {
    const { t } = useTranslation();

    const onSkillLevelChange = React.useCallback((e: any, value: string|null) => {
        if (value === null) {
            return;
        }
        const iv = strength.pokemonIv.clone();
        iv.skillLevel = parseInt(e.target.value);
        dispatch({type: "updateIv", payload: {iv}});
    }, [dispatch, strength.pokemonIv]);

    const settings = strength.parameter;
    if (settings.period === 3 || settings.tapFrequency === 'none') {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent style={{fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>
                    {t('strength skill info.not triggered')}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const iv = strength.pokemonIv;
    const skill = iv.pokemon.skill.replace(" (Random)", "");
    const skillValue = result.skillCount === 0 ? 0 :
        Math.round(result.skillValue / result.skillCount);
    const skillValue2 = result.skillCount === 0 ? 0 :
        Math.round(result.skillValue2 / result.skillCount);
    const footnote = t(`strength skill info.${skill}`);
    const skillName = iv.pokemon.skill;
    const isCountOnly = skillName === "Metronome" ||
        skillName.startsWith("Skill Copy");

    const maxSkillLevel = getMaxSkillLevel(iv.pokemon.skill);
    const toggleButtons = Array.from({ length: maxSkillLevel }, (_, i) => (
        <ToggleButton key={i + 1} value={i + 1}>
            {i + 1}
        </ToggleButton>
    ));

    const skillLevel = strength.getSkillLevel();
    const eventBonus = getEventBonusIfTarget(settings.event,
        settings.customEventBonus, iv.pokemon);
    const [skillValueText, skillValueFooter] = getSkillValueText(strength,
        skillLevel, t);
    const [skillValueText2, skillValueFooter2] = getSkillValueText2(strength,
        skillLevel, t);

    return <StyledInfoDialog open={open} onClose={onClose}>
        <header>
            <h1>
                <MainSkillIcon mainSkill={skillName}/>
                {formatNice(result.skillValue, t)}
            </h1>
            {!isCountOnly && <h2>
                <span className="box box1">{formatWithComma(skillValue)}</span><> × </>
                <span className="box box2">{round2(result.skillCount)}</span>
            </h2>}
        </header>
        <article>
            {!isCountOnly && <>
                <div><span className="box box1">{formatWithComma(skillValue)}</span></div>
                <span>{skillValueText}</span>
                {skillValueFooter !== null && <footer>{skillValueFooter}</footer>}
            </>}
            <div><span className="box box2">{round2(result.skillCount)}</span></div>
            <span>{t('skill count')}</span>
            <footer>
                {round1(result.notFullHelpCount)}
                <small> ({t('normal help count')})</small>
                <> × </>
                {round1(result.skillRatio * 100)}%
                <small> ({t('skill rate')})</small>
            </footer>
        </article>
        {result.skillValue2 !== 0 && <>
            <header style={{marginTop: '1.2rem'}}>
                <h1>
                    <MainSkillIcon mainSkill={skillName} second/>
                    {formatNice(result.skillValue2, t)}
                </h1>
                <h2>
                    <span className="box box3">{formatWithComma(skillValue2)}</span><> × </>
                    <span className="box box2">{round2(result.skillCount)}</span>
                </h2>
            </header>
            <article>
                <div><span className="box box3">{formatWithComma(skillValue2)}</span></div>
                <span>{skillValueText2}</span>
                {skillValueFooter2 !== null && <footer>{skillValueFooter2}</footer>}
                <div><span className="box box2">{round2(result.skillCount)}</span></div>
                <span>{t('skill count')}</span>
            </article>
        </>}

        {!isCountOnly &&
            <section style={{marginTop: '1.8rem'}}>
                <label>{t('skill level')}:</label>
                <FormControl size="small">
                    <ToggleButtonGroup exclusive
                        value={iv.skillLevel} onChange={onSkillLevelChange}>
                        {toggleButtons}
                    </ToggleButtonGroup>
                </FormControl>
            </section>
        }
        {!isCountOnly && ((eventBonus?.skillLevel ?? 0) > 0 || settings.maxSkillLevel) &&
        skillLevel !== iv.skillLevel &&
                <div className="skillLevelNotice">
                    <Trans i18nKey={settings.maxSkillLevel ? "max skill level affected" : "skill level bonus affected"}
                        components={{ level: <strong>{skillLevel}</strong>}}/>
                </div>
        }
        {footnote !== "" && <div className="footnote">{footnote}</div>}
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledInfoDialog>;
});

function getSkillValueText(strength: PokemonStrength, skillLevel: number,
    t: typeof i18next.t):
[React.ReactNode, React.ReactNode]{
    const skill: MainSkillName = strength.pokemonIv.pokemon.skill;

    if (skill.startsWith('Charge Energy')) {
        return getChargeEnergyValueText(strength, skillLevel, t);
    }
    if (skill.startsWith('Charge Strength')) {
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
    }
    return [null, null];
}

function getSkillValueText2(strength: PokemonStrength, skillLevel: number,
    t: typeof i18next.t):
[React.ReactNode, React.ReactNode]{
    const skill: MainSkillName = strength.pokemonIv.pokemon.skill;

    if (skill === 'Ingredient Magnet S (Plus)') {
        return getNormalSkillValueText(t, t('additional ingredients'));
    }
    if (skill === 'Cooking Power-Up S (Minus)') {
        const val = getSkillSubValue(skill, skillLevel);
        return getEnergyRecoveryValueText(val, skillLevel, t,
            t('nature effect.Energy recovery'));
    }
    if (skill === 'Energy for Everyone S (Lunar Blessing)') {
        return getNormalSkillValueText(t, t('berry strength per berry burst'));
    }
    return [null, null];
}

function getChargeEnergyValueText(strength: PokemonStrength,
    skillLevel: number, t: typeof i18next.t):
[React.ReactNode, React.ReactNode] {
    const iv = strength.pokemonIv;
    const skill: MainSkillName = strength.pokemonIv.pokemon.skill;

    const text = t('value per skill', { value: t('nature effect.Energy recovery')});
    const val = getSkillValue(skill, skillLevel);
    return [<>
        {text}<br/>
        <span className="box box4">{val}</span>
        <> × </>
        <span className="box box5">{iv.nature.energyRecoveryFactor}</span>
        <ul className="detail">
            <li>
                <span className="box box4">{val}</span>
                <>: {t('base value', { value: t('nature effect.Energy recovery')})}</>
            </li>
            <li>
                <span className="box box5">{iv.nature.energyRecoveryFactor}</span>
                <>: {t('nature factor')}</>
                {iv.nature.energyRecoveryFactor > 1 &&
                <small> (<StyledNatureUpEffect>{t('nature effect.Energy recovery')}</StyledNatureUpEffect>)</small>}
                {iv.nature.energyRecoveryFactor < 1 &&
                <small> (<StyledNatureDownEffect>{t('nature effect.Energy recovery')}</StyledNatureDownEffect>)</small>}
            </li>
        </ul>
    </>, null];
}

function getChargeStrengthValueText(strength: PokemonStrength,
    skillLevel: number, t: typeof i18next.t):
[React.ReactNode, React.ReactNode] {
    const param = strength.parameter;
    const skill: MainSkillName = strength.pokemonIv.pokemon.skill;

    const text = t('value per skill', { value: t('strength2')});
    let detail: React.ReactNode = null;
    if (skill === 'Charge Strength S (Random)') {
        const [min, max] = getSkillRange(skill, skillLevel);
        detail = <small> ({t('range average', { min: formatWithComma(min), max: formatWithComma(max)})})</small>;
    }
    else if (skill === 'Charge Strength S (Stockpile)') {
        const [min, max] = getSkillRange(skill, skillLevel);
        detail = <small> ({t('range expected', { min: formatWithComma(min), max: formatWithComma(max) })})</small>;
    }
    const val = getSkillValue(skill, skillLevel);
    return [<>
        {text}<br/>
        <span className="box box4">{val}</span>
        <> × (1 + </>
        <span className="box box5">{param.fieldBonus}%</span>
        <>)</>
        <ul className="detail">
            <li>
                <span className="box box4">{val}</span>
                <>: {t('base value', { value: t('strength2')})}</>
                {detail}
            </li>
            <li>
                <span className="box box5">{param.fieldBonus}%</span>
                <>: {t('area bonus')}</>
            </li>
        </ul>
    </>, null];
}

function getIngredientGetValueText(strength: PokemonStrength,
    skillLevel: number, t: typeof i18next.t):
[React.ReactNode, React.ReactNode] {
    const param = strength.parameter;
    const val = getSkillValue(strength.pokemonIv.pokemon.skill, skillLevel);
    const ingBonus = getEventBonus(param.event, param.customEventBonus)?.ingredientMagnet ?? 1;

    const text = t('value per skill', { value: t('ing count')});
    if (ingBonus === 1) {
        return [text, null];
    }

    return [text, <>
        {val}
        <small> ({t('base value', { value: t('ing count')})})</small>
        <> × </>
        {ingBonus}
        <small> ({t('event bonus')})</small>
    </>];
}

function getDreamShardMagnetValueText(strength: PokemonStrength,
    skillLevel: number, t: typeof i18next.t):
[React.ReactNode, React.ReactNode] {
    const param = strength.parameter;
    const skill: MainSkillName = strength.pokemonIv.pokemon.skill;

    const shardBonus = getEventBonus(param.event, param.customEventBonus)?.dreamShard ?? 1;
    const text = t('value per skill', { value: t('dream shard')});
    if (skill === 'Dream Shard Magnet S') {
        if (shardBonus === 1) {
            return [text, null];
        }
        else {
            const val = getSkillValue(skill, skillLevel);
            return [text, <>
                <>
                    {val}
                    <small> ({t('base value', { value: t('dream shard')})})</small>
                    <> × </>
                    {shardBonus}
                    <small> ({t('event bonus')})</small>
                </>
            </>];
        }
    }
    else if (skill === 'Dream Shard Magnet S (Random)') {
        const [min, max] = getSkillRange(skill, skillLevel);
        if (shardBonus === 1) {
            return [text, <>{t('range average', { min, max})}</>];
        }
        else {
            const val = getSkillValue(skill, skillLevel);
            return [text,
                <>
                    {val}
                    <small> ({t('range average', { min, max})})</small>
                    <> × </>
                    {shardBonus}
                    <small> ({t('event bonus')})</small>
                </>];
        }
    }

    return [null, null];
}

function getEnergyRecoveryValueText(value: number,
    skillLevel: number, t: typeof i18next.t, valueText: string
):
[React.ReactNode, React.ReactNode] {
    const text = t('value per skill', { value: valueText});
    return [<>
        {text}<br/>
        <ul className="detail">
            <li>
                <StyledNatureUpEffect>{t('nature effect.Energy recovery')}</StyledNatureUpEffect>
                <>: </>
                {Math.floor(value * new Nature("Bold").energyRecoveryFactor)}
            </li>
            <li>
                {t('nature effect.Energy recovery')}
                <> ーー: </>
                {value}
            </li>
            <li>
                <StyledNatureDownEffect>{t('nature effect.Energy recovery')}</StyledNatureDownEffect>
                <>: </>
                {Math.floor(value * new Nature("Hasty").energyRecoveryFactor)}
            </li>
        </ul>
    </>, null];
}

function getNormalSkillValueText(t: typeof i18next.t, valueText: string):
[React.ReactNode, React.ReactNode] {
    return [t('value per skill', { value: valueText}), null];
}

export default SkillHelpDialog;
