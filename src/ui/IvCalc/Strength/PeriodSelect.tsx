import React from 'react';
import { Divider, MenuItem } from '@mui/material';
import { IvAction } from '../IvState';
import SelectEx from '../../common/SelectEx';
import {
    StrengthParameter, whistlePeriod,
} from '../../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const PeriodSelect = React.memo(({value, dispatch}: {
    value: StrengthParameter,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();

    const onPeriodChange = React.useCallback((val: string) => {
        dispatch({type: "changeParameter", payload: {
            parameter: {
                ...value,
                period: parseInt(val, 10),
            },
        }});
    }, [dispatch, value]);

    return <SelectEx onChange={onPeriodChange} value={value.period}
        menuSx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
        }}
    >
        <MenuItem value={1} dense>{t('1hour')}</MenuItem>
        <MenuItem value={3} dense>{t('3hours')}</MenuItem>
        <MenuItem value={8} dense>{t('8hours')}</MenuItem>
        <MenuItem value={16} dense>{t('16hours')}</MenuItem>
        <MenuItem value={24} dense>{t('1day')}</MenuItem>
        <MenuItem value={168} dense>{t('1week')}</MenuItem>
        <Divider style={{gridColumn: '1 / -1'}}/>
        <MenuItem value={-10} dense>{t('help x10')}</MenuItem>
        <MenuItem value={-30} dense>{t('help x30')}</MenuItem>
        <MenuItem value={-100} dense>{t('help x100')}</MenuItem>
        <MenuItem value={whistlePeriod} dense>{t('whistle')}</MenuItem>
    </SelectEx>;
});

export default PeriodSelect;
