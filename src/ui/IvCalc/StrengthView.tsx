import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter } from '../../util/PokemonStrength';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const StrengthView = React.memo(({pokemonIv, parameter, lowerTabIndex, onParameterEdit}: {
    pokemonIv: PokemonIv,
    parameter: CalculateParameter,
    lowerTabIndex: number,
    onParameterEdit: () => void,
}) => {
    const { t } = useTranslation();

    const onEditClick = React.useCallback(() => {
        onParameterEdit();
    }, [onParameterEdit]);

    const period = (parameter.period === 24 ? '1day' :
        parameter.period === 168 ? '1week' : 'whistle');
    const enteiEvent = (parameter.event === 'entei 1st week' ? '1st week' :
        parameter.event === 'entei 2nd week' ? '2nd week' : 'none');

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}/>
        {lowerTabIndex !== 2 && <StrengthParameterPreview>
            <li>{t('period')}: {t(period)}</li>
            <li>{t('field bonus')}: {parameter.fieldBonus}%</li>
            <li>{t('favorite berry')}: {t(parameter.favorite ? 'on' : 'off')}</li>
            <li>{t('good camp ticket')}: {t(parameter.isGoodCampTicketSet ? 'on' : 'off')}</li>
            <li>{t('entei event')}: {t(enteiEvent)}</li>
            <li><Button onClick={onEditClick} size="small">{t('edit')}</Button></li>
        </StrengthParameterPreview>}
    </div>);
});

const StrengthParameterPreview = styled('ul')({
    margin: '0.8rem 0 0 0',
    padding: '.4rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '1rem',
    background: '#f3f5f0',
    fontSize: '0.8rem',
    listStyle: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    '& > li': {
        display: 'block',
        width: '50%',
        '&:last-child': {
            textAlign: 'right',
        }
    },
});

export default StrengthView;
