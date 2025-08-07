import React from 'react';
import TypeSelect from '../TypeSelect';
import { isExpertField } from '../../../data/fields';
import { PokemonType } from '../../../data/pokemons';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { Select, SelectChangeEvent, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FavoriteBerrySelect = React.memo(({value, onChange}: {
    value: StrengthParameter,
    onChange: (value: StrengthParameter) => void
}) => {
    const { t } = useTranslation();
    const expert = isExpertField(value.fieldIndex);

    const onFavoriteBerryChange1 = React.useCallback((type: PokemonType) => {
        const favoriteType = [value.favoriteType[0] ?? "normal",
            value.favoriteType[1] ?? "normal",
            value.favoriteType[2] ?? "normal"];
        favoriteType[0] = type;
        onChange({...value, favoriteType});
    }, [onChange, value]);
    const onFavoriteBerryChange2 = React.useCallback((type: PokemonType) => {
        const favoriteType = [value.favoriteType[0] ?? "normal",
            value.favoriteType[1] ?? "normal",
            value.favoriteType[2] ?? "normal"];
        favoriteType[1] = type;
        onChange({...value, favoriteType});
    }, [onChange, value]);
    const onFavoriteBerryChange3 = React.useCallback((type: PokemonType) => {
        const favoriteType = [value.favoriteType[0] ?? "normal",
            value.favoriteType[1] ?? "normal",
            value.favoriteType[2] ?? "normal"];
        favoriteType[2] = type;
        onChange({...value, favoriteType});
    }, [onChange, value]);
    const onMainBerryHelpingSpeedBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, mainBerryHelpingSpeedBonus: parseInt(e.target.value, 10)});
    }, [onChange, value]);
    const onMainBerryCarryLimitBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, mainBerryCarryLimitBonus: parseInt(e.target.value, 10)});
    }, [onChange, value]);
    const onNonFavoriteBerryHelpingSpeedPenaltyChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, nonFavoriteBerryHelpingSpeedPenalty: parseInt(e.target.value, 10)});
    }, [onChange, value]);

    if (expert === true) {
        const mainBerrySpeed = [];
        const mainBerryCarryLimit = [];
        const nonFavBerrySpeed = [];
        for (let i = 0; i <= 30; i++) {
            mainBerrySpeed.push(
                <MenuItem key={i} value={i} dense>
                    {i}%
                </MenuItem>
            );
            mainBerryCarryLimit.push(
                <MenuItem key={i} value={i} dense>
                    {i}%
                </MenuItem>
            );
            nonFavBerrySpeed.push(
                <MenuItem key={i} value={i} dense>
                    -{i}%
                </MenuItem>
            );
        }
        return <>
            <section>
                <label>{t('main favorite berry')}:</label>
                <span>
                    <TypeSelect type={value.favoriteType[0]} size="small"
                        onChange={onFavoriteBerryChange1}/>
                </span>
            </section>
            <section>
                <label>{t('sub favorite berries')}:</label>
                <span>
                    <TypeSelect type={value.favoriteType[1]} size="small"
                        onChange={onFavoriteBerryChange2}/>
                    <TypeSelect type={value.favoriteType[2]} size="small"
                        onChange={onFavoriteBerryChange3}/>
                </span>
            </section>
            <section>
                <label>{t('main favorite berry helping speed')}:</label>
                <Select variant="standard" size="small"
                    value={value.mainBerryHelpingSpeedBonus.toString()}
                    onChange={onMainBerryHelpingSpeedBonusChange}>
                    {mainBerrySpeed}
                </Select>
            </section>
            <section>
                <label>{t('main favorite berry carry limit')}:</label>
                <Select variant="standard" size="small"
                    value={value.mainBerryCarryLimitBonus.toString()}
                    onChange={onMainBerryCarryLimitBonusChange}>
                    {mainBerrySpeed}
                </Select>
            </section>
            <section>
                <label>{t('non favorite berry helping speed')}:</label>
                <Select variant="standard" size="small"
                    value={value.nonFavoriteBerryHelpingSpeedPenalty.toString()}
                    onChange={onNonFavoriteBerryHelpingSpeedPenaltyChange}>
                    {nonFavBerrySpeed}
                </Select>
            </section>
        </>;
    }

    return <section>
        <label>{t('favorite berry')}:</label>
        <span>
            <TypeSelect type={value.favoriteType[0]} size="small"
                onChange={onFavoriteBerryChange1}/>
            <TypeSelect type={value.favoriteType[1]} size="small"
                onChange={onFavoriteBerryChange2}/>
            <TypeSelect type={value.favoriteType[2]} size="small"
                onChange={onFavoriteBerryChange3}/>
        </span>
    </section>;
});

export default FavoriteBerrySelect;
