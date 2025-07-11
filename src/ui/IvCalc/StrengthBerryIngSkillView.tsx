import React from 'react';
import { styled } from '@mui/system';
import { getEventBonus, getEventBonusIfTarget } from '../../data/events';
import { getDecendants, PokemonData } from '../../data/pokemons';
import PokemonIv from '../../util/PokemonIv';
import Nature from '../../util/Nature';
import { round1, round2, formatNice, formatWithComma } from '../../util/NumberUtil';
import PokemonStrength, { IngredientStrength, StrengthResult,
    recipeLevelBonus
} from '../../util/PokemonStrength';
import { StrengthParameter } from '../../util/PokemonStrength';
import { ingredientStrength } from '../../util/PokemonRp';
import { getSkillRandomRange as getSkillRange, getMaxSkillLevel, getSkillValue,
    MainSkillName } from '../../util/MainSkill';
import { AmountOfSleep } from '../../util/TimeUtil';
import { Button, Dialog, DialogActions, DialogContent,
    FormControl, Select, SelectChangeEvent, ToggleButtonGroup, ToggleButton,
    Typography, MenuItem } from '@mui/material';
import MainSkillIcon from './MainSkillIcon';
import { StyledNatureUpEffect, StyledNatureDownEffect } from './NatureTextField';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InfoButton from './InfoButton';
import { IvAction } from './IvState';
import EnergyDialog from './EnergyDialog';
import IngredientIcon from './IngredientIcon';
import IngredientCountIcon from './IngredientCountIcon';
import SpecialtyButton from './SpecialtyButton';
import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next'

const StyledBerryIngSkillStrengthView = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    margin: '0 -0.5rem',
    '& > h2': {
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        margin: '0 0.2rem',
        fontSize: '1.5rem',
        '& > span.strength': {
            transform: 'scale(1, 0.9)',
        },
        '& > span.evolved': {
            paddingLeft: '0.8rem',
            fontSize: '0.8rem',
        },
    },
    '& > section': {
        borderLeft: '2px dotted #ccc',
        position: 'relative',
        padding: '0 0 2rem',
        '&:first-of-type': {
            borderLeft: 0,
        },
        '& > h3': {
            width: 'calc(100% - 1rem)',
            fontSize: '.8rem',
            fontWeight: 400,
            textAlign: 'center',
            color: 'white',
            borderRadius: '.8rem',
            verticalAlign: '20%',
            margin: '.3rem 0 .1rem 0.5rem',
            '& > button': {
                position: 'absolute',
                top: '0.45rem',
                right: '0.7rem',
                '& > svg': {
                    color: '#f0f0f0',
                    width: '16px',
                    height: '16px',
                },
            },
        },
        '& > article': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            fontWeight: 600,
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '1.1rem',
            margin: 'auto 0',
            height: '3rem', 
            '& span': {
                verticalAlign: 'middle',
            },
            '& svg': {
                verticalAlign: 'middle',
            },
            '& span.unit': {
                display: 'inline-block',
                paddingLeft: '.1rem',
                fontSize: '0.6rem',
                verticalAlign: 'bottom',
            },
            '&.ingc': {
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                '& > span.ing': {
                    textAlign: 'right',
                    '& > svg': { width: '0.8em', height: '0.8em', paddingRight: '0.1rem'},
                    '& > span': { fontSize: '0.8em'},
                },
                '& > span.strength': {
                    paddingLeft: '0.3rem',
                    textAlign: 'right',
                    '& > svg': { width: '0.6em', height: '0.6em'},
                    '& > span': { fontSize: '0.6em'},
                },
            },
            '&.ing2': {
                lineHeight: '50%',
            },
            '&.ing3': {
                fontSize: '0.8em',
                lineHeight: '50%',
            },
            '&.skill2': {
                lineHeight: '50%',
                fontSize: '0.8rem',
            },
        },
        '& > footer': {
            fontSize: '0.7rem',
            bottom: 0,
            color: '#666',
            position: 'absolute',
            right: '1rem',
            '& > div': {
                textAlign: 'right',
            },
        },
    },
    '& > footer': {
        gridColumn: '1 / -1',
        fontSize: '0.7rem',
        color: '#666',
        padding: '.6rem .8rem 0',
        '& > span': {
            paddingRight: '0.8rem',
            '& > small': {
                fontSize: '0.6rem',
                padding: '0 0.1rem',
            },
        },
        '& > span:last-of-type': {
            paddingRight: 0,
        }
    },
});

