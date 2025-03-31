import React from 'react';
import { styled } from '@mui/system';
import { getDecendants, PokemonData } from '../../data/pokemons';
import PokemonIv from '../../util/PokemonIv';
import { MainSkillName } from '../../util/MainSkill';
import { round1, round2, formatWithComma } from '../../util/NumberUtil';
import PokemonStrength, { StrengthResult } from '../../util/PokemonStrength';
import { StrengthParameter } from '../../util/PokemonStrength';
import { AmountOfSleep } from '../../util/TimeUtil';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Select, SelectChangeEvent, MenuItem } from '@mui/material';
import MainSkillIcon from './MainSkillIcon';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InfoButton from './InfoButton';
import { IvAction } from './IvState';
import EnergyDialog from './EnergyDialog';
import IngredientIcon from './IngredientIcon';
import { useTranslation } from 'react-i18next';
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
            width: 'calc(100% - 2rem)',
            fontSize: '.8rem',
            fontWeight: 400,
            textAlign: 'center',
            color: 'white',
            borderRadius: '.8rem',
            verticalAlign: '20%',
            margin: '.3rem 0 .1rem 1rem',
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
    const [skillHelpOpen, setSkillHelpOpen] = React.useState(false);
    const [skillHelpId, setSkillHelpId] = React.useState(0);

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

    const onSkillHelpClick = React.useCallback(() => {
        setSkillHelpOpen(true);
        setSkillHelpId(0);
    }, []);
    const onSkillHelpClose = React.useCallback(() => {
        setSkillHelpOpen(false);
    }, []);
    const onSkillHelp2Click = React.useCallback(() => {
        setSkillHelpOpen(true);
        setSkillHelpId(1);
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
    const mainSkillTitle = getMainSkillTitle(pokemonIv, result, settings,
        t, onSkillHelpClick, onSkillHelp2Click);

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
            <h3 style={{background: '#24d76a'}}>{t('berry')}</h3>
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
            <h3 style={{background: '#fab855'}}>{t('ingredient')}</h3>
            {ingArticle}
            <footer>
                <div>{round1(result.ingRatio * 100)}%</div>
                <div>{round1(result.ingHelpCount)}{t('times unit')}</div>
            </footer>
        </section>
        <section>
            <h3 style={{background: '#44a2fd'}}>{t('skill')}</h3>
            <article><div>{mainSkillTitle}</div></article>
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
                    {pokemonIv.pokemon.specialty !== "Skills" ?
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
        <SkillHelpDialog open={skillHelpOpen} onClose={onSkillHelpClose}
            id={skillHelpId} skill={pokemonIv.pokemon.skill}/>
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
                <span>{shortenNumber(t, Math.floor(x.strength))}</span>
            </span>
        </React.Fragment>)}
    </>;
    return <article className={`ingc ing${result.ingredients.length}`}>{ingValue}</article>
}

/**
 * Shorten a long number using i18n JSON file.
 *
 * For example:
 * - 123,456 is shortened to "123K" in English.
 * - 123,456 is shortened to "12.3万" in Japanese.
 *
 * @param t    The i18n translation function.
 * @param n    The number to be formatted.
 * @returns    The formatted string.
 */
function shortenNumber(t: typeof i18next.t, n: number): string {
    if (n < 100000) {
        return formatWithComma(n);
    }

    const digits = t('short num unit digits');
    if (digits === "4") {
        return (n / 10000).toFixed(1).toString() + t('short num unit');
    }
    if (digits === "3") {
        return (n / 1000).toFixed(0).toString() + t('short num unit');
    }
    throw new Error('unknown short num digits: ' + digits);
}

function getMainSkillTitle(pokemonIv: PokemonIv, result: StrengthResult,
    settings: StrengthParameter, t: typeof i18next.t,
    onInfoClick: () => void, onInfo2Click: () => void): React.ReactNode {
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

    return <>
        <MainSkillIcon mainSkill={mainSkill}/>
        <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue}</span>
        {!mainSkill.startsWith("Charge Strength") &&
        !mainSkill.startsWith("Dream Shard") &&
        <InfoButton onClick={onInfoClick}/>}
        {mainSkill === "Energy for Everyone S (Lunar Blessing)" &&
        <>
        <br/>
        <MainSkillIcon mainSkill={"Charge Strength S"}/>
        <span>{mainSkillValue2}</span>
        <InfoButton onClick={onInfo2Click}/>
        </>}
    </>;
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

const SkillHelpDialog = React.memo(({open, onClose, skill, id}: {
    open: boolean,
    onClose: () => void,
    skill: MainSkillName,
    id: number
}) => {
    const { t } = useTranslation();

    let text = t(`strength skill info.${skill}` + (id === 1 ? '2' : ''))
    return <Dialog open={open} onClose={onClose}>
        <DialogContent style={{fontSize: '0.95rem'}}>
            {text}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default StrengthBerryIngSkillStrengthView;
