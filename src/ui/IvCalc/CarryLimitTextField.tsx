import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import { MenuItem } from '@mui/material';
import SelectEx from '../common/SelectEx';
import { useTranslation } from 'react-i18next';

const CarryLimitTextField = React.memo(({iv, onChange}: {
    iv: PokemonIv,
    onChange: (evolvedCount: 0|1|2) => void,
}) => {
    const { t } = useTranslation();

    const inventory = iv.ribbonCarryLimit +
        iv.subSkills.getActiveSubSkills(iv.level).reduce((p, c) => p + c.inventory, 0) * 6;
    const renderValue = React.useCallback((value: string|number) => {
        if (typeof(value) === 'number') {
            return inventory + iv.pokemon.carryLimit + 5 * value;
        }
        return "";
    }, [inventory, iv.pokemon.carryLimit]);
    const onChangeHandler = React.useCallback((value: string) => {
        onChange(parseInt(value) as 0|1|2);
    }, [onChange]);

    if (iv.pokemon.evolutionCount <= 0) {
        return <span style={{paddingBottom: '3px'}}>{iv.carryLimit}</span>;
    }

    let menuItems: React.ReactNode[] = [];
    for (let i = 0; i <= iv.pokemon.evolutionCount; i++) {
        const val = iv.pokemon.evolutionCount - i;
        const carry = iv.pokemon.carryLimit + 5 * val + inventory;
        let desc = "";
        switch (val) {
            case 0: desc = t('not evolved'); break;
            case 1: desc = t('evolved once'); break;
            case 2: desc = t('evolved twice'); break;
        }
        menuItems.push(<CarryLimitMenuItem key={val} value={val} dense
            selected={val === iv.evolvedCount}>
            {carry}
            <span>({desc})</span>
        </CarryLimitMenuItem>);
    }

    return <SelectEx value={iv.evolvedCount} renderValue={renderValue}
        sx={{width: '2.5rem', fontSize: '0.9rem'}}
        onChange={onChangeHandler}>
        {menuItems}
    </SelectEx>;
});

const CarryLimitMenuItem = styled(MenuItem)({
    '& > span': {
        paddingLeft: '0.8rem',
        fontSize: '0.8rem',
        color: '#999',
    },
});

export default CarryLimitTextField;
