import React from 'react';
import { styled } from '@mui/system';
import CollapseEx from '../common/CollapseEx';
import NumericSliderInput from '../common/NumericSliderInput';
import SelectEx from '../common/SelectEx';
import SliderEx from '../common/SliderEx';
import { getCandyName } from '../../data/pokemons';
import PokemonIv from '../../util/PokemonIv';
import calcExpAndCandy, {
    BoostEvent, calcExp, CalcExpAndCandyResult, CalcLevelResult,
    calcLevelByCandy,
} from '../../util/Exp';
import Nature, { PlusMinusOneOrZero } from '../../util/Nature';
import { clamp, formatWithComma } from '../../util/NumberUtil';
import { maxLevel } from '../../util/PokemonRp';
import { LevelInput } from './IvForm/LevelControl';
import { StyledNatureUpEffect, StyledNatureDownEffect } from './IvForm/NatureTextField';
import PokemonIcon from './PokemonIcon';
import DreamShardIcon from '../Resources/DreamShardIcon';
import CandyIcon from '../Resources/CandyIcon';
import { Button, Dialog, DialogActions, DialogContent, InputAdornment, 
    MenuItem, Switch, Tab, Tabs, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import { useTranslation } from 'react-i18next';

/** IV and level information */
type LevelInfo = {
    /** IV of the Pokémon */
    iv: PokemonIv;
    /** EXP got */
    expGot: number;
    /** Current level */
    currentLevel: number;
    /** Target level */
    targetLevel: number;
};

/** Candy boost policy */
type BoostPolicy = "all" | "candy" | "level";

/** Configuration for candy dialog */
type CandyConfig = {
    /** Tab index */
    tabIndex: number;
    /** Count of Pokémon's candy */
    pokemonCandy: number;
    /** EXP factor */
    expFactor: PlusMinusOneOrZero;
    /** Candy boost */
    candyBoost: BoostEvent;
    /** Candy boost policy */
    boostPolicy: BoostPolicy;
    /** Count of candy to use candy boost */
    boostCandyCount: number;
    /** Target level to use candy boost */
    boostLevel: number;
    /** Dream shard cap to use candy boost */
    boostShard: number;
};

const CandyDialog = React.memo(({ iv, dstLevel, open, onChange, onClose }: {
    iv: PokemonIv,
    dstLevel?: number,
    open: boolean,
    onChange: (iv: PokemonIv) => void,
    onClose: () => void,
}
) => {
    const { t } = useTranslation();
    const [levelInfo, setLevelInfo] = React.useState<LevelInfo>({
        iv,
        expGot: 0,
        currentLevel: iv.level,
        targetLevel: maxLevel,
    });
    const [maxExpLeft, setMaxExpLeft] = React.useState(0);
    const [config, setConfig] = React.useState<CandyConfig>({
        tabIndex: 0,
        pokemonCandy: 500,
        expFactor: 0,
        candyBoost: "none",
        boostPolicy: "all",
        boostCandyCount: 350,
        boostLevel: 55,
        boostShard: 300000,
    });
    const [shouldRender, setShouldRender] = React.useState(false);

    // Reset state when the the pokemon, level or nature has changed or
    // first time when this dialog is open
    const shouldReset = React.useCallback(() => {
        // first time
        if (maxExpLeft === 0) {
            return true;
        }

        if (iv.level === levelInfo.currentLevel &&
            iv.idForm === levelInfo.iv.idForm &&
            iv.nature.expGainsFactor === levelInfo.iv.nature.expGainsFactor
        ) {
            return false;
        }
        return true;
    }, [iv, levelInfo, maxExpLeft]);

    React.useEffect(() => {
        if (!open) {
            setShouldRender(false);
            return;
        }

        if (!shouldReset()) {
            setShouldRender(true);
            return;
        }

        // Set target level
        // * If dstLevel is specified, use it,
        //   else set according to specialty
        // * Do not set lower than current level and
        //   not higher than max level
        let level = 0;
        if (dstLevel !== undefined) {
            level = Math.min(dstLevel, maxLevel);
        }
        else if (iv.pokemon.specialty === "Berries" ||
            iv.pokemon.specialty === "All"
        ) {
            level = maxLevel;
        }
        else if (iv.pokemon.specialty === "Ingredients") {
            level = 60;
        }
        else {
            level = 50;
        }
        level = clamp(iv.level, level, maxLevel);

        // Reset other states
        // current level should be less than or equal to iv.level
        const _currentLevel = Math.min(iv.level, level);
        setLevelInfo({
            iv,
            expGot: 0,
            currentLevel: _currentLevel,
            targetLevel: level,
        });
        setMaxExpLeft(calcExp(_currentLevel, _currentLevel + 1, iv));
        setConfig({
            ...config,
            expFactor: iv.nature.expGainsFactor,
        });
        setShouldRender(true);
    }, [config, iv, shouldReset, dstLevel, open]);

    const onLevelInfoChange = React.useCallback((value: LevelInfo) => {
        // Check if currentLevel changed
        if (value.currentLevel !== levelInfo.currentLevel) {
            setMaxExpLeft(calcExp(value.currentLevel, value.currentLevel + 1, iv));
            onChange(iv.changeLevel(value.currentLevel));
        }
        setLevelInfo(value);
    }, [iv, levelInfo, onChange]);

    const onTabChange = React.useCallback((_: React.SyntheticEvent, tabIndex: number) => {
        setConfig({
            ...config,
            tabIndex,
        });
    }, [config]);

    if (!shouldRender) {
        return null;
    }

    return (<>
        <StyledDialog open={open} onClose={onClose}>
            <DialogContent>
                <LevelForm
                    levelInfo={levelInfo}
                    maxExpLeft={maxExpLeft}
                    onLevelInfoChange={onLevelInfoChange}/>
                <Tabs value={config.tabIndex} onChange={onTabChange}>
                    <Tab label={t('simple')} value={0}/>
                    <Tab label={t('details')} value={1}/>
                </Tabs>
                {config.tabIndex === 0 && <NormalCandyForm
                    config={config} levelInfo={levelInfo} onChange={setConfig}/>}
                {config.tabIndex === 1 && <DetailCandyForm
                    config={config} levelInfo={levelInfo} onChange={setConfig}/>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("close")}</Button>
            </DialogActions>
        </StyledDialog>
    </>);
});

const LevelForm = React.memo(({ levelInfo, maxExpLeft, onLevelInfoChange }: {
    levelInfo: LevelInfo,
    maxExpLeft: number,
    onLevelInfoChange: (value: LevelInfo) => void,
}) => {
    const { t } = useTranslation();

    const handleCurrentLevelChange = React.useCallback((level: number) => {
        onLevelInfoChange({
            ...levelInfo,
            currentLevel: level,
            expGot: 0,
        });
    }, [levelInfo, onLevelInfoChange]);

    const handleTargetLevelChange = React.useCallback((level: number) => {
        onLevelInfoChange({
            ...levelInfo,
            targetLevel: level,
        });
    }, [levelInfo, onLevelInfoChange]);

    const handleExpGotChange = React.useCallback((value: number) => {
        onLevelInfoChange({
            ...levelInfo,
            expGot: value,
        });
    }, [levelInfo, onLevelInfoChange]);

    const handleExpLeftChange = React.useCallback((value: number) => {
        onLevelInfoChange({
            ...levelInfo,
            expGot: maxExpLeft - value,
        });
    }, [levelInfo, maxExpLeft, onLevelInfoChange]);

    return <>
        <StyledIcon>
            <PokemonIcon idForm={levelInfo.iv.idForm} size={80}/>
        </StyledIcon>
        <StyledLevel>
            <div className="level">
                <div className="levelInput">
                    <label>Lv.</label>
                    <LevelInput value={levelInfo.currentLevel}
                        onChange={handleCurrentLevelChange}
                        showSlider/>
                </div>
                <div className="expLeft">
                    <StyledSlider value={levelInfo.expGot}
                        min={0} max={maxExpLeft - 1}
                        onChange2={handleExpGotChange}/>
                    <NumericSliderInput value={maxExpLeft - levelInfo.expGot} size="small"
                        startAdornment={<InputAdornment position="start">{t('exp to go1')}</InputAdornment>}
                        endAdornment={<InputAdornment position="end">{t('exp to go2')}</InputAdornment>}
                        min={1} max={maxExpLeft}
                        onChange={handleExpLeftChange}/>
                </div>
            </div>
            <EastIcon/>
            <div className="level">
                <div className="levelInput">
                    <label>Lv.</label>
                    <LevelInput value={levelInfo.targetLevel}
                        onChange={handleTargetLevelChange}
                        showSlider/>
                </div>
            </div>
        </StyledLevel>
    </>;
});

const StyledIcon = styled('div')({
    margin: '0 auto .5rem',
    width: '80px',
});

const StyledLevel = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '0.7rem',
    margin: '0 auto',
    '& > div.level': {
        width: '7.2rem',
        '& > div.levelInput': {
            color: '#79d073',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.2rem',
            '& > label': {
                transform: 'scale(1, 0.9)',
                paddingTop: '0.2rem'
            },
            '& > div.numeric': {
                width: '3rem',
                '& > div.MuiInput-root': {
                    color: '#79d073',
                    fontWeight: 'bold',
                    fontSize: '1.3rem !important',
                    transform: 'scale(1, 0.9)',
                    '& > input': {
                        padding: '2px 0',
                    },
                },
            },
        },
        '& > div.expLeft': {
            paddingTop: '0.3rem',
            '& > div.numeric > div.MuiInput-root': {
                '& > div.MuiInputAdornment-root > p': {
                    color: '#79d073',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    transform: 'scale(1, 0.9)',
                },
                '& > input': {
                    padding: 0,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transform: 'scale(1, 0.9)',
                },
            },
        },
    },
    '& > svg': {
        paddingTop: '0.3rem',
        color: '#888',
    },
});

