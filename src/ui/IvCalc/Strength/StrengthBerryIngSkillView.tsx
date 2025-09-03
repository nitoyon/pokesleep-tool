import React from 'react';
import { styled } from '@mui/system';
import { PokemonData } from '../../../data/pokemons';
import PokemonIv from '../../../util/PokemonIv';
import { round1, round2, formatNice, formatWithComma } from '../../../util/NumberUtil';
import PokemonStrength, { StrengthResult, whistlePeriod } from '../../../util/PokemonStrength';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { AmountOfSleep } from '../../../util/TimeUtil';
import { Button, Dialog, DialogActions,
    Select, SelectChangeEvent,
    MenuItem } from '@mui/material';
import MainSkillIcon from '../MainSkillIcon';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InfoButton from '../InfoButton';
import { IvAction } from '../IvState';
import BerryHelpDialog from './BerryHelpDialog';
import EnergyDialog from './EnergyDialog';
import IngHelpDialog from './IngHelpDialog';
import IngredientIcon from '../IngredientIcon';
import SkillHelpDialog from './SkillHelpDialog';
import SpecialtyButton from '../SpecialtyButton';
import HelpStackDialog, { getHelpYield, getRequiredHelperBoost } from './HelpStackDialog';
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
                    '& > svg': { width: '0.6em', height: '0.6em', paddingRight: '0.1rem'},
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
                '& > span.ing > svg': { width: '0.4em', height: '0.4em' },
                fontSize: '0.8em',
                lineHeight: '50%',
            },
            '&.skill2': {
                lineHeight: '1.6',
                fontSize: '0.8rem',
                '& > div > svg': {
                    width: '16px',
                    height: '16px',
                },
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
    const [helpStockDialogOpen, setHelpStockDialogOpen] = React.useState(false);

    const strength = new PokemonStrength(pokemonIv, settings, decendantId);
    const result = strength.calculate();

    let decendants: PokemonData[] = [];
    if (pokemonIv.pokemon.name !== strength.pokemonIv.pokemon.name) {
        decendants = pokemonIv.decendants;
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
    const onStockInfoClick = React.useCallback(() => {
        setHelpStockDialogOpen(true);
    }, [])
    const onHelpStockDialogClose = React.useCallback(() => {
        setHelpStockDialogOpen(false);
    }, []);
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
        {settings.period > whistlePeriod && <footer>
            {result.energy.canBeFullInventory && settings.period >= 24 ? <>
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
                    {t('help efficiency')}: {result.energy.averageEfficiency.total}
                    {settings.period >= 24 && <>
                         {" ("}{t('awake')}: {result.energy.averageEfficiency.awake}, {t('asleep')}: {result.energy.averageEfficiency.asleep})
                    </>}
                </span>
            </>}
            <InfoButton onClick={onEfficiencyInfoClick}/>
        </footer>}
        {settings.period < 0 && <footer>
            <span>{t('help yield')}: {round1(getHelpYield(settings, strength, result))}{t('berry unit')}/{Math.abs(settings.period)}{t('help unit')}</span>
            <span>{t('required helper boost')}: {round1(getRequiredHelperBoost(settings, strength, result))}</span>
            <InfoButton onClick={onStockInfoClick}/>
        </footer>}
        <BerryHelpDialog open={berryHelpOpen} onClose={onBerryHelpClose}
            strength={strength} result={result}/>
        <IngHelpDialog open={ingHelpOpen} onClose={onIngHelpClose}
            dispatch={dispatch} strength={strength} result={result}/>
        <SkillHelpDialog open={skillHelpOpen} onClose={onSkillHelpClose}
            dispatch={dispatch} strength={strength} result={result}/>
        <EnergyDialog open={energyDialogOpen} onClose={onEfficiencyDialogClose}
            iv={pokemonIv} energy={result.energy} parameter={settings} dispatch={dispatch}/>
        <HelpStackDialog open={helpStockDialogOpen} onClose={onHelpStockDialogClose}
            parameter={settings} strength={strength} result={result} dispatch={dispatch}/>
    </StyledBerryIngSkillStrengthView>;
});

function getIngArticle(result: StrengthResult, settings: StrengthParameter,
    t: typeof i18next.t): React.ReactNode {
    if (settings.period !== whistlePeriod && settings.tapFrequency === 'none') {
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
    if (settings.period <= whistlePeriod || settings.tapFrequency === 'none') {
            return <article>ー</article>;
    }

    const mainSkill = pokemonIv.pokemon.skill;
    const mainSkillValue: string = formatNice(result.skillValue, t);
    const mainSkillValue2: string = result.skillValue2 === 0 ? "" :
        formatNice(result.skillValue2, t);

    const skill1 = <>
        <MainSkillIcon mainSkill={mainSkill}/>
        <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue}</span>
    </>;

    let skill2 = <></>;
    if (mainSkillValue2 !== "") {
        skill2 = <>
            <br/>
            {mainSkill === "Ingredient Magnet S (Plus)" ?
                <IngredientIcon name={pokemonIv.pokemon.ing1.name}/> :
                <MainSkillIcon mainSkill={mainSkill} second/>}
            <span style={{paddingLeft: '0.2rem'}}>{mainSkillValue2}</span>
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
                <div>{formatWithComma(Math.round(result.skillStrength + result.skillStrength2))}</div>
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

export const StyledInfoDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
        maxHeight: 'calc(100% - 20px)',
    },

    '& .MuiPaper-root': {
        '& > header': {
            margin: '0.5rem 0.5rem 0 0.5rem',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridGap: '.8rem',
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
        '& > div.grid': {
            margin: '0 0 1rem 1.5rem',
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
            '&.ings1, &.ings2': {
                fontSize: '0.9rem',
                '& > div': {
                    fontSize: '0.8rem',
                },
            },
            '&.ings3': {
                fontSize: '0.8rem',
                '& > div': {
                    fontSize: '0.7rem',
                },
            },
        },

        '& > article': {
            margin: '0.5rem .5rem 0 .5rem',
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
            '& > span': {
                display: 'flex',
                alignItems: 'center',
            },
            '& > div > div > button.MuiToggleButton-root': {
                margin: 0,
                padding: '0 0.5rem',
            },
        },
        '& div.skillLevelNotice': {
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

export default StrengthBerryIngSkillStrengthView;
