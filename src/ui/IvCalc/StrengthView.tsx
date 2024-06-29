import React from 'react';
import { styled } from '@mui/system';
import IvState, { IvAction } from './IvState';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import { Button, Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';

const StrengthView = React.memo(({state, dispatch}: {
    state: IvState,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const pokemonIv = state.pokemonIv;
    const parameter = state.parameter;
    const lowerTabIndex = state.lowerTabIndex;

    const onEditClick = React.useCallback(() => {
        dispatch({type: "changeLowerTab", payload: {index: 2}});
    }, [dispatch]);

    let area;
    if (parameter.fieldIndex < 0) {
        area = `${t('area bonus')}: ${parameter.fieldBonus}%`;
    }
    else {
        if (parameter.fieldIndex !== 0) {
            area = t(`area.${parameter.fieldIndex}`);
        }
        else {
            area = t('area.0') + " (" +
                parameter.favoriteType.map(x => t(`types.${x}`)).join(", ") + ")";
        }
        area += ` (${parameter.fieldBonus}%)`;
    }
    const period = (parameter.period === 24 ? '1day' :
        parameter.period === 168 ? '1week' : 'whistle');

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}
            energyDialogOpen={state.energyDialogOpen} dispatch={dispatch}/>
        <Collapse in={lowerTabIndex !== 2}>
            <StrengthParameterPreview>
                <ul>
                    <li>{area}</li>
                    <li>{t('period')}: {t(period)}</li>
                    {parameter.level !== 0 && <li><strong>{t('level')}: {parameter.level}</strong></li>}
                    {parameter.maxSkillLevel && <li><strong>{t('calc with max skill level (short)')}</strong></li>}
                    <li>{t('good camp ticket (short)')}: {t(parameter.isGoodCampTicketSet ? 'on' : 'off')}</li>
                </ul>
                <Button onClick={onEditClick} size="small">{t('edit')}</Button>
            </StrengthParameterPreview>
        </Collapse>
    </div>);
});

const StrengthParameterPreview = styled('div')({
    marginTop: '0.2rem',
    padding: '.4rem .6rem',
    border: '1px solid #ccc',
    borderRadius: '1rem',
    background: '#f3f5f0',
    fontSize: '0.8rem',
    display: 'flex',
    '& > ul': {
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        '& > li': {
            display: 'block',
            paddingRight: '1rem',
            '&:last-child': {
                paddingRight: 0,
            }
        },
    },
});

export default StrengthView;
