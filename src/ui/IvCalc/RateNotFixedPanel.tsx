import React from 'react';
import { styled } from '@mui/system';
import {
    Button, Dialog, DialogContent, DialogActions,
    Input, InputAdornment,
} from '@mui/material'; 
import IvState, { IvAction } from './IvState';
import { createStrengthParameter, MewParameter } from '../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const RateNotFixedPanel = React.memo(({dispatch, state}: {
    dispatch: React.Dispatch<IvAction>,
    state: IvState,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);

    const onConfigClick = React.useCallback(() => {
        setOpen(true);
    }, []);
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    if (!state.pokemonIv.pokemon.rateNotFixed) {
        return null;
    }

    return <div style={{
        border: '1px solid red',
        background: '#ffeeee',
        color: 'red',
        fontSize: '0.9rem',
        borderRadius: '0.5rem',
        marginTop: '3px',
        padding: '0 0.3rem',
    }}>{t('rate is not fixed')}
        <Button onClick={onConfigClick} sx={{padding: '0 5px', minWidth: '2rem'}}>
            [{t('settings')}]
        </Button>
        <RateNotFixedDialog dispatch={dispatch} state={state}
            open={open} onClose={onClose}/>
    </div>
});

const RateNotFixedDialog = React.memo(({dispatch, state, open, onClose}: {
    dispatch: React.Dispatch<IvAction>,
    open: boolean,
    state: IvState,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const onMewParamChange = React.useCallback((value: MewParameter) => {
        dispatch({
            type: 'changeParameter',
            payload: {
                parameter: {
                    ...state.parameter,
                    mew: value,
                },
            },
        });
    }, [dispatch, state.parameter]);

    const onIngChange = React.useCallback((value: number) => {
        onMewParamChange({
            ...state.parameter.mew,
            ing: value,
        });
    }, [onMewParamChange, state.parameter.mew]);

    const onSkill1Change = React.useCallback((value: number) => {
        onMewParamChange({
            ...state.parameter.mew,
            skill1: value,
        });
    }, [onMewParamChange, state.parameter.mew]);

    const onSkill2Change = React.useCallback((value: number) => {
        onMewParamChange({
            ...state.parameter.mew,
            skill2: value,
        });
    }, [onMewParamChange, state.parameter.mew]);

    const onSkill3Change = React.useCallback((value: number) => {
        onMewParamChange({
            ...state.parameter.mew,
            skill3: value,
        });
    }, [onMewParamChange, state.parameter.mew]);

    const onSuccessChange = React.useCallback((value: number) => {
        onMewParamChange({
            ...state.parameter.mew,
            success: value,
        });
    }, [onMewParamChange, state.parameter.mew]);

    const onClear = React.useCallback(() => {
        onMewParamChange(createStrengthParameter({}).mew);
    }, [onMewParamChange]);

    if (!open) {
        return null;
    }

    const mew = state.parameter.mew;

    return <Dialog open={open} onClose={onClose}>
        <StyledDialogContent>
            <header>{t('rate is not fixed title', {name: t('pokemons.Mew')})}</header>
            <section>
                <label>{t('ingredient rate')}:</label>
                <RateTextField min={0} max={100} value={mew.ing}
                    onChange={onIngChange}/>
            </section>
            <section>
                <label>{t('skill rate')}:</label>
            </section>
            <div style={{marginLeft: '1rem'}}>
                <section>
                    <label>{t('high chance')}:</label>
                    <RateTextField min={0} max={100} value={mew.skill1}
                        onChange={onSkill1Change}/>
                </section>
                <footer>
                    {t('skills.Charge Strength S')}
                    {t('text separator')}
                    {t('skills.Charge Energy S')}
                </footer>
                <section>
                    <label>{t('medium chance')}:</label>
                    <RateTextField min={0} max={100} value={mew.skill2}
                        onChange={onSkill2Change}/>
                </section>
                <footer>
                    {t('skills.Metronome')}
                    {t('text separator')}
                    {t('skills.Extra Helpful S')}
                    {t('text separator')}
                    {t('skills.Dream Shard Magnet S')}
                    {t('text separator')}
                    {t('skills.Charge Strength M')}
                    {t('text separator')}
                    {t('skills.Energizing Cheer S')}
                    {t('text separator')}
                    {t('skills.Cooking Power-Up S')}
                    {t('text separator')}
                    {t('skills.Tasty Chance S')}
                </footer>
                <section>
                    <label>{t('low chance')}:</label>
                    <RateTextField min={0} max={100} value={mew.skill3}
                        onChange={onSkill3Change}/>
                </section>
                <footer>
                    {t('skills.Energy for Everyone S')}
                    {t('text separator')}
                    {t('skills.Berry Burst')}
                </footer>
            </div>
            <section>
                <label>{t('additional candy')}:</label>
                <RateTextField min={0} max={100} value={mew.success}
                    onChange={onSuccessChange}/>
            </section>
            <footer>
                {t('additional candy description')}
            </footer>
        </StyledDialogContent>
        <DialogActions>
            <Button onClick={onClear}>{t('clear')}</Button>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

const StyledDialogContent = styled(DialogContent)({
    paddingBottom: 0,
    '& > header': {
        margin: '0 0 1rem 0',
        color: '#666',
        fontSize: '0.9rem',
    },
    '& section': {
        display: 'flex',
        flex: '0 auto',
        alignItems: 'center',
        maxWidth: '40rem',
        minWidth: '13rem',
        marginTop: '0.4rem',
        '& > label': {
            marginRight: 'auto',
            fontSize: '0.9rem',
        },
        '& > div': {
            marginRight: 0,
            '& > input': {
                padding: 0,
                fontSize: '0.9rem',
            },
            '& > div.MuiInputAdornment-root > p': {
                color: '#999',
                fontSize: '0.8rem',
            },
        },
    },
    '& footer': {
        padding: '4px 0',
        color: '#999',
        fontSize: '0.75rem',
    },
});

const RateTextField = React.memo(({min, max, value, onChange}: {
    min: number,
    max: number,
    value: number,
    onChange: (value: number) => void,
}) => {
    const [focused, setFocused] = React.useState(false);
    const [rawText, setRawText] = React.useState(value.toString());

    const onFocus = React.useCallback(() => {
        setFocused(true);
        setRawText(value.toFixed(1));
    }, [value]);

    const onBlur = React.useCallback(() => {
        setFocused(false);
    }, []);

    const onChangeHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setRawText(e.target.value);

        const v = parseFloat(e.target.value);
        if (v !== value && min <= v && v <= max) {
            onChange(v);
        }
    }, [min, max, onChange, value]);

    const text = (focused ? rawText : value.toFixed(1));

    return <Input value={text}
        onFocus={onFocus} onBlur={onBlur} onChange={onChangeHandler}
        endAdornment={<InputAdornment position="end">%</InputAdornment>}
        sx={{width: '4rem'}}
        slotProps={{
            input: {
                sx: {
                    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                    },
                    '-moz-appearance': 'textfield',
                },
            }
        }}
        inputProps={{
            inputMode: "decimal",
            min: min,
            max: max,
            step: 0.1,
            type: "number",
        }}/>
});

export default RateNotFixedPanel;
