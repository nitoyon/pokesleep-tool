import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import calcExpAndCandy, { BoostEvent, calcExp, CalcExpAndCandyResult } from '../../util/Exp';
import Nature from '../../util/Nature';
import { formatWithComma } from '../../util/NumberUtil';
import { maxLevel } from '../../util/PokemonRp';
import LevelSelector from './IvForm/LevelSelector';
import { StyledNatureUpEffect, StyledNatureDownEffect } from './IvForm/NatureTextField';
import PokemonIcon from './PokemonIcon';
import DreamShardIcon from '../Resources/DreamShardIcon';
import CandyIcon from '../Resources/CandyIcon';
import { Button, Dialog, DialogActions, Input, InputAdornment, 
    MenuItem, Select, Slider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import { useTranslation } from 'react-i18next';

const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const CandyDialog = React.memo(({ id, iv, dstLevel, open, onChange, onClose }: {
    /**
     * Id to detect item has been changed
     *
     * When in the box, this ID is the same as the Pokémon's ID in the box.
     * When not in the box, this ID is the same as the Pokémon's level.
     */
    id: number,
    iv: PokemonIv,
    dstLevel?: number,
    open: boolean,
    onChange: (iv: PokemonIv) => void,
    onClose: () => void,
}
) => {
    const { t } = useTranslation();
    const [currentId, setCurrentId] = React.useState(id);
    const [currentLevel, setCurrentLevel] = React.useState(iv.level);
    const [expGot, setExpGot] = React.useState(0);
    const [isEmpty, setIsEmpty] = React.useState(false);
    const [maxExpLeft, setMaxExpLeft] = React.useState(0);
    const [targetLevel, setTargetLevel] = React.useState(maxLevel);
    const [expFactor, setExpFactor] = React.useState(0);
    const [candyBoost, setCandyBoost] = React.useState<BoostEvent>("none");
    const [shouldRender, setShouldRender] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            // Reset state when the dialog is opened for a different Pokémon,
            // when the current level has changed, or when the dialog is
            // shown for the first time.
            if (id === currentId && maxExpLeft > 0) {
                setShouldRender(true);
                return;
            }

            setCurrentId(id);
            setCurrentLevel(iv.level);
            setExpGot(0);
            setMaxExpLeft(calcExp(iv.level, iv.level + 1, iv));
            setExpFactor(iv.nature.expGainsFactor);
            setShouldRender(true);

            let level = 0;
            if (dstLevel !== undefined) {
                level = Math.min(dstLevel, maxLevel);
            }
            else if (iv.pokemon.specialty === "Berries") {
                level = 65;
            }
            else if (iv.pokemon.specialty === "Ingredients") {
                level = 60;
            }
            else {
                level = 50;
            }
            setTargetLevel(Math.max(level, iv.level));
        }
        else {
            setShouldRender(false);
        }
    }, [id, iv, currentId, currentLevel, dstLevel, open]);

    const onExpFactorChange = React.useCallback((e: any) => {
        const value = parseInt(e.target.value, 10);
        setExpFactor(value);
    }, []);

    const onCurrentLevelChange = React.useCallback((level: number) => {
        setCurrentLevel(level);
        setExpGot(0);
        setMaxExpLeft(calcExp(level, level + 1, iv));
        onChange(iv.changeLevel(level));
    }, [iv, onChange]);

    const onExpSliderChange = React.useCallback((e: any) => {
        if (e === null) {
            return;
        }

        // fix iOS bug on MUI slider
        // https://github.com/mui/material-ui/issues/31869
        if (isIOS && e.type === 'mousedown') {
            return;
        }

        setIsEmpty(false);
        setExpGot(e.target.value);
    }, []);

    const onExpLeftChange = React.useCallback((e: any) => {
        if (e === null) {
            return;
        }
        const rawText = e.target.value;

        // Update isEmpty state
        if (typeof(rawText) === "string" && rawText.trim() === "") {
            setIsEmpty(true);
            setExpGot(0);
            return;
        }

        let value = parseInt(rawText, 10);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        if (value > maxExpLeft) {
            value = maxExpLeft;
        }
        setIsEmpty(false);
        setExpGot(maxExpLeft - value);
    }, [maxExpLeft]);

    const onCanyBoostChange = React.useCallback((e: any, value: BoostEvent) => {
        if (value === null) {
            return;
        }
        setCandyBoost(value);
    }, []);

    if (!shouldRender) {
        return null;
    }

    const iv2 = iv.changeLevel(currentLevel);
    iv2.nature = expFactor === 1 ? new Nature('Timid') :
        expFactor === 0 ? new Nature('Serious') : new Nature('Relaxed'); 
    const result: CalcExpAndCandyResult =
        calcExpAndCandy(iv2, expGot, targetLevel, candyBoost);

    const valueText = isEmpty ? "" : maxExpLeft - expGot;

    return (<>
        <StyledDialog open={open} onClose={onClose}>
            <article>
                <div className="icon">
                    <PokemonIcon idForm={iv.idForm} size={80}/>
                </div>
                <div className="levels">
                    <div className="level">
                        <div className="levelInput">
                            <label>Lv.</label>
                            <LevelSelector value={currentLevel} onChange={onCurrentLevelChange}/>
                        </div>
                        <div className="expLeft">
                            <StyledSlider value={expGot}
                                min={0} max={maxExpLeft - 1} onChange={onExpSliderChange}/>
                            <Input value={valueText} type="number" size="small"
                                startAdornment={<InputAdornment position="start">{t('exp to go1')}</InputAdornment>}
                                endAdornment={<InputAdornment position="end">{t('exp to go2')}</InputAdornment>}
                                onChange={onExpLeftChange}
                                inputProps={{
                                    inputMode: "numeric",
                                }}
                                sx={{
                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                        WebkitAppearance: 'none',
                                    },
                                    '& input[type=number]': {
                                        MozAppearance: 'textfield',
                                    },
                                }}/>
                        </div>
                    </div>
                    <EastIcon/>
                    <div className="level">
                        <div className="levelInput">
                            <label>Lv.</label>
                            <LevelSelector value={targetLevel} onChange={setTargetLevel}/>
                        </div>
                    </div>
                </div>
                <div className="expResult">
                    <section>
                        <label>{t('required exp')}:</label>
                        <div>{formatWithComma(result.exp)}</div>
                    </section>
                </div>
                <div className="candyResult">
                    <section>
                        <label>{t('candy')}:</label>
                        <div><CandyIcon sx={{color: '#e7ba67'}}/>{formatWithComma(result.candy)}</div>
                    </section>
                    <section>
                        <label>{t('dream shard')}:</label>
                        <div><DreamShardIcon/>{formatWithComma(result.shards)}</div>
                    </section>
                    <section>
                        <label>{t('nature')}:</label>
                        <Select variant="standard" onChange={onExpFactorChange} value={expFactor}
                            size="small">
                            <MenuItem value={1}><StyledNatureUpEffect>{t('nature effect.EXP gains')}</StyledNatureUpEffect></MenuItem>
                            <MenuItem value={0}>{t('nature effect.EXP gains')} ーー</MenuItem>
                            <MenuItem value={-1}><StyledNatureDownEffect>{t('nature effect.EXP gains')}</StyledNatureDownEffect></MenuItem>
                        </Select>
                    </section>
                    <section>
                        <label>{t('candy boost')}:</label>
                        <ToggleButtonGroup size="small" exclusive
                            value={candyBoost} onChange={onCanyBoostChange}>
                            <ToggleButton value="none">{t('none')}</ToggleButton>
                            <ToggleButton value="mini">{t('mini candy boost')}</ToggleButton>
                            <ToggleButton value="unlimited">{t('normal candy boost')}</ToggleButton>
                        </ToggleButtonGroup>
                    </section>
                </div>
            </article>
            <DialogActions>
                <Button onClick={onClose}>{t("close")}</Button>
            </DialogActions>
        </StyledDialog>
    </>);
});

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        maxWidth: '22rem',
    },

    '& .MuiPaper-root': {
        width: '100%',

        '& > article': {
            padding: '.8rem .8rem 0 .8rem',
            '& > div.icon': {
                margin: '0 auto .5rem',
                width: '80px',
            },
            '& > div.levels': {
                display: 'flex',
                justifyContent: 'center',
                gap: '0.7rem',
                margin: '0 auto',
                '& > div.level': {
                    width: '7rem',
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
                        '& > button': {
                            color: '#79d073',
                            width: '3rem',
                            fontWeight: 'bold',
                            fontSize: '1.3rem !important',
                            paddingBottom: 0,
                            transform: 'scale(1, 0.9)',
                        },
                    },
                    '& > div.expLeft': {
                        paddingTop: '0.3rem',
                        '& > div.MuiInput-root': {
                            top: '-0.2rem',
                            '& > div.MuiInputAdornment-root > p': {
                                color: '#79d073',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transform: 'scale(1, 0.9)',
                            },
                            '& > input': {
                                padding: 0,
                                color: '#000000',
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
            },
            '& > div.expResult': {
                fontWeight: 'bold',
                fontSize: '1.2rem',
                margin: '2rem .5rem 0',
                padding: '0.5rem',
            },
            '& > div.candyResult': {
                background: '#f0f0f0',
                padding: '0.5rem',
                borderRadius: '0.9rem',
                fontSize: '0.9rem',
                margin: '0 .5rem',
            },
            '& section': {
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
                    '& > svg': {
                        width: '1rem',
                        height: '1rem',
                        paddingRight: '0.2rem',
                    }
                },
                '& > div > div.MuiSelect-select': {
                    fontSize: '0.9rem',
                    padding: '0 1.5rem 0 0',
                },
                '& button.MuiToggleButtonGroup-grouped': {
                    padding: '0.2rem 0.4rem',
                    textTransform: 'none',
                },
            },
        },
    },
})

const StyledSlider = styled(Slider)({
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

export default CandyDialog;
