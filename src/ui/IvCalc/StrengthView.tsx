import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter } from '../../util/PokemonStrength';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import { Button, Collapse } from '@mui/material';
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
        <Collapse in={lowerTabIndex !== 2}>
            <StrengthParameterPreview>
                <ul>
                    <li>{period === 'whistle' ? t(period) : t('period') + ': ' + t(period)}</li>
                    <li>{t('field bonus (short)')}: {parameter.fieldBonus}%</li>
                    <li>{t('favorite berry (short)')}: {t(parameter.favorite ? 'on' : 'off')}</li>
                    <li>{t('good camp ticket (short)')}: {t(parameter.isGoodCampTicketSet ? 'on' : 'off')}</li>
                    <li>{t('entei event')}: {t(enteiEvent)}</li>
                </ul>
                <Button onClick={onEditClick} size="small">{t('edit')}</Button>
            </StrengthParameterPreview>
        </Collapse>
    </div>);
});

const StrengthParameterPreview = styled('div')({
    margin: '0.8rem 0 0 0',
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
                textAlign: 'right',
            }
        },
    },
});

export default StrengthView;