const NormalCandyForm = React.memo(({ config, levelInfo, onChange }: {
    config: CandyConfig,
    levelInfo: LevelInfo,
    onChange: (config: CandyConfig) => void,
}) => {
    const { t } = useTranslation();

    const iv = levelInfo.iv.changeLevel(levelInfo.currentLevel);
    iv.nature = config.expFactor === 1 ? new Nature('Timid') :
        config.expFactor === 0 ? new Nature('Serious') : new Nature('Relaxed');
    const result: CalcExpAndCandyResult =
        calcExpAndCandy(iv, levelInfo.expGot, levelInfo.targetLevel, config.candyBoost);

    const onExpFactorChange = React.useCallback((value: string) => {
        onChange({
            ...config,
            expFactor: parseInt(value, 10) as PlusMinusOneOrZero,
        });
    }, [config, onChange]);

    const onCanyBoostChange = React.useCallback((_: React.MouseEvent, value: BoostEvent) => {
        if (value === null) {
            return;
        }
        onChange({
            ...config,
            candyBoost: value,
        });
    }, [config, onChange]);

    return <>
        <div className="expResult">
            <section className="first">
                <label>{t('required exp')}:</label>
                <div>{formatWithComma(result.exp)}</div>
            </section>
            <section>
                <label>{t('candy')}:</label>
                <div><CandyIcon/>{formatWithComma(result.candy)}</div>
            </section>
            <section>
                <label>{t('dream shard')}:</label>
                <div><DreamShardIcon/>{formatWithComma(result.shards)}</div>
            </section>
        </div>
        <div className="form">
            <section className="first">
                <label>{t('nature')}:</label>
                <SelectEx onChange={onExpFactorChange} value={config.expFactor.toString()}>
                    <MenuItem value="1"><StyledNatureUpEffect>{t('nature effect.EXP gains')}</StyledNatureUpEffect></MenuItem>
                    <MenuItem value="0">{t('nature effect.EXP gains')} ーー</MenuItem>
                    <MenuItem value="-1"><StyledNatureDownEffect>{t('nature effect.EXP gains')}</StyledNatureDownEffect></MenuItem>
                </SelectEx>
            </section>
            <section>
                <label>{t('candy boost')}:</label>
                <ToggleButtonGroup size="small" exclusive
                    value={config.candyBoost} onChange={onCanyBoostChange}>
                    <ToggleButton value="none">{t('none')}</ToggleButton>
                    <ToggleButton value="mini">{t('mini candy boost')}</ToggleButton>
                    <ToggleButton value="unlimited">{t('normal candy boost')}</ToggleButton>
                </ToggleButtonGroup>
            </section>
        </div>
    </>;
});

