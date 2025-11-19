import React from 'react';
import pokemons from '../../../data/pokemons';
import { getEventBonus } from '../../../data/events';
import Nature from '../../../util/Nature';
import { PokemonType } from '../../../data/pokemons';
import { round1, round2, formatNice, formatWithComma } from '../../../util/NumberUtil';
import PokemonIv from '../../../util/PokemonIv';
import PokemonStrength, {
    StrengthResult, calculateBerryBurstStrength, getBerryBurstTeam, whistlePeriod,
} from '../../../util/PokemonStrength';
import { getSkillRandomRange as getSkillRange, getMaxSkillLevel, getSkillValue,
    getSkillSubValue, hyperCutterSuccess,
    superLuckIngRate, superLuckShardRate, superLuckShard5Rate,
    MainSkillName,
} from '../../../util/MainSkill';
import { Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, MenuItem, Switch, ToggleButtonGroup, ToggleButton } from '@mui/material';
import LevelSelector from '../IvForm/LevelSelector';
import InfoButton from '../InfoButton';
import IngredientIcon from '../IngredientIcon';
import TypeSelect from '../TypeSelect';
import MainSkillIcon from '../MainSkillIcon';
import SelectEx from '../../common/SelectEx';
import { StyledNatureUpEffect, StyledNatureDownEffect } from '../IvForm/NatureTextField';
import { IvAction } from '../IvState';
import { StyledInfoDialog } from './StrengthBerryIngSkillView';
import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next'
import BerryStrengthDialog from './BerryStrengthDialog';

