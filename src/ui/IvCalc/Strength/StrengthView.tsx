import React from 'react';
import { styled } from '@mui/system';
import IvState, { IvAction } from '../IvState';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import PeriodSelect from './PeriodSelect';
import TextLikeButton from '../../common/TextLikeButton';
import { getActiveHelpBonus } from '../../../data/events';
import { isExpertField } from '../../../data/fields';
import {
    allFavoriteFieldIndex, noFavoriteFieldIndex,
} from '../../../util/PokemonStrength';
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

    const onCampTicketClick = React.useCallback(() => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            isGoodCampTicketSet: !parameter.isGoodCampTicketSet,
        }}});
    }, [dispatch, parameter]);

    let area: React.ReactNode, fieldBonus: React.ReactNode;
    if (parameter.fieldIndex === allFavoriteFieldIndex) {
        area = t('favorite berry') + ': ' + t('all');
    }
    else if (parameter.fieldIndex === noFavoriteFieldIndex) {
        area = t('favorite berry') + ': ' + t('none');
    }
    else if (parameter.fieldIndex === 0) {
        area = parameter
            .favoriteType.map(x => t(`types.${x}`))
            .join(t('text separator'));
    }
    else if (isExpertField(parameter.fieldIndex)) {
        area = <>
            {t(`types.${parameter.favoriteType[0]}`)}
            <small> ({t('main')})</small>
            {t('text separator')}
            {t(`types.${parameter.favoriteType[1]}`)}
            {t('text separator')}
            {t(`types.${parameter.favoriteType[2]}`)}
        </>;
    }
    else {
        area = t(`area.${parameter.fieldIndex}`);
    }
    fieldBonus = <small> ({parameter.fieldBonus}%)</small>;

    const isEventScheduled = getActiveHelpBonus(new Date()).length > 0 || parameter.event !== 'none';

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}
            energyDialogOpen={state.energyDialogOpen} dispatch={dispatch}/>
        <Collapse in={lowerTabIndex !== 2}>
            <StrengthParameterPreview>
                <ul>
                    <li>{area}{fieldBonus}</li>
                    <li><PeriodSelect dispatch={dispatch} value={parameter}/></li>
                    {parameter.level !== 0 && <li><strong>Lv.{parameter.level}</strong></li>}
                    {parameter.maxSkillLevel && <li><strong>{t('calc with max skill level (short)')}</strong></li>}
                    {parameter.period > 0 && <li>
                        <>{t('good camp ticket (short)')}: </>
                        <TextLikeButton onClick={onCampTicketClick} style={{width: '2rem'}}>{t(parameter.isGoodCampTicketSet ? 'on' : 'off')}</TextLikeButton>
                    </li>}
                    {isEventScheduled && <li>{parameter.event === 'none' ? t('no event') :
                        parameter.event === 'advanced' ? t('event') + ': ' + t('events.advanced') :
                        t('events.' + parameter.event)}</li>}
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
            },
            '& > button.MuiButtonBase-root': {
                fontSize: '0.8rem',
                lineHeight: 1.5,
            },
        },
    },
    '& > button': {
        minWidth: 'auto',
        textWrap: 'nowrap',
    }
});

export default StrengthView;
