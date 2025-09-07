import React from 'react';
import { MenuItem } from '@mui/material';
import { IvAction } from '../IvState';
import SelectEx from '../../common/SelectEx';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const FixedLevelSelect = React.memo(({value, dispatch, sx}: {
    value: StrengthParameter,
    dispatch: React.Dispatch<IvAction>,
    sx?: object,
}) => {
    const { t } = useTranslation();

    const onLevelChange = React.useCallback((val: string) => {
        dispatch({type: "changeParameter", payload: {parameter: {
            ...value,
            level: parseInt(val, 10) as 0|10|25|30|50|55|60|75|100,
        }}});
    }, [dispatch, value]);

    return <SelectEx sx={sx} value={value.level} onChange={onLevelChange}>
        <MenuItem value={0}>{t('current level')}</MenuItem>
        <MenuItem value={10}>Lv. 10</MenuItem>
        <MenuItem value={25}>Lv. 25</MenuItem>
        <MenuItem value={30}>Lv. 30</MenuItem>
        <MenuItem value={50}>Lv. 50</MenuItem>
        <MenuItem value={60}>Lv. 60</MenuItem>
        <MenuItem value={65}>Lv. 65</MenuItem>
        <MenuItem value={75}>Lv. 75</MenuItem>
        <MenuItem value={100}>Lv. 100</MenuItem>
    </SelectEx>;
});

export default FixedLevelSelect;
