import React from 'react';
import {
    Divider, MenuItem, Select, SelectChangeEvent,
} from '@mui/material';
import { IvAction } from '../IvState';
import {
    StrengthParameter, whistlePeriod,
} from '../../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const PeriodSelect = React.memo(({value, dispatch}: {
    value: StrengthParameter,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();

    const onPeriodChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: {
            parameter: {
                ...value,
                period: parseInt(e.target.value, 10),
            },
        }});
    }, [dispatch, value]);

    return <Select variant="standard" onChange={onPeriodChange} value={value.period.toString()}>
        <MenuItem value={1}>{t('1hour')}</MenuItem>
        <MenuItem value={3}>{t('3hours')}</MenuItem>
        <MenuItem value={8}>{t('8hours')}</MenuItem>
        <MenuItem value={16}>{t('16hours')}</MenuItem>
        <MenuItem value={24}>{t('1day')}</MenuItem>
        <MenuItem value={168}>{t('1week')}</MenuItem>
        <MenuItem value={whistlePeriod}>{t('whistle')}</MenuItem>
        <Divider/>
        <MenuItem value={-10}>{t('help x10')}</MenuItem>
        <MenuItem value={-30}>{t('help x30')}</MenuItem>
        <MenuItem value={-100}>{t('help x100')}</MenuItem>
    </Select>;
});

export default PeriodSelect;
