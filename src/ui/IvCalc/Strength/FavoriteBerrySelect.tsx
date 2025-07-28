import React from 'react';
import TypeSelect from '../TypeSelect';
import { isExpertField } from '../../../data/fields';
import { PokemonType } from '../../../data/pokemons';
import { StrengthParameter } from '../../../util/PokemonStrength';
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

    if (expert === true) {
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
