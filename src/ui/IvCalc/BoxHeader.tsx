import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from './IvState';
import { BoxSortType } from './BoxView';
import PokemonStrength, { StrengthParameter } from '../../util/PokemonStrength';
import { Select, SelectChangeEvent, MenuItem }  from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxHeader = React.memo(({sortType, parameter, dispatch}: {
    sortType: BoxSortType,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
}) => {
    const { t } = useTranslation();

    const onChange = React.useCallback((value: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);
    const onLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...parameter, level: parseInt(e.target.value, 10) as 0|10|25|30|50|55|60|75|100})
    }, [onChange, parameter])

    if (sortType !== "berry") {
        return <></>;
    }
    return <StyledBoxHeader>
        <span>
            <label>{t('level')}:</label>
            <Select variant="standard" onChange={onLevelChange} value={parameter.level.toString()}>
                <MenuItem value={0}>{t('current level')}</MenuItem>
                <MenuItem value={10}>Lv. 10</MenuItem>
                <MenuItem value={25}>Lv. 25</MenuItem>
                <MenuItem value={30}>Lv. 30</MenuItem>
                <MenuItem value={50}>Lv. 50</MenuItem>
                <MenuItem value={55}>Lv. 55</MenuItem>
                <MenuItem value={60}>Lv. 60</MenuItem>
                <MenuItem value={75}>Lv. 75</MenuItem>
                <MenuItem value={100}>Lv. 100</MenuItem>
            </Select>
        </span>
    </StyledBoxHeader>;
});

const StyledBoxHeader = styled('div')({
    position: 'sticky',
    padding: '.4rem .6rem',
    border: '1px solid #ccc',
    borderRadius: '1rem',
    background: '#f3f5f0',
});

export default BoxHeader;
