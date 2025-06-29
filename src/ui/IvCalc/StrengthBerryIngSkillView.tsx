import React from 'react';
import { styled } from '@mui/system';
import { getEventBonus } from '../../data/events';
import { getDecendants, PokemonData } from '../../data/pokemons';
import PokemonIv from '../../util/PokemonIv';
import { round1, round2, formatNice, formatWithComma } from '../../util/NumberUtil';
import PokemonStrength, { IngredientStrength, StrengthResult,
    recipeLevelBonus
} from '../../util/PokemonStrength';
import { StrengthParameter } from '../../util/PokemonStrength';
import { ingredientStrength } from '../../util/PokemonRp';
import { AmountOfSleep } from '../../util/TimeUtil';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    FormControl,
    Select, SelectChangeEvent, Typography, MenuItem } from '@mui/material';
import MainSkillIcon from './MainSkillIcon';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InfoButton from './InfoButton';
import { IvAction } from './IvState';
import EnergyDialog from './EnergyDialog';
import IngredientIcon from './IngredientIcon';
import IngredientCountIcon from './IngredientCountIcon';
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
            <HelpDialog open={helpOpen} onClose={onHelpClose}/>
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
            strength={strength}/>
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
            return <>ー</>;
    }

    const mainSkill = pokemonIv.pokemon.skill;
    let mainSkillValue: string;
    let mainSkillValue2: string = "";
    if (mainSkill.startsWith("Charge Strength") ||
        mainSkill.startsWith("Berry Burst")
    ) {
        mainSkillValue = formatWithComma(Math.round(result.skillValue));
    }
    else if (mainSkill === "Metronome" ||
        mainSkill === "Skill Copy (Mimic)" ||
        mainSkill === "Skill Copy (Transform)"
    ) {
        mainSkillValue = round2(result.skillCount);
    }
    else if (mainSkill === "Energy for Everyone S (Lunar Blessing)") {
        mainSkillValue = round1(result.skillValue);
        mainSkillValue2 = formatWithComma(Math.round(result.skillStrength));
    }
    else {
        mainSkillValue = round1(result.skillValue);
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

const HelpDialog = React.memo(({open, onClose}: {
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('strength2')}</DialogTitle>
        <DialogContent dividers style={{fontSize: '0.95rem'}}>
            <p style={{marginTop: 0}}>{t('strength detail1')}</p>
            <p>{t('strength detail2')}</p>
            <ul style={{paddingLeft: '1rem'}}>
                <li>{t('strength restriction2')}</li>
            </ul>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
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
            <span>{t('berry help count')}</span>
            <ul>
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
                margin: '0.5rem 0 0 1rem',
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

const SkillHelpDialog = React.memo(({open, onClose, strength}: {
    open: boolean,
    onClose: () => void,
    strength: PokemonStrength,
}) => {
    const { t } = useTranslation();

    const settings = strength.parameter;
    let text: string = "";
    if (settings.period === 3 || settings.tapFrequency === 'none') {
        text = t('strength skill info.not triggered');
    }
    else {
        const skill = strength.pokemonIv.pokemon.skill.replace(" (Random)", "");
        text = t(`strength skill info.${skill}`)
    }
    return <Dialog open={open} onClose={onClose}>
        <DialogContent style={{fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>
            {text}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default StrengthBerryIngSkillStrengthView;