const StrengthBerryIngSkillStrengthView = React.memo(({
    pokemonIv, settings, energyDialogOpen, dispatch,
}: {
    pokemonIv: PokemonIv,
    settings: StrengthParameter,
    energyDialogOpen: boolean,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const [helpOpen, setHelpOpen] = React.useState(false);
    const [decendantId, setDecendantId] = React.useState(0);
    const [berryHelpOpen, setBerryHelpOpen] = React.useState(false);
    const [ingHelpOpen, setIngHelpOpen] = React.useState(false);
    const [skillHelpOpen, setSkillHelpOpen] = React.useState(false);

    const isWhistle = (settings.period === 3);
    const strength = new PokemonStrength(pokemonIv, {
        ...settings,
        isEnergyAlwaysFull: isWhistle ? true : settings.isEnergyAlwaysFull,
        isGoodCampTicketSet: isWhistle ?
            false : settings.isGoodCampTicketSet,
    }, decendantId);
    const result = strength.calculate();

    let decendants: PokemonData[] = [];
    if (pokemonIv.pokemon.name !== strength.pokemonIv.pokemon.name) {
        decendants = getDecendants(pokemonIv.pokemon);
    }

    // update pokemonIv to the specified level, skill level and pokemon
    pokemonIv = strength.pokemonIv;

    const onBerryHelpClick = React.useCallback(() => {
        setBerryHelpOpen(true);
    }, []);
    const onBerryHelpClose = React.useCallback(() => {
        setBerryHelpOpen(false);
    }, []);
    const onIngHelpClick = React.useCallback(() => {
        setIngHelpOpen(true);
    }, []);
    const onIngHelpClose = React.useCallback(() => {
        setIngHelpOpen(false);
    }, []);
    const onSkillHelpClick = React.useCallback(() => {
        setSkillHelpOpen(true);
    }, []);
    const onSkillHelpClose = React.useCallback(() => {
        setSkillHelpOpen(false);
    }, []);
    const onEfficiencyInfoClick = React.useCallback(() => {
        dispatch({type: "openEnergyDialog"});
    }, [dispatch]);
    const onEfficiencyDialogClose = React.useCallback(() => {
        dispatch({type: "closeEnergyDialog"});
    }, [dispatch]);

    // format berry value
    const berryStrength = formatWithComma(Math.round(result.berryTotalStrength));

    // summarize ing value
    const ingArticle = getIngArticle(result, settings, t);

    // skill value
    const mainSkillArticle = getMainSkillArticle(pokemonIv, result, settings,
        t, onSkillHelpClick);

    const onHelpClick = React.useCallback(() => {
        setHelpOpen(true);
    }, [setHelpOpen]);
    const onHelpClose = React.useCallback(() => {
        setHelpOpen(false);
    }, [setHelpOpen]);

    const onDecendantsChange = React.useCallback((e: SelectChangeEvent) => {
        setDecendantId(parseInt(e.target.value, 10));
    }, []);

    return <StyledBerryIngSkillStrengthView>
        <h2>
            <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
            <span className="strength">{formatWithComma(Math.round(result.totalStrength))}</span>
            <InfoButton onClick={onHelpClick}/>
            <HelpDialog result={result} open={helpOpen} onClose={onHelpClose}/>
            {decendants.length === 1 && <span className="evolved">
                {t('strength of x', {x: t(`pokemons.${pokemonIv.pokemon.name}`)})}
            </span>}
            {decendants.length > 1 && <span className="evolved">
                <Select variant="standard" value={pokemonIv.pokemon.id.toString()}
                    onChange={onDecendantsChange}>
                    {decendants.map(p => <MenuItem key={p.id} value={p.id}>
                        {t('strength of x', {x: t(`pokemons.${p.name}`)})}
                    </MenuItem>)}
                </Select>
            </span>}
        </h2>
        <section>
            <h3 style={{background: '#24d76a'}}>{t('berry')}
                <InfoButton onClick={onBerryHelpClick}/>
            </h3>
            <article>
                <div>
                    <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                    <span>{berryStrength}</span>
                </div>
            </article>
            <footer>
                <div>{round1(result.berryRatio * 100)}%</div>
                <div>{round1(result.berryHelpCount)}{t('times unit')}</div>
            </footer>
        </section>
        <section>
            <h3 style={{background: '#fab855'}}>{t('ingredient')}
                <InfoButton onClick={onIngHelpClick}/>
            </h3>
            {ingArticle}
            <footer>
                <div>{round1(result.ingRatio * 100)}%</div>
                <div>{round1(result.ingHelpCount)}{t('times unit')}</div>
            </footer>
        </section>
        <section>
            <h3 style={{background: '#44a2fd'}}>{t('skill')}
                <InfoButton onClick={onSkillHelpClick}/>
            </h3>
            {mainSkillArticle}
            <footer>
                <div>{round1(result.skillRatio * 100)}%</div>
                <div>{round2(result.skillCount)}{t('times unit')}</div>
            </footer>
        </section>
        <footer>
            {result.energy.canBeFullInventory ? <>
                <span>{t('full inventory while sleeping (short)')}: {result.energy.timeToFullInventory < 0 ? t('none') :
                        new AmountOfSleep(result.energy.timeToFullInventory).toString(t)}</span>
                <span>
                    {t('skill trigger after wake up (short)')}<>: </>
                    {pokemonIv.pokemon.specialty !== "Skills" && pokemonIv.pokemon.specialty !== "All" ?
                    round1(result.energy.skillProbabilityAfterWakeup.once * 100) + '%' :
                    <>
                        ❶{round1(result.energy.skillProbabilityAfterWakeup.once * 100)}%<> </>
                        ❷{round1(result.energy.skillProbabilityAfterWakeup.twice * 100)}%
                    </>}
                </span>
            </> :
            <>
                <span>
                    {t('help efficiency')}: {result.energy.averageEfficiency.total} (
                    {t('awake')}: {result.energy.averageEfficiency.awake}, {t('asleep')}: {result.energy.averageEfficiency.asleep})
                </span>
            </>}
            <InfoButton onClick={onEfficiencyInfoClick}/>
        </footer>
        <BerryHelpDialog open={berryHelpOpen} onClose={onBerryHelpClose}
            strength={strength} result={result}/>
        <IngHelpDialog open={ingHelpOpen} onClose={onIngHelpClose}
            dispatch={dispatch} strength={strength} result={result}/>
        <SkillHelpDialog open={skillHelpOpen} onClose={onSkillHelpClose}
            dispatch={dispatch} strength={strength} result={result}/>
        <EnergyDialog open={energyDialogOpen} onClose={onEfficiencyDialogClose}
            iv={pokemonIv} energy={result.energy} parameter={settings} dispatch={dispatch}/>
    </StyledBerryIngSkillStrengthView>;
});

function getIngArticle(result: StrengthResult, settings: StrengthParameter,
    t: typeof i18next.t): React.ReactNode {
    if (settings.tapFrequency === 'none') {
        return <article>ー</article>;
    }

    const ingValue = <>
        {result.ingredients.map(x => <React.Fragment key={x.name}>
            <span className="ing">
                <IngredientIcon name={x.name}/>
                <span>{round1(x.count)}</span>
            </span>
            <span className="strength">
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                <span>{formatNice(Math.floor(x.strength), t)}</span>
            </span>
        </React.Fragment>)}
    </>;
    return <article className={`ingc ing${result.ingredients.length}`}>{ingValue}</article>
}

function getMainSkillArticle(pokemonIv: PokemonIv, result: StrengthResult,
    settings: StrengthParameter, t: typeof i18next.t,
    onInfoClick: () => void): React.ReactNode {
    if (settings.period === 3 || settings.tapFrequency === 'none') {
            return <article>ー</article>;
    }

    const mainSkill = pokemonIv.pokemon.skill;
    const mainSkillValue: string = formatNice(result.skillValue, t);
    let mainSkillValue2: string = "";
    if (mainSkill === "Energy for Everyone S (Lunar Blessing)") {
        mainSkillValue2 = formatNice(result.skillStrength, t);
    }

    const skill1 = <>
        <MainSkillIcon mainSkill={mainSkill}/>
        <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue}</span>
    </>;

    let skill2 = <></>;
    if (mainSkillValue2 !== "") {
        skill2 = <>
            <br/>
            <MainSkillIcon mainSkill={"Charge Strength S"}/>
            <span>{mainSkillValue2}</span>
        </>;
    }
    return <article className={mainSkillValue2 !== "" ? "skill2" : ""}>
        <div>
            {skill1}
            {skill2}
        </div>
    </article>;
}

