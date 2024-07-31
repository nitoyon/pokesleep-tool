import React from 'react';
import { styled } from '@mui/system';
import pokemons, { PokemonData } from '../../data/pokemons';
import PokemonIv from '../../util/PokemonIv';
import { MainSkillName } from '../../util/MainSkill';
import { round1, round2, formatWithComma } from '../../util/NumberUtil';
import PokemonStrength, { CalculateResult } from '../../util/PokemonStrength';
import { CalculateParameter } from '../../util/PokemonStrength';
import { AmountOfSleep } from '../../util/TimeUtil';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Select, SelectChangeEvent, MenuItem } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SwipeOutlinedIcon from '@mui/icons-material/SwipeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import InfoButton from './InfoButton';
import { IvAction } from './IvState';
import EnergyDialog from './EnergyDialog';
import DreamShardIcon from '../Resources/DreamShardIcon';
import IngredientIcon from './IngredientIcon';
import IngredientsIcon from '../Resources/IngredientsIcon';
import PotIcon from '../Resources/PotIcon';
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
    settings: CalculateParameter,
    energyDialogOpen: boolean,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const [helpOpen, setHelpOpen] = React.useState(false);
    const [decendantId, setDecendantId] = React.useState(0);
    const [skillHelpOpen, setSkillHelpOpen] = React.useState(false);

    // change level
    if (settings.level !== 0) {
        pokemonIv = pokemonIv.changeLevel(settings.level);
    }
    // change skill level
    if (settings.maxSkillLevel) {
        pokemonIv = pokemonIv.clone();
        pokemonIv.skillLevel = 7;
        pokemonIv.normalize();
    }

    // evolved pokemon check
    const decendants: PokemonData[] = React.useMemo(() => {
        if (!settings.evolved || pokemonIv.pokemon.ancestor === null) {
            return [];
        }
        const lineage = pokemons
            .filter(x => x.ancestor === pokemonIv.pokemon.ancestor);
        const maxEvolvutionCount = lineage
            .reduce((p, c) => Math.max(p, c.evolutionCount), 0);
        return lineage
            .filter(x => x.evolutionCount === maxEvolvutionCount);
    }, [pokemonIv.pokemon, settings.evolved]);
    let pokemonChanged = false;
    if (decendants.length > 0) {
        let showingPokemon = decendants.find(x => x.id === pokemonIv.pokemon.id);
        if (showingPokemon === undefined) {
            showingPokemon = decendants.find(x => x.id === decendantId);
        }
        if (showingPokemon === undefined) {
            showingPokemon = decendants[0];
        }
        if (showingPokemon.id !== pokemonIv.pokemon.id) {
            pokemonChanged = true;
            pokemonIv = pokemonIv.clone(showingPokemon.name);
        }
    }

    const strength = new PokemonStrength(pokemonIv);
    const isWhistle = (settings.period === 3);
    const result = strength.calculate({
        ...settings,
        isEnergyAlwaysFull: isWhistle ? true : settings.isEnergyAlwaysFull,
        isGoodCampTicketSet: isWhistle ?
            false : settings.isGoodCampTicketSet,
    });

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
    const mainSkillTitle = getMainSkillTitle(pokemonIv, result, settings,
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
            {decendants.length === 1 && pokemonChanged && <span className="evolved">
                {t('strength of x', {x: t(`pokemons.${pokemonIv.pokemon.name}`)})}
            </span>}
            {decendants.length > 1 && pokemonChanged && <span className="evolved">
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
                    {pokemonIv.pokemon.speciality !== "Skills" ?
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
            skill={pokemonIv.pokemon.skill}/>
        <EnergyDialog open={energyDialogOpen} onClose={onEfficiencyDialogClose}
            iv={pokemonIv} energy={result.energy} parameter={settings} dispatch={dispatch}/>
    </StyledBerryIngSkillStrengthView>;
});

function getIngArticle(result: CalculateResult, settings: CalculateParameter,
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

function getMainSkillTitle(pokemonIv: PokemonIv, result: CalculateResult,
    settings: CalculateParameter, t: typeof i18next.t,
    onInfoClick: () => void): React.ReactNode {
    if (settings.period === 3 || settings.tapFrequency === 'none') {
            return <>ー</>;
    }

    const mainSkill = pokemonIv.pokemon.skill;
    const mainSkillValue = round1(result.skillValue);
    switch (mainSkill) {
        case "Charge Energy S":
        case "Energizing Cheer S":
            return <>
                <FavoriteBorderIcon sx={{color: "#ff88aa"}}/>
                <span>{mainSkillValue}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        case "Energy for Everyone S":
            return <>
                <VolunteerActivismOutlinedIcon sx={{color: "#ff88aa"}}/>
                <span>{mainSkillValue}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        case "Charge Strength M":
        case "Charge Strength S":
        case "Charge Strength S (Random)":
            return <>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                <span>{formatWithComma(Math.round(result.skillValue))}</span>
            </>;
        case "Dream Shard Magnet S":
        case "Dream Shard Magnet S (Random)":
            return <>
                <DreamShardIcon/>
                <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue}</span>
            </>;
        case "Extra Helpful S":
        case "Helper Boost":
            return <>
                <SearchIcon sx={{color: "#66cc66"}}/>
                <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        case "Ingredient Magnet S":
            return <>
                <IngredientsIcon/>
                <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        case "Cooking Power-Up S":
            return <>
                <svg width="18" height="18" fill="#886666"><PotIcon/></svg>
                <span>{mainSkillValue}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        case "Tasty Chance S":
            return <>
                <svg width="18" height="18" fill="#886666"><PotIcon/></svg>
                <span>{mainSkillValue}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        case "Metronome":
            return <>
                <SwipeOutlinedIcon sx={{color: "#999", paddingRight: "0.2rem"}}/>
                <span>{round2(result.skillCount)}</span>
                <InfoButton onClick={onInfoClick}/>
            </>;
        default:
            return <>ー</>;
    }
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
                <li>{t('strength restriction1')}</li>
                <li>{t('strength restriction2')}</li>
            </ul>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

const SkillHelpDialog = React.memo(({open, onClose, skill}: {
    open: boolean,
    onClose: () => void,
    skill: MainSkillName,
}) => {
    const { t } = useTranslation();

    let text = t(`strength skill info.${skill}`)
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
