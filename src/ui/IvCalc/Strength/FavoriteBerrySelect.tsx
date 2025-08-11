import React from 'react';
import TypeSelect from '../TypeSelect';
import { isExpertField } from '../../../data/fields';
import { PokemonType } from '../../../data/pokemons';
import { ExpertEffects, StrengthParameter } from '../../../util/PokemonStrength';
import { Collapse, Select, SelectChangeEvent, MenuItem } from '@mui/material';
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
    const onExpertEffectChange = React.useCallback((expertEffect: ExpertEffects) => {
        onChange({...value, expertEffect});
    }, [onChange, value]);
    const onExpertIngEffectRatioChange = React.useCallback((e: SelectChangeEvent) => {
        const expertIngEffectRatio = parseInt(e.target.value, 10);
        onChange({...value, expertIngEffectRatio});
    }, [onChange, value]);

    if (expert === true) {
        const ingRatioMenu = [];
        for (let i = 0; i <= 50; i++) {
            ingRatioMenu.push(
                <MenuItem key={i} value={i} dense>
                    {i}%
                </MenuItem>
            );
        }
        return <>
            <section className="first">
                <label>{t('main favorite berry')}:</label>
                <span>
                    <TypeSelect type={value.favoriteType[0]} size="small"
                        onChange={onFavoriteBerryChange1}/>
                </span>
            </section>
            <section>
                <label>{t('sub1 favorite berry')}:</label>
                <span>
                    <TypeSelect type={value.favoriteType[1]} size="small"
                        onChange={onFavoriteBerryChange2}/>
                </span>
            </section>
            <section>
                <label>{t('sub2 favorite berry')}:</label>
                <span>
                    <TypeSelect type={value.favoriteType[2]} size="small"
                        onChange={onFavoriteBerryChange3}/>
                </span>
            </section>
            <section>
                <label>{t('expert effect')}:</label>
                <ExpertEffectSelect value={value.expertEffect}
                    onChange={onExpertEffectChange}/>
            </section>
            <Collapse in={value.expertEffect === "ing"}>
                <section>
                    <label>{t('expert ing effect ratio')}:</label>
                    <Select variant="standard" size="small"  
                        value={value.expertIngEffectRatio.toString()}
                        onChange={onExpertIngEffectRatioChange}>
                        {ingRatioMenu}
                    </Select>
                </section>
            </Collapse>
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

const ExpertEffectSelect = React.memo(({value, onChange}: {
    value: ExpertEffects,
    onChange: (value: ExpertEffects) => void,
}) => {
    const { t } = useTranslation();

    const onChangeHandler = React.useCallback((e: SelectChangeEvent) => {
        onChange(e.target.value as ExpertEffects);
    }, [onChange])

    return <Select variant="standard" value={value} onChange={onChangeHandler}>
        <MenuItem value="berry">{t('expert berry effect')}</MenuItem>
        <MenuItem value="ing">{t('expert ing effect')}<br/><small>{t('expert ing effect2')}</small></MenuItem>
        <MenuItem value="skill">{t('expert skill effect')}</MenuItem>
    </Select>;
});

export default FavoriteBerrySelect;
