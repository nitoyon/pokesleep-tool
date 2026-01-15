import React from 'react';
import { styled } from '@mui/system';
import PokemonStrength, {
    getHelpsForCap, getRequiredHelperBoost, getHelpYield,
    StrengthParameter, StrengthResult,
} from '../../../util/PokemonStrength';
import MainSkillIcon from '../MainSkillIcon';
import { IvAction } from '../IvState';
import SelectEx from '../../common/SelectEx';
import { getSkillValue } from '../../../util/MainSkill';
import { round1 } from '../../../util/NumberUtil';
import { Button, Dialog, DialogActions, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const HelpStackDialog = React.memo(({open, onClose, parameter, strength, result, dispatch}: {
    open: boolean,
    onClose: () => void,
    parameter: StrengthParameter,
    strength: PokemonStrength,
    result: StrengthResult,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();

    const onSkillLevelChange = React.useCallback((val: string) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            helperBoostLevel: parseInt(val, 10),
        }}});
    }, [dispatch, parameter]);
    const onSpeciesChange = React.useCallback((val: string) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            helperBoostSpecies: parseInt(val, 10),
        }}});
    }, [dispatch, parameter]);

    if (!open) {
        return <></>;
    }

    return <StyledHelpStackDialog open={open} onClose={onClose}>
        <article>
            <section className="first">
                <h2>{t('help yield')}:</h2>
                <span>{round1(getHelpYield(parameter, strength))}{t('berry unit')}/{Math.abs(parameter.period)}{t('help unit')}</span>
            </section>
            <footer>{t('help yield description', { n: Math.abs(parameter.period) })}</footer>
            <section>
                <h2>{t('helps for cap')}:</h2>
                <span>{round1(getHelpsForCap(strength, result))}{t('help unit')}</span>
            </section>
            <footer>{t('helps for cap description')}</footer>
            <section>
                <h2>{t('required helper boost')}:</h2>
                <span>{round1(getRequiredHelperBoost(parameter, strength, result))}{t('times unit')}</span>
            </section>
            <footer>{t('required helper boost description')}</footer>
        </article>
        <footer>
            <h3><MainSkillIcon mainSkill='Helper Boost'/>{t('skills.Helper Boost')}</h3>
            <section className="first">
                <label>{t('skill level')}:</label>
                <SelectEx value={parameter.helperBoostLevel} onChange={onSkillLevelChange}>
                    <MenuItem dense value={1}>1</MenuItem>
                    <MenuItem dense value={2}>2</MenuItem>
                    <MenuItem dense value={3}>3</MenuItem>
                    <MenuItem dense value={4}>4</MenuItem>
                    <MenuItem dense value={5}>5</MenuItem>
                    <MenuItem dense value={6}>6</MenuItem>
                </SelectEx>
            </section>
            <section>
                <label>{t('different species')}:</label>
                <SelectEx value={parameter.helperBoostSpecies} onChange={onSpeciesChange}>
                    <MenuItem dense value={1}>1</MenuItem>
                    <MenuItem dense value={2}>2</MenuItem>
                    <MenuItem dense value={3}>3</MenuItem>
                    <MenuItem dense value={4}>4</MenuItem>
                    <MenuItem dense value={5}>5</MenuItem>
                </SelectEx>
            </section>
            <section>
                <label>{t('helps per skill')}:</label>
                <span>{getSkillValue("Helper Boost", parameter.helperBoostLevel, parameter.helperBoostSpecies)}{t('times unit')}</span>
            </section>
        </footer>
        <DialogActions disableSpacing>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledHelpStackDialog>;
});

const StyledHelpStackDialog = styled(Dialog)({
    '& .MuiPaper-root': {
        '& > article': {
            padding: '0.8rem',
            maxWidth: '18rem',
            '& > section': {
                display: 'flex',
                flex: '0 auto',
                marginTop: '0.8rem',
                '&.first': {
                    marginTop: '0.2rem',
                },
                '& > h2': {
                    padding: '0 0 .2rem 0',
                    margin: 0,
                    fontSize: '0.9rem',
                    marginRight: 'auto',
                },
                '& > span': {
                    fontSize: '0.8rem',
                },
            },
            '& > footer': {
                fontSize: '0.7rem',
                color: '#666',
                padding: '0.1rem 0 0 0.7rem',
            },
        },
        '& > footer': {
            margin: '0.2rem 0.7rem 0 0.7rem',
            fontSize: '0.8rem',
            background: '#eee',
            borderRadius: '0.9rem',
            padding: '0.5rem 0.7rem',
            '& > h3': {
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: '#66cc66',
                margin: 0,
            },
            '& > section': {
                display: 'flex',
                flex: '0 auto',
                marginTop: '0.4rem',
                '& > label': {
                    padding: '0 0 .2rem 0',
                    margin: 0,
                    marginRight: 'auto',
                },
                '& > .MuiButtonBase-root': {
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    padding: '0 0.5rem',
                },
            },
        },
    },
});

export default HelpStackDialog;