const DetailCandyForm = React.memo(({ config, levelInfo, onChange }: {
    config: CandyConfig,
    levelInfo: LevelInfo,
    onChange: (config: CandyConfig) => void,
}) => {
    const { t } = useTranslation();

    const onPokemonCandyChange = React.useCallback((pokemonCandy: number) => {
        onChange({...config, pokemonCandy});
    }, [config, onChange]);

    const onExpFactorChange = React.useCallback((value: string) => {
        onChange({
            ...config,
            expFactor: parseInt(value, 10) as PlusMinusOneOrZero,
        });
    }, [config, onChange]);

    const onCandyBoostEnabledChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...config,
            candyBoost: !e.target.checked ? "none" :
                new Date().getMonth() === 11 ? "unlimited" : "mini",
        });
    }, [config, onChange]);

    const onCandyBoostChange = React.useCallback((value: string) => {
        onChange({...config, candyBoost: value as "mini" | "unlimited"});
    }, [config, onChange]);

    const onBoostPolicyChange = React.useCallback((value: string) => {
        onChange({...config, boostPolicy: value as BoostPolicy});
    }, [config, onChange]);

    const onBoostCandyCountChange = React.useCallback((boostCandyCount: number) => {
        onChange({...config, boostCandyCount});
    }, [config, onChange]);

    const onBoostLevelChange = React.useCallback((boostLevel: number) => {
        onChange({...config, boostLevel});
    }, [config, onChange]);

    const id = levelInfo.iv.pokemon.id;
    const name = t(`pokemons.${getCandyName(id)}`).replace(/ \(.+/, "");

    let iv = levelInfo.iv.changeLevel(levelInfo.currentLevel);
    iv.nature = config.expFactor === 1 ? new Nature('Timid') :
        config.expFactor === 0 ? new Nature('Serious') : new Nature('Relaxed');

    const exp = calcExp(levelInfo.currentLevel, levelInfo.targetLevel, levelInfo.iv) -
        levelInfo.expGot;
    let candyBoostResult: CalcLevelResult = {
        exp,
        expGot: levelInfo.expGot,
        expLeft: exp,
        level: levelInfo.currentLevel,
        shards: 0,
        candyUsed: 0,
        candyLeft: config.pokemonCandy,
    };
    if (config.candyBoost !== 'none') {
        switch (config.boostPolicy) {
            case 'all':
                candyBoostResult = calcLevelByCandy(iv,
                    levelInfo.expGot, levelInfo.targetLevel,
                    config.pokemonCandy, config.candyBoost);
                break;
            case 'candy':
                candyBoostResult = calcLevelByCandy(iv,
                    levelInfo.expGot, levelInfo.targetLevel,
                    Math.min(config.boostCandyCount, config.pokemonCandy),
                    config.candyBoost);
                candyBoostResult.candyLeft =
                    config.pokemonCandy - candyBoostResult.candyUsed;
                break;
            case 'level': {
                candyBoostResult = calcLevelByCandy(iv,
                    levelInfo.expGot, config.boostLevel,
                    config.pokemonCandy, config.candyBoost);
                candyBoostResult.expLeft = calcExp(candyBoostResult.level,
                    levelInfo.targetLevel, levelInfo.iv) -
                    candyBoostResult.expGot;
                break;
            }
        }
        iv = levelInfo.iv.changeLevel(candyBoostResult.level);
    }
    const normalCandyResult: CalcLevelResult = calcLevelByCandy(iv,
        candyBoostResult.expGot, levelInfo.targetLevel,
        candyBoostResult.candyLeft, "none");

    return <>
        <div className="expResult">
            <section className="first">
                <label>{t('required exp')}:</label>
                <div>{formatWithComma(exp)}</div>
            </section>
            <CollapseEx show={candyBoostResult.candyUsed > 0}>
                <section>
                    <label>{t('candy boost')}:</label>
                    <div>{formatWithComma(exp - candyBoostResult.expLeft)}</div>
                </section>
                <CandyResultPreview iv={iv} value={candyBoostResult}/>
            </CollapseEx>
            <CollapseEx show={normalCandyResult.candyUsed > 0}>
                <section>
                    <label>{t('candy-based training')}:</label>
                    <div>{formatWithComma(candyBoostResult.expLeft - normalCandyResult.expLeft)}</div>
                </section>
                <CandyResultPreview iv={iv} value={normalCandyResult}/>
            </CollapseEx>
        </div>
        <div className="form">
            <section className="first">
                <label>{t('pokemon candy', {name})}:</label>
                <NumericSliderInput value={config.pokemonCandy} min={0} max={4000}
                    sx={{width: '3rem', fontSize: '0.9rem'}}
                    onChange={onPokemonCandyChange}/>
            </section>
            <section>
                <label>{t('nature')}:</label>
                <SelectEx onChange={onExpFactorChange} value={config.expFactor.toString()}>
                    <MenuItem value="1"><StyledNatureUpEffect>{t('nature effect.EXP gains')}</StyledNatureUpEffect></MenuItem>
                    <MenuItem value="0">{t('nature effect.EXP gains')} ーー</MenuItem>
                    <MenuItem value="-1"><StyledNatureDownEffect>{t('nature effect.EXP gains')}</StyledNatureDownEffect></MenuItem>
                </SelectEx>
            </section>
        </div>
        <div className="form">
            <section className="first">
                <label>{t('candy boost')}:</label>
                <Switch checked={config.candyBoost !== 'none'} size="small"
                    onChange={onCandyBoostEnabledChange}/>
            </section>
            <CollapseEx show={config.candyBoost !== 'none'}>
                <section>
                    <label>{t('kind')}:</label>
                    <SelectEx onChange={onCandyBoostChange} value={config.candyBoost}>
                        <MenuItem value="mini">{t('mini candy boost')} </MenuItem>
                        <MenuItem value="unlimited">{t('normal candy boost')}</MenuItem>
                    </SelectEx>
                </section>
                <section>
                    <label>
                        <SelectEx onChange={onBoostPolicyChange} value={config.boostPolicy}>
                            <MenuItem value="all">{t('all')} </MenuItem>
                            <MenuItem value="candy">{t('number of uses')} </MenuItem>
                            <MenuItem value="level">{t('up to specified level')}</MenuItem>
                        </SelectEx>:
                    </label>
                    {config.boostPolicy === 'all' && <div>
                        <CandyIcon/>{config.pokemonCandy}
                    </div>}
                    {config.boostPolicy === 'candy' && <div>
                        <CandyIcon/>
                        <NumericSliderInput
                            sx={{width: '3rem', fontSize: '0.9rem'}}
                            min={0} max={config.pokemonCandy}
                            value={config.boostCandyCount}
                            onChange={onBoostCandyCountChange}/>
                    </div>}
                    {config.boostPolicy === 'level' && <>
                        <span style={{padding: '0.1rem 0.2rem 0 0'}}>Lv.</span>
                        <LevelInput showSlider
                            sx={{width: '2rem', fontSize: '0.9rem'}}
                            value={config.boostLevel}
                            onChange={onBoostLevelChange}/>
                    </>}
                </section>
            </CollapseEx>
        </div>
    </>;
});

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        maxWidth: '22rem',
    },

    '& .MuiPaper-root': {
        width: '100%',

        '& > div.MuiDialogContent-root': {
            padding: '.8rem .8rem 0 .8rem',
            '& > .MuiTabs-root': {
                marginTop: '0.4rem',
                '& button.MuiButtonBase-root': {
                    paddingBottom: 0,
                },
            },
            '& div.expResult': {
                fontSize: '0.9rem',
                margin: '0 .2rem 0',
                padding: '0.5rem 0.5rem 0 0.5rem',
                '& > section': {
                    paddingTop: '0.2rem',
                },
            },
            '& div.form': {
                background: '#f0f0f0',
                padding: '0.3rem 0.5rem',
                borderRadius: '0.9rem',
                fontSize: '0.9rem',
                margin: '0.5rem .5rem 0',
            },
            '& section': {
                display: 'flex',
                flex: '0 auto',
                paddingTop: '0.5rem',
                '&.first': {
                    paddingTop: 0,
                },
                '& > label': {
                    marginRight: 'auto',
                    marginTop: 0,
                },
                '& > div': {
                    display: 'flex',
                    alignItems: 'center',
                },
                '& svg': {
                    width: '1rem',
                    height: '1rem',
                    paddingRight: '0.2rem',
                },
                '& > div > div.MuiSelect-select': {
                    fontSize: '0.9rem',
                    padding: '0 1.5rem 0 0',
                },
                '& button.MuiToggleButtonGroup-grouped': {
                    padding: '0.2rem 0.4rem',
                    textTransform: 'none',
                },
                '& div.numeric input': {
                    padding: '2px 0',
                },
            },
        },
    },
})

