import React from 'react';
import { styled } from '@mui/system';
import {
    Button, Checkbox, Dialog, DialogActions, FormControlLabel, IconButton,
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { formatWithComma } from '../../../util/NumberUtil';
import { StrengthParameter, StrengthResult } from '../../../util/PokemonStrength';
import CollapseEx from '../../common/CollapseEx';
import { IvAction } from '../IvState';
import SpecialtyButton from '../SpecialtyButton';
import BlockIcon from '@mui/icons-material/Block';
import { useTranslation } from 'react-i18next';

const TotalStrengthDialog = React.memo(({param, result, open, dispatch, onClose}: {
    param: StrengthParameter,
    result: StrengthResult,
    open: boolean,
    dispatch: React.Dispatch<IvAction>,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    const onDisableClick = React.useCallback((index: number) => {
        const totalFlags = [...param.totalFlags];
        if (index < totalFlags.length) {
            totalFlags[index] = !totalFlags[index];
        }
        dispatch({type: 'changeParameter', payload: {
            parameter: { ...param, totalFlags }
        }})
    }, [dispatch, param]);
    const onHelpingBonusEffectChange = React.useCallback(() => {
        dispatch({type: 'changeParameter', payload: {
            parameter: {
                ...param,
                addHelpingBonusEffect: !param.addHelpingBonusEffect
            },
        }});
    }, [dispatch, param]);

    return <StyledTotalStrengthDialog open={open} onClose={onClose}>
        <article>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                <span style={{transform: 'scale(1, 0.9)'}}>{formatWithComma(Math.round(result.totalStrength))}</span>
            </h1>
            <div className="grid">
                <SpecialtyButton disabled specialty="Berries"/>
                <div className={param.totalFlags[0] ? '': 'disabled'}>{formatWithComma(Math.round(result.berryTotalStrength))}</div>
                <IconButton size="small" onClick={() => onDisableClick(0)}
                    className={param.totalFlags[0] ? '': 'disabled'}>
                    <BlockIcon fontSize="small"/>
                </IconButton>
                <SpecialtyButton disabled specialty="Ingredients"/>
                <div className={param.totalFlags[1] ? '': 'disabled'}>{formatWithComma(Math.round(result.ingStrength))}</div>
                <IconButton size="small" onClick={() => onDisableClick(1)}
                    className={param.totalFlags[1] ? '': 'disabled'}>
                    <BlockIcon fontSize="small"/>
                </IconButton>
                <SpecialtyButton disabled specialty="Skills"/>
                <div className={param.totalFlags[2] ? '': 'disabled'}>{formatWithComma(Math.round(result.skillStrength + result.skillStrength2))}</div>
                <IconButton size="small" onClick={() => onDisableClick(2)}
                    className={param.totalFlags[2] ? '': 'disabled'}>
                    <BlockIcon fontSize="small"/>
                </IconButton>
            </div>
            <CollapseEx show={result.helpingBonusStrength > 0}>
                <footer className="helpingBonus">
                    <label>{t('helping bonus addition')}: </label>
                    <strong>{formatWithComma(result.helpingBonusStrength)}</strong>
                </footer>
            </CollapseEx>
            <FormControlLabel control={<Checkbox size="small" checked={param.addHelpingBonusEffect}
                onChange={onHelpingBonusEffectChange}/>} label={t('helping bonus addition label')} />
            <CollapseEx show={param.addHelpingBonusEffect}>
                <footer className="helpingBonusNote">
                    {t('helping bonus addition note')}
                </footer>
            </CollapseEx>

            <p>{t('strength detail1')}</p>
            <p>{t('strength detail2')}</p>
            <ul style={{paddingLeft: '1rem'}}>
                <li>{t('strength restriction2')}</li>
            </ul>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledTotalStrengthDialog>;
});

const StyledTotalStrengthDialog = styled(Dialog)({
    '& article': {
        margin: '0.8rem 0.8rem 0 0.8rem',
        '& > h1': {
            fontSize: '1.4rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
        },
        '& > div.grid': {
            margin: '0.2rem 0 0.5rem 1rem',
            display: 'grid',
            gridTemplateColumns: 'min-content min-content min-content',
            gridGap: '0.2rem 0rem',
            alignItems: 'center',
            '& > div': {
                textAlign: 'right',
                fontWeight: 'bold',
                paddingLeft: '0.5rem',
                '&.disabled': {
                    color: '#ccc',
                    textDecoration: 'line-through #ff0000',
                },
            },
            '& > button': {
                '& > svg': {
                    fill: '#ccc',
                },
                '&.disabled > svg': {
                    fill: '#ff0000',
                },
            },
        },
        '& footer.helpingBonus': {
            padding: '0 0 0.5rem 1rem',
            fontSize: '0.9rem',
        },
        '& > label.MuiFormControlLabel-root': {
            alignItems: 'start',
            marginRight: 0,
            '& > span.MuiFormControlLabel-label': {
                paddingTop: '0.5rem',
                fontSize: '0.9rem',
            },
        },
        '& footer.helpingBonusNote': {
            padding: '0 0 0.5rem 1.8rem',
            fontSize: '0.8rem',
            color: '#999',
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

export default TotalStrengthDialog;
