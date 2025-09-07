import React from 'react';
import { Collapse, Switch } from '@mui/material';
import AreaBonusControl from './AreaBonusControl';
import FavoriteBerrySelect from './FavoriteBerrySelect';
import ResearchAreaSelect from './ResearchAreaSelect';
import { StrengthParameter, whistlePeriod } from '../../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const AreaSelectControl = React.memo(({value, onChange}: {
    onChange: (value: StrengthParameter) => void,
    value: StrengthParameter,
}) => {
    const { t } = useTranslation();

    const onFieldBonusChange = React.useCallback((fieldBonus: number) => {
        onChange({...value, fieldBonus});
    }, [onChange, value]);
    const onGoodCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, isGoodCampTicketSet: e.target.checked});
    }, [onChange, value]);

    const isNotWhistle = (value.period !== whistlePeriod);
    return <>
        <section className="first">
            <label>{t('research area')}:</label>
            <ResearchAreaSelect value={value} fontSize="0.9rem"
                onChange={onChange}/>
        </section>
        <Collapse in={value.fieldIndex >= 0}>
            <FavoriteBerrySelect value={value} onChange={onChange}/>
        </Collapse>
        <section>
            <label>{t('area bonus')}:</label>
            <AreaBonusControl value={value.fieldBonus}
                onChange={onFieldBonusChange}/>
        </section>
        <Collapse in={isNotWhistle}>
            <section>
                <label>{t('good camp ticket')}:</label>
                <Switch checked={value.isGoodCampTicketSet} size="small"
                    onChange={onGoodCampTicketChange}/>
            </section>
        </Collapse>
    </>;
});

export default AreaSelectControl;