const StyledSlider = styled(SliderEx)({
    color: '#79d073',
    height: 8,
    '@media (pointer: coarse)': {
        padding: 0,
    },
    padding: 0,
    '& .MuiSlider-thumb': {
        width: '14px',
        height: '13px',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&::before': {
            display: 'none',
        },
    },
    '& .MuiSlider-rail': {
        backgroundColor: '#ccc',
    },
});

const CandyResultPreview = React.memo(({ iv, value }: {
    iv: PokemonIv,
    value: CalcLevelResult,
}) => {
    const { t } = useTranslation();

    const isMaxLevel = value.level === maxLevel;
    let expToGo = "";
    if (!isMaxLevel) {
        const expToNextLevel = calcExp(value.level, value.level + 1, iv) - value.expGot;
        expToGo = [t('exp to go1'), formatWithComma(expToNextLevel), t('exp to go2')]
            .filter(x => x !== "")
            .join(" ");
    }

    return <StyledCandyPreview>
        <span className="level">
            <span>Lv. {value.level}<br/>
            {!isMaxLevel && <small>{`(${expToGo})`}</small>}
            </span>
        </span>
        <span className="candy">
            <CandyIcon/>
            {formatWithComma(value.candyUsed)}
        </span>
        <span className="shard">
            <DreamShardIcon/>
            {formatWithComma(value.shards)}
        </span>
    </StyledCandyPreview>;
});

const StyledCandyPreview = styled('footer')({
    color: '#666',
    fontSize: '0.8rem',
    paddingTop: '0.2rem',
    paddingLeft: '1.2rem',
    display: 'grid',
    gridTemplateColumns: '6rem 3.5rem 1fr',
    alignItems: 'start',
    lineHeight: 1.1,
    '& > span': {
        display: 'flex',
        alignItems: 'center',
        '&.candy': { justifyContent: 'end' },
        '&.shard': { justifyContent: 'end' },
        '& > small': {
            paddingLeft: '0.2rem',
            fontSize: '0.6rem',
        },
        '& > svg': {
            fontSize: '0.8rem',
        },
    },
});

export default CandyDialog;