const SkillHelpDialog = React.memo(({open, dispatch, onClose, strength, result}: {
    open: boolean,
    dispatch: React.Dispatch<IvAction>,
    onClose: () => void,
    strength: PokemonStrength,
    result: StrengthResult,
}) => {
    const { t } = useTranslation();
    const [berryStrengthOpen, setBerryStrengthOpen] = React.useState(false);
    const [berryIv, setBerryIv] = React.useState(strength.pokemonIv);
    const [berryBonus, setBerryBonus] = React.useState(1);
    const onBerryInfoClick = React.useCallback((type: PokemonType, level: number) => {
        setBerryStrengthOpen(true);
        const iv = new PokemonIv(pokemons.find(x => x.type === type)?.name ?? "Bulbasaur");
        iv.level = level;
        setBerryIv(iv);
        setBerryBonus(new PokemonStrength(iv, strength.parameter).berryStrengthBonus);
    }, [strength.parameter]);
    const onBerryStrenthClose = React.useCallback(() => {
        setBerryStrengthOpen(false);
    }, []);

    const onSkillLevelChange = React.useCallback((e: React.MouseEvent, value: string|null) => {
        if (value === null) {
            return;
        }
        const iv = strength.pokemonIv.clone();
        iv.skillLevel = parseInt(value, 10);
        dispatch({type: "updateIv", payload: {iv}});
    }, [dispatch, strength.pokemonIv]);

    const settings = strength.parameter;
    if (settings.period <= whistlePeriod || settings.tapFrequency === 'none') {
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
    const bonus = strength.bonusEffects;
    const [skillValueText, skillValueFooter] = getSkillValueText(strength,
        skillLevel, t);
    const [skillValueText2, skillValueFooter2] = getSkillValueText2(strength,
        skillLevel, t);

    let greatSuccessRate = 0;
    const days = Math.ceil(settings.period / 24);
    if (skillName === "Berry Burst (Disguise)") {
        // Calculate great success
        // https://pks.raenonx.cc/en/docs/view/calc/main-skill#disguise
        greatSuccessRate = 1 - Math.pow(1 - 0.18, result.skillCount / days);
    }

    return <StyledInfoDialog open={open} onClose={onClose}>
        <DialogTitle>
            <article>
                <MainSkillIcon mainSkill={skillName}/>
                {formatNice(result.skillValue, t)}
            </article>
            {!isCountOnly && <footer>
                <span className="box box1">{formatWithComma(result.skillValuePerTrigger)}</span><> × </>
                <span className="box box2">{round2(result.skillCount)}</span>
                {skillName === "Ingredient Draw S (Hyper Cutter)" && <>
                    <> × </>
                    <span className="box box4">{round2(1 + hyperCutterSuccess)}</span>
                </>}
                {skillName === "Ingredient Draw S (Super Luck)" && <>
                    <> × </>
                    <span className="box box5">{superLuckIngRate * 100}%</span>
                </>}
                {skillName === "Berry Burst (Disguise)" && <>
                    <br/>
                    <> + </>
                    <span className="box box1">{formatWithComma(result.skillValuePerTrigger)}</span><> × </>
                    <span className="box box4">{2 * days}</span><> × </>
                    <span className="box box5">{round1(greatSuccessRate * 100)}%</span>
                </>}
            </footer>}
        </DialogTitle>
        <DialogContent>
            <article>
                {!isCountOnly && <>
                    <div><span className="box box1">{formatWithComma(result.skillValuePerTrigger)}</span></div>
                    <span>{skillValueText}</span>
                    {skillValueFooter !== null && <footer>{skillValueFooter}</footer>}
                </>}
                <div><span className="box box2">{round2(result.skillCount)}</span></div>
                <span>{t('skill count')}</span>
                {skillName === "Ingredient Draw S (Hyper Cutter)" && <>
                    <div><span className="box box4">{round2(1 + hyperCutterSuccess)}</span></div>
                    <span>{t('additional ingredient rate')}</span>
                </>}
                {skillName === "Ingredient Draw S (Super Luck)" && <>
                    <div><span className="box box5">{superLuckIngRate * 100}%</span></div>
                    <span>{t('ingredient obtain rate')}</span>
                </>}
                {skillName === "Berry Burst (Disguise)" && <>
                    <div><span className="box box4">{2 * days}</span></div>
                    <span>{t('great success increasment')}</span>
                    <div><span className="box box5">{round1(greatSuccessRate * 100)}%</span></div>
                    <span>{t('great success rate')}</span>
                </>}
            </article>
            {result.skillValue2 !== 0 && <>
                <header className="second-skill" style={{marginTop: '1.2rem'}}>
                    <article>
                        {skillName === "Ingredient Magnet S (Plus)" ?
                            <IngredientIcon name={iv.pokemon.ing1.name}/> :
                            <MainSkillIcon mainSkill={skillName} second/>}
                        {formatNice(result.skillValue2, t)}
                    </article>
                    <footer>
                        <span className="box box4">{formatWithComma(result.skillValuePerTrigger2)}</span><> × </>
                        <span className="box box2">{round2(result.skillCount)}</span>
                    </footer>
                </header>
                <article>
                    <div><span className="box box4">{formatWithComma(result.skillValuePerTrigger2)}</span></div>
                    <span>{skillValueText2}</span>
                    {skillValueFooter2 !== null && <footer>{skillValueFooter2}</footer>}
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
            <Collapse in={!isCountOnly &&
                (bonus.skillLevel > 0 || settings.maxSkillLevel) &&
                skillLevel !== iv.skillLevel}>
                <div className="skillLevelNotice">
                    <Trans i18nKey={settings.maxSkillLevel ? "max skill level affected" : "skill level bonus affected"}
                        components={{
                            level: <strong>{skillLevel}</strong>,
                            bonus: <strong>{bonus.skillLevelReason === 'event+ex' ?
                                t('event bonus') + t('text separator') + t('expert mode') :
                                bonus.skillLevelReason === 'event' ? t('event bonus') : t('expert mode')}</strong>,
                        }}/>
                </div>
            </Collapse>
            {getBerryBurstConfigHtml(strength, dispatch, onBerryInfoClick, t)}
            {footnote !== "" && <div className="footnote">{footnote}</div>}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
        <BerryStrengthDialog open={berryStrengthOpen} onClose={onBerryStrenthClose}
            iv={berryIv} fieldBonus={settings.fieldBonus} berryBonus={berryBonus}/>
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
        return getBerryBurstValueText(strength, t, t('berry strength per berry burst'));
    }
    return [null, null];
}

function getSkillValueText2(strength: PokemonStrength, skillLevel: number,
    t: typeof i18next.t):
[React.ReactNode, React.ReactNode]{
    const skill: MainSkillName = strength.pokemonIv.pokemon.skill;

    if (skill === 'Ingredient Draw S (Super Luck)') {
        return getSuperLuckShardText(strength, skillLevel, t, t('expected dream shard'));
    }
    if (skill === 'Ingredient Magnet S (Plus)') {
        return getPlusValueText(strength, skillLevel, t);
    }
    if (skill === 'Cooking Power-Up S (Minus)') {
        const val = getSkillSubValue(skill, skillLevel);
        return getEnergyRecoveryValueText(val, skillLevel, t,
            t('nature effect.Energy recovery'));
    }
    if (skill === 'Energy for Everyone S (Lunar Blessing)') {
        return getBerryBurstValueText(strength, t, t('berry strength per berry burst'));
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

function getSuperLuckShardText(strength: PokemonStrength, skillLevel: number,
    t: typeof i18next.t, valueText: string
):
[React.ReactNode, React.ReactNode] {
    const text = t('value per skill', { value: valueText});
    const shards = getSkillSubValue("Ingredient Draw S (Super Luck)", skillLevel);

    const param = strength.parameter;
    const ingBonus = getEventBonus(param.event, param.customEventBonus)?.ingredientMagnet ?? 1;

    return [<>
        {text}<br/>
        <ul className="detail">
            <li>
                <strong>
                    {formatWithComma(shards)}
                    {ingBonus !== 1 && <> × {ingBonus}</>}
                </strong>
                : {round1(superLuckShardRate * 100)}%
            </li>
            <li>
                <strong>
                    {formatWithComma(shards * 5)}
                    {ingBonus !== 1 && <> × {ingBonus}</>}
                </strong>
                : {round1(superLuckShard5Rate * 100)}%
            </li>
        </ul>
    </>, null];
}

function getPlusValueText(strength: PokemonStrength, skillLevel: number, t: typeof i18next.t):
[React.ReactNode, React.ReactNode] {
    const text = t('value per skill', { value: t('additional ingredients') });
    const param = strength.parameter;
    const ingBonus = getEventBonus(param.event, param.customEventBonus)?.ingredientMagnet ?? 1;

    if (ingBonus === 1) {
        return [text, null];
    }

    const val = getSkillSubValue(strength.pokemonIv.pokemon.skill,
        skillLevel, strength.pokemonIv.pokemon.ing1.name);
    return [text, <>
        {val}
        <small> ({t('base value', { value: t('additional ingredients')})})</small>
        <> × </>
        {ingBonus}
        <small> ({t('event bonus')})</small>
    </>];
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

function getBerryBurstValueText(strength: PokemonStrength,
    t: typeof i18next.t, valueText: string
): [React.ReactNode, React.ReactNode] {
    const text = t('value per skill', { value: valueText});

    const param = strength.parameter;
    const bonus = getEventBonus(param.event, param.customEventBonus)?.berryBurst ?? 1;
    const result = calculateBerryBurstStrength(strength.pokemonIv,
        strength.parameter, bonus, strength.getSkillLevel());
    return [<>
        {text}<br/>
        <div className="bbgrid">
            <label>{t(`pokemons.${strength.pokemonIv.pokemon.name}`)}:</label>
            <span>{formatWithComma(result.members[0].total)}</span>
            <small>({result.members[0].perBerry} × {result.members[0].count})</small>

            <label>{t('other team member')} 1:</label>
            <span>{formatWithComma(result.members[1].total)}</span>
            <small>({result.members[1].perBerry} × {result.members[1].count})</small>

            <label>{t('other team member')} 2:</label>
            <span>{formatWithComma(result.members[2].total)}</span>
            <small>({result.members[2].perBerry} × {result.members[2].count})</small>

            <label>{t('other team member')} 3:</label>
            <span>{formatWithComma(result.members[3].total)}</span>
            <small>({result.members[3].perBerry} × {result.members[3].count})</small>

            <label>{t('other team member')} 4:</label>
            <span>{formatWithComma(result.members[4].total)}</span>
            <small>({result.members[4].perBerry} × {result.members[4].count})</small>
        </div>
    </>, null];
}

function getNormalSkillValueText(t: typeof i18next.t, valueText: string):
[React.ReactNode, React.ReactNode] {
    return [t('value per skill', { value: valueText}), null];
}

function getBerryBurstConfigHtml(strength: PokemonStrength,
    dispatch: React.Dispatch<IvAction>,
    onBerryInfoClick: (type: PokemonType, level: number) => void,
    t: typeof i18next.t
) {
    const settings = strength.parameter;

    const showBurstConfig = strength.pokemonIv.pokemon.skill.startsWith("Berry Burst") ||
        strength.pokemonIv.pokemon.skill === "Energy for Everyone S (Lunar Blessing)";
    if (!showBurstConfig) {
        return <></>;
    }

    const iv = strength.pokemonIv;
    const auto = settings.berryBurstTeam.auto;
    const burstTeam = getBerryBurstTeam(iv, settings);
    const maxSpecies = burstTeam.filter(x => x.type === iv.pokemon.type).length + 1;
    const species = auto ? maxSpecies : settings.berryBurstTeam.species;

    const onBerryBurstAutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({type: "changeParameter", payload: {parameter: {
            ...settings, berryBurstTeam: {
                ...settings.berryBurstTeam,
                auto: !e.target.checked,
            },
        }}});
    };
    const onBerryBurstTypeChange = (index: number, type: PokemonType) => {
        const members = [...settings.berryBurstTeam.members];
        members[index].type = type;

        dispatch({type: "changeParameter", payload: {parameter: {
            ...settings, berryBurstTeam: {
                ...settings.berryBurstTeam,
                members,
            },
        }}});
    };
    const onBerryBurstLevelChange = (index: number, level: number) => {
        const members = [...settings.berryBurstTeam.members];
        members[index].level = level;

        dispatch({type: "changeParameter", payload: {parameter: {
            ...settings, berryBurstTeam: {
                ...settings.berryBurstTeam,
                members,
            },
        }}});
    };
    const onBerryBurstSpeciesChange = (value: string) => {
        dispatch({type: "changeParameter", payload: {parameter: {
            ...settings, berryBurstTeam: {
                ...settings.berryBurstTeam,
                species: parseInt(value, 10),
            },
        }}});
    };

    return <>
        <section style={{marginTop: '0.5rem'}}>
            <label>{t('events.advanced')}:</label>
            <Switch checked={!auto} size="small"
                onChange={onBerryBurstAutoChange}/>
        </section>
        <section style={{paddingLeft: '1rem'}}>
            <label>{t(`pokemons.${strength.pokemonIv.pokemon.name}`)}:</label>
            <span style={{color: '#999'}}>
                <TypeSelect size="small" disabled
                    type={strength.pokemonIv.pokemon.type}
                    onChange={() => {}}/>
                <span style={{padding: '0 0.2rem 0 0.6rem'}}>Lv.</span>
                {strength.pokemonIv.level}
                <InfoButton onClick={() => onBerryInfoClick(iv.pokemon.type, iv.level)}/>
            </span>
        </section>
        {[0, 1, 2, 3].map(i => <section key={i} style={{paddingLeft: '1rem'}}>
            <label>{t('other team member')} {i + 1}:</label>
            <span style={{color: auto ? '#999' : 'inherit'}}>
                <TypeSelect size="small" disabled={auto}
                    type={burstTeam[i].type}
                    onChange={type => onBerryBurstTypeChange(i, type)}/>
                <span style={{padding: '0 0.2rem 0 0.6rem'}}>Lv.</span>
                {auto ? burstTeam[i].level : <LevelSelector value={burstTeam[i].level}
                    onChange={level => onBerryBurstLevelChange(i, level)}/>}
                <InfoButton onClick={() => onBerryInfoClick(burstTeam[i].type, burstTeam[i].level)}/>
            </span>
        </section>)}
        {iv.pokemon.name === "Cresselia" && <section style={{paddingLeft: '1rem'}}>
            <label>{t('different species')}:</label>
            <span style={{color: '#999'}}>
                {auto ? species :
                <SelectEx value={species.toString()}
                    sx={{padding: '0 0.5rem'}}
                    onChange={onBerryBurstSpeciesChange}>
                    <MenuItem dense value="1">1</MenuItem>
                    {maxSpecies > 1 && <MenuItem dense value="2">2</MenuItem>}
                    {maxSpecies > 2 && <MenuItem dense value="3">3</MenuItem>}
                    {maxSpecies > 3 && <MenuItem dense value="4">4</MenuItem>}
                    {maxSpecies > 4 && <MenuItem dense value="5">5</MenuItem>}
                </SelectEx>}
            </span>
        </section>}
    </>;
}

export default SkillHelpDialog;