const HelpDialog = React.memo(({result, open, onClose}: {
    result: StrengthResult,
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <StyledHelpDialog open={open} onClose={onClose}>
        <article>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                <span style={{transform: 'scale(1, 0.9)'}}>{formatWithComma(Math.round(result.totalStrength))}</span>
            </h1>
            <div className="grid">
                <SpecialtyButton disabled specialty="Berries"/>
                <div>{formatWithComma(Math.round(result.berryTotalStrength))}</div>
                <SpecialtyButton disabled specialty="Ingredients"/>
                <div>{formatWithComma(Math.round(result.ingStrength))}</div>
                <SpecialtyButton disabled specialty="Skills"/>
                <div>{formatWithComma(Math.round(result.skillStrength))}</div>
            </div>
            <p style={{marginTop: 0}}>{t('strength detail1')}</p>
            <p>{t('strength detail2')}</p>
            <ul style={{paddingLeft: '1rem'}}>
                <li>{t('strength restriction2')}</li>
            </ul>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledHelpDialog>;
});

const StyledHelpDialog = styled(Dialog)({
    '& article': {
        margin: '0.8rem 0.8rem 0 0.8rem',
        '& > h1': {
            fontSize: '1.4rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
        },
        '& > div.grid': {
            margin: '0.2rem 0 1.5rem 1rem',
            display: 'grid',
            gridTemplateColumns: 'min-content min-content',
            gridGap: '0.2rem 0.5rem',
            alignItems: 'center',
            '& > div': {
                textAlign: 'right',
                fontWeight: 'bold',
            },
        },
        '& > p': {
            margin: '0.5rem 0',
            fontSize: '0.9rem',
        },
        '& > ul': {
            margin: 0,
            fontSize: '0.9rem',
        }
    },
});

const BerryHelpDialog = React.memo(({open, onClose, strength, result}: {
    open: boolean,
    onClose: () => void,
    strength: PokemonStrength,
    result: StrengthResult,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }

    const param = strength.parameter;
    const berryStrength = result.berryStrength * (strength.isFavoriteBerry() ? 2 : 1);
    return <StyledInfoDialog open={open} onClose={onClose}>
        <header>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatWithComma(Math.round(result.berryTotalStrength))}
            </h1>
            <h2>
                <span className="box box1">{berryStrength}</span><> × </>
                <span className="box box2">{result.berryCount}</span><> × </>
                <span className="box box3">{round1(result.berryHelpCount)}</span>
            </h2>
        </header>
        <article>
            <div><span className="box box1">{berryStrength}</span></div>
            <span>
                {t('actual berry strength')}<br/>
                <span className="box box4">{result.berryRawStrength}</span><> × </>
                (1 + <span className="box box5">{param.fieldBonus}%</span>)<> × </>
                <span className="box box6">{strength.isFavoriteBerry() ? 2 : 1}</span>
                <ul className="detail">
                    <li>
                        <span className="box box4">{result.berryRawStrength}</span>: {t('berry strength')}
                    </li>
                    <li>
                        <span className="box box5">{param.fieldBonus}%</span>: {t('area bonus')}
                    </li>
                    <li>
                        <span className="box box6">{strength.isFavoriteBerry() ? 2 : 1}</span>: {t('favorite berry')}
                    </li>
                </ul>
            </span>
            <div><span className="box box2">{result.berryCount}</span></div>
            <span>{t('berry count')}</span>
            <div><span className="box box3">{round1(result.berryHelpCount)}</span></div>
            <span>{t('berry help count')}
                <ul className="detail">
                    <li>
                        <strong>{round1(result.notFullHelpCount * result.berryRatio)}</strong>{t('times unit')}: {t('berry picking count')}
                        <footer>
                            {round1(result.notFullHelpCount)}
                            <small> ({t('normal help count')})</small>
                            <> × </>
                            {round1(result.berryRatio * 100)}%
                            <small> ({t('berry rate')})</small>
                        </footer>
                    </li>
                    <li>
                        <strong>{round1(result.fullHelpCount)}</strong>{t('times unit')}: {t('sneaky snacking')}
                    </li>
                </ul>
            </span>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledInfoDialog>;
});

