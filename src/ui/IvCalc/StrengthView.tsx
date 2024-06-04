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

    let area = t(`area.${parameter.fieldIndex}`);
    if (parameter.fieldIndex === 0) {
        area += " (" +
            parameter.favoriteType.map(x => t(`types.${x}`)).join(", ") + ")";
    }
    const period = (parameter.period === 24 ? '1day' :
        parameter.period === 168 ? '1week' : 'whistle');

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}/>
        <Collapse in={lowerTabIndex !== 2}>
            <StrengthParameterPreview>
                <ul>
                    <li>{area} ({parameter.fieldBonus}%)</li>
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
                paddingRight: 0,
            }
        },
    },
});

export default StrengthView;