const IngHelpDialog = React.memo(({open, strength, result, dispatch, onClose}: {
    open: boolean,
    strength: PokemonStrength,
    result: StrengthResult,
    dispatch: React.Dispatch<IvAction>,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const [recipeBonusHelpOpen, setRecipeBonusHelpOpen] = React.useState(false);
    const onChange = React.useCallback((value: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);
    const onRecipeBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...strength.parameter, recipeBonus: parseInt(e.target.value)});
    }, [onChange, strength.parameter]);
    const onRecipeLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...strength.parameter, recipeLevel: parseInt(e.target.value) as 1|10|20|30|40|50|55});
    }, [onChange, strength.parameter]);
    const onRecipeBonusInfoClick = React.useCallback(() => {
        setRecipeBonusHelpOpen(true);
    }, []);
    const onRecipeBonusHelpClose = React.useCallback(() => {
        setRecipeBonusHelpOpen(false);
    }, []);

    if (!open) {
        return <></>;
    }

    const param = strength.parameter;
    console.log(param);
    if (param.tapFrequency === 'none') {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent style={{fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>
                    {t('no ingredient')}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const ingSlot = strength.pokemonIv.level < 30 ? 1 :
        strength.pokemonIv.level < 60 ? 2 : 3;
    const ings = [[result.ing1]];
    if (ingSlot > 1) {
        if (result.ing2.name === "unknown") {
            // Darkrai not unlocked
        }
        else if (ings[0][0].name === result.ing2.name) {
            ings[0].push(result.ing2);
        }
        else {
            ings.push([result.ing2]);
        }
    }
    if (ingSlot > 2 && result.ing3 !== undefined) {
        if (result.ing3.name === "unknown") {
            // Darkrai not unlocked
        }
        else if (ings[0][0].name === result.ing3.name) {
            ings[0].push(result.ing3);
        }
        else if (ings.length > 1 && ings[1][0].name === result.ing3.name) {
            ings[1].push(result.ing3);
        }
        else {
            ings.push([result.ing3]);
        }
    }

    const ingInRecipeStrengthRatio = param.recipeBonus === 0 ? 1 :
        (1 + param.recipeBonus / 100) * (1 + recipeLevelBonus[param.recipeLevel] / 100);
    const recipeRatio = ingInRecipeStrengthRatio * 0.8 + 0.2;
    const dishBonus = getEventBonus(param.event, param.customEventBonus)?.dish ?? 1;

    return <StyledInfoDialog open={open} onClose={onClose}>
        <header>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatWithComma(Math.round(result.ingStrength))}
            </h1>
            <div className={`grid ings${ings.length}`}>
                {getIngDetail(strength, result, recipeRatio, ingSlot, ings[0], t)}
                {ings.length > 1 && getIngDetail(strength, result, recipeRatio, ingSlot, ings[1], t)}
                {ings.length > 2 && getIngDetail(strength, result, recipeRatio, ingSlot, ings[2], t)}
            </div>
        </header>
        <article>
            <div><span className="box box3">{round2(result.ingHelpCount)}</span></div>
            <span>{t('ing help count')}</span>
            <footer>
                {round1(result.notFullHelpCount)}
                <small> ({t('normal help count')})</small>
                <> × </>
                {round1(result.ingRatio * 100)}%
                <small> ({t('ingredient rate')})</small>
            </footer>
            <div><span className="box box1">{round1(ings[0].reduce((p, c) => p + c.count, 0))}</span></div>
            <span>{t('ing count')}</span>
            <div><span className="box box2">{ingredientStrength[ings[0][0].name]}</span></div>
            <span>{t('strength per ing')}</span>
            <div><span className="box box5">{round2(recipeRatio)}</span></div>
            <span>{t('recipe multiplier')}<InfoButton onClick={onRecipeBonusInfoClick}/></span>
            <footer>
                <>(</>
                {round2(param.recipeBonus === 0 ? 1 : 1 + param.recipeBonus / 100)}
                <small> ({t('recipe bonus')})</small>
                <> × </>
                {round2(1 + recipeLevelBonus[param.recipeLevel] / 100)}
                <small>({t('average recipe level')})</small>
                <>) × 0.8 + 0.2</>
            </footer>
            <div><span className="box box4">{param.fieldBonus}%</span></div>
            <span>{t('area bonus')}</span>
            {dishBonus !== 1 && <>
                <div><span className="box box6">{dishBonus}</span></div>
                <span>{t('event bonus')}</span>
            </>}
        </article>
        <section style={{marginTop: '1.8rem'}}>
            <label>{t('recipe bonus')}:</label>
            <FormControl size="small">
            <Select variant="standard" value={strength.parameter.recipeBonus.toString()}
                onChange={onRecipeBonusChange}>
                <MenuItem value={0}>0% <small style={{paddingLeft: '0.3rem'}}>({t('mixed recipe')})</small></MenuItem>
                <MenuItem value={19}>19% <small style={{paddingLeft: '0.3rem'}}>(7{t('range separator')}16 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={20}>20% <small style={{paddingLeft: '0.3rem'}}>(20{t('range separator')}22 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={21}>21% <small style={{paddingLeft: '0.3rem'}}>(23{t('range separator')}26 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={25}>25% <small style={{paddingLeft: '0.3rem'}}>(17{t('range separator')}35 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={35}>35% <small style={{paddingLeft: '0.3rem'}}>(35{t('range separator')}56 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={48}>48% <small style={{paddingLeft: '0.3rem'}}>(49{t('range separator')}77 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={61}>61% <small style={{paddingLeft: '0.3rem'}}>(87{t('range separator')}102 {t('ingredients unit')})</small></MenuItem>
            </Select></FormControl>
        </section>
        <section>
            <label>{t('average recipe level')}:</label>
            <Select variant="standard" value={strength.parameter.recipeLevel.toString()}
                onChange={onRecipeLevelChange}>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={55}>55</MenuItem>
                <MenuItem value={60}>60</MenuItem>
            </Select>
        </section>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
        <RecipeBonusHelpDialog open={recipeBonusHelpOpen} onClose={onRecipeBonusHelpClose}/>
    </StyledInfoDialog>;
});

function getIngDetail(strength: PokemonStrength, result: StrengthResult,
    recipeRatio: number, ingSlot: number,
    ing: IngredientStrength[], t: typeof i18next.t): React.ReactNode {
    if (strength.parameter.tapFrequency === 'none') {
        return <article>ー</article>;
    }

    const count = ing.reduce((p, c) => p + c.count, 0);
    const ingName = ing[0].name;
    const param = strength.parameter;
    const dishBonus = getEventBonus(param.event, param.customEventBonus)?.dish ?? 1;

    return <>
        <span>
            <IngredientIcon name={ing[0].name}/>
            {round1(count)}
        </span>
        <div>
            <span className="box box3">{round2(result.ingHelpCount)}</span>
            <> × </>
            {ing.length > 1 ? '(' : ''}
            {ing.map((ing, i) => <span key={i}>
                {i === 0 ? '' : ' + '}
                <IngredientCountIcon count={ing.helpCount} name={ingName}/>
            </span>)}
            {ing.length > 1 ? ')' : ''}
            <>{ingSlot > 1 ? ` / ${ingSlot}` : ''}</>
        </div>
        <span style={{marginTop: '-0.5rem'}}>
            <LocalFireDepartmentIcon sx={{color: "#ff944b"}} className="strength"/>
            {formatNice(ing.reduce((p, c) => p + c.strength, 0), t)}
        </span>
        <div style={{marginTop: '-0.5rem'}}>
            <span className="box box1">{round1(count)}</span><> × </>
            <span className="box box2">{ingredientStrength[ingName]}</span><> × </>
            <span className="box box5">{round2(recipeRatio)}</span><> × </>
            <span>
                <>(1+</>
                <span className="box box4">{param.fieldBonus}%</span>
                <>)</>
            </span>
            {dishBonus !== 1 && <>
                <> × </>
                <span className="box box6">{dishBonus}</span>
            </>}
        </div>
    </>;
}

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
    const skillValue = Math.round(result.skillValue / result.skillCount);
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
            {skill === "Energy for Everyone S (Lunar Blessing)" && <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatNice(result.skillStrength, t)}
            </h1>}
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
        {!isCountOnly && (eventBonus?.skillLevel ?? 0) > 0 && skillLevel !== iv.skillLevel &&
                <div className="skillLevelNotice">
                    <Trans i18nKey="skill level bonus affected"
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
    if (skill === 'Ingredient Magnet S' ||
        skill.startsWith("Ingredient Draw S")
    ) {
        return getIngredientGetValueText(strength, skillLevel, t);
    }
    if (skill.startsWith('Dream Shard Magnet')) {
        return getDreamShardMagnetValueText(strength, skillLevel, t);
    }
    if (skill === 'Energizing Cheer S') {
        return getEnergyRecoveryValueText(strength, skillLevel, t,
            t('nature effect.Energy recovery'));
    }
    if (skill.startsWith('Energy for Everyone S')) {
        return getEnergyRecoveryValueText(strength, skillLevel, t,
            t('e4e per pokemon'));
    }
    if (skill === 'Cooking Power-Up S') {
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

function getEnergyRecoveryValueText(strength: PokemonStrength,
    skillLevel: number, t: typeof i18next.t, valueText: string
):
[React.ReactNode, React.ReactNode] {
    const text = t('value per skill', { value: valueText});
    const val = getSkillValue(strength.pokemonIv.pokemon.skill, skillLevel);
    return [<>
        {text}<br/>
        <ul className="detail">
            <li>
                <StyledNatureUpEffect>{t('nature effect.Energy recovery')}</StyledNatureUpEffect>
                <>: </>
                {Math.floor(val * new Nature("Bold").energyRecoveryFactor)}
            </li>
            <li>
                <StyledNatureDownEffect>{t('nature effect.Energy recovery')}</StyledNatureDownEffect>
                <>: </>
                {Math.floor(val * new Nature("Hasty").energyRecoveryFactor)}
            </li>
        </ul>
    </>, null];
}

function getNormalSkillValueText(t: typeof i18next.t, valueText: string):
[React.ReactNode, React.ReactNode] {
    return [t('value per skill', { value: valueText}), null];
}

const StyledInfoDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
        maxHeight: 'calc(100% - 20px)',
    },

    '& .MuiPaper-root': {
        '& > header': {
            margin: '0.5rem',
            '& > h1': {
                fontSize: '1.4rem',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
            },
            '& > h2': {
                display: 'inline-block',
                fontWeight: 'normal',
                fontSize: '0.9rem',
                margin: '0.3rem 0 0 0.5rem',
                lineHeight: '1.9',
            },
        },
        '& > ul': {
            margin: 0,
            marginTop: '-0.2rem',
            paddingLeft: '1.5rem',
            gridColumn: 'span 2',
            '& > li > footer': {
                fontSize: '0.8rem',
            }
        },
        '& > header > div.grid': {
            marginLeft: '0.8rem',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridGap: '0.7rem 0.5rem',
            alignItems: 'start',
            '& > span': {
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
                '& > svg': {
                    width: '15px',
                    height: '15px',
                    paddingRight: '4px',
                },
                '& > svg.strength': {
                    width: '18px',
                    height: '18px',
                    paddingRight: 0,
                },
            },
            '& > div': {
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.1rem',
                '& > span.box': {
                    padding: '0.1rem 0.2rem',
                },
                '& > span > span.MuiBadge-root': {
                    marginRight: 0,
                    '& > svg': {
                        paddingTop: '3px',
                        width: '15px',
                        height: '15px',
                    },
                    '& > .MuiBadge-badge': {
                        top: '18px',
                        right: '10px',
                    },
                },
            },
        },
        '& > header > div.grid.ings1, & > header > div.grid.ings2': {
            fontSize: '0.9rem',
            '& > div': {
                fontSize: '0.8rem',
            },
        },
        '& > header > div.grid.ings3': {
            fontSize: '0.8rem',
            '& > div': {
                fontSize: '0.7rem',
            },
        },

        '& > article': {
            margin: '1rem .5rem 0 .5rem',
            display: 'grid',
            gridGap: '.5rem',
            rowGap: '.8rem',
            gridTemplateColumns: 'max-content 1fr',
            fontSize: '0.9rem',
            '& > div': {
                textAlign: 'right',
            },
            '& > span > ul.detail': {
                margin: '0.2rem 0 0 1rem',
                padding: 0,
                fontSize: '0.8rem',
                '& span.box': {
                    padding: '0 0.3rem',
                },
            },
            '& > ul': {
                margin: 0,
                marginTop: '-0.2rem',
                paddingLeft: '1.5rem',
                gridColumn: 'span 2',
                '& > li > footer': {
                    fontSize: '0.8rem',
                }
            },
            '& > footer': {
                margin: '-0.3rem 0 0 1.5rem',
                fontSize: '0.8rem',
                gridColumn: 'span 2',
            },
            '& > span > footer': {
                margin: '0.2rem 0 0 -1.5rem',
                fontSize: '0.8rem',
            },
        },
        '& > div.footnote': {
            margin: '1.5rem 1rem 0 1rem',
            fontSize: '0.7rem',
            whiteSpace: 'pre-wrap',
            color: '#999',
        },
        '& > section': {
            margin: '0.2rem 0.5rem',
            fontSize: '.9rem',
            display: 'flex',
            flex: '0 auto',
            '&.mt': {
                marginTop: '1rem',
            },
            '& > label': {
                marginRight: 'auto',
                marginTop: 0,
                textWrap: 'nowrap',
            },
            '& > div > div > button.MuiToggleButton-root': {
                margin: 0,
                padding: '0 0.5rem',
            },
        },
        '& > div.skillLevelNotice': {
            fontSize: '0.7rem',
            color: '#999',
            margin: '0.2rem 0.5rem 0 2rem',
        },
    },
    '& span.box': {
        borderRadius: '.3rem',
        padding: '.1rem .4rem',
        margin: '0',
        color: 'white',
        textAlign: 'center',
    },
    '& span.box1': { background: '#1ebee1' },
    '& span.box2': { background: '#27c18e' },
    '& span.box3': { background: '#e7c300' },
    '& span.box4': { background: '#ce5052' },
    '& span.box5': { background: '#ce3fa3' },
    '& span.box6': { background: '#ff8822' },
});

const RecipeBonusHelpDialog = React.memo(({open, onClose}: {
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <Dialog open={open} onClose={onClose}>
        <DialogContent>
            <Typography paragraph>
                <Trans i18nKey="recipe bonus help"
                    components={{
                        raenonx: <a href={t('recipe bonus list')}>raenonx</a>,
                    }}/>
            </Typography>
            <Typography variant="body2">{t('recipe strength help')}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default StrengthBerryIngSkillStrengthView;
