import React from 'react';
import { styled } from '@mui/system';
import TypeButton from '../TypeButton';
import TypeSelect from '../TypeSelect';
import { getEventBonus } from '../../../data/events';
import { getFavoriteBerries, isExpertField } from '../../../data/fields';
import { PokemonType } from '../../../data/pokemons';
import { ExpertEffects, StrengthParameter } from '../../../util/PokemonStrength';
import { Select, SelectChangeEvent, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Reason why the berry was set */
type BerryReason = "set for event"|"set for field"|"random";

const FavoriteBerrySelect = React.memo(({value, onChange}: {
    value: StrengthParameter,
    onChange: (value: StrengthParameter) => void
}) => {
    const { t } = useTranslation();
    const expert = isExpertField(value.fieldIndex);
    const [types, disabled, reasons] = React.useMemo(() => {
        const eventBonus = getEventBonus(value.event, value.customEventBonus);
        const eventFixedTypes = eventBonus?.fixedBerries ?? [];
        const eventFixedAreas = eventBonus?.fixedAreas ?? [];
        const defaultAreaBerries = getFavoriteBerries(value.fieldIndex);
        let types: PokemonType[] = [];
        let disabled = true, reasons: BerryReason[] = ["random", "random", "random"];
        if (eventFixedAreas.includes(value.fieldIndex) &&
            eventFixedTypes.length === 3
        ) {
            // type is fixed by the current selected event
            reasons = ["set for event", "set for event", "set for event"];
            types = value.favoriteType;
        }
        else if (defaultAreaBerries.length === 3) {
            // type is fixed by the current area
            reasons = ["set for field", "set for field", "set for field"];
            types = defaultAreaBerries;
        }
        else {
            // type is selectable
            disabled = false;
            types = value.favoriteType;
        }
        return [types, disabled, reasons];
    }, [value]);

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
    const onMainBerryChange = React.useCallback((type: PokemonType) => {
        const favoriteType = [type, ...types.filter(x => x !== type)];
        onChange({...value, favoriteType});
    }, [onChange, value, types]);
    const onExpertEffectChange = React.useCallback((expertEffect: ExpertEffects) => {
        onChange({...value, expertEffect});
    }, [onChange, value]);

    if (value.fieldIndex < 0) {
        return <></>;
    }

    // select main berry and sub-berries (expert)
    if (expert === true) {
        return <>
            <section className="first">
                <label>{t('favorite berry')}:</label>
                <TypeSelectContainer>
                    <span>
                        <header>{t('main')}</header>
                        {reasons[0] === 'random' ?
                            <TypeSelect type={types[0]} size="small"
                                onChange={onFavoriteBerryChange1}/> :
                            <TypeButton type={types[0]} size="small" checked={false}
                                onClick={onMainBerryChange}/>
                        }
                        <footer className={reasons[0].replace(/ /g, '-')}>{t(reasons[0])}</footer>
                    </span>
                    <span>
                        <header>{t('sub1')}</header>
                        {reasons[1] === 'random' ?
                            <TypeSelect type={types[1]} size="small"
                                onChange={onFavoriteBerryChange2}/> :
                            <TypeButton type={types[1]} size="small" checked={false}
                                onClick={onMainBerryChange}/>
                        }
                        <footer className={reasons[1].replace(/ /g, '-')}>{t(reasons[1])}</footer>
                    </span>
                    <span>
                        <header>{t('sub2')}</header>
                        {reasons[2] === 'random' ?
                            <TypeSelect type={types[2]} size="small"
                                onChange={onFavoriteBerryChange3}/> :
                            <TypeButton type={types[2]} size="small" checked={false}
                                onClick={onMainBerryChange}/>
                        }
                        <footer className={reasons[2].replace(/ /g, '-')}>{t(reasons[2])}</footer>
                    </span>
                </TypeSelectContainer>
            </section>
            <section>
                <label>{t('expert effect')}:</label>
                <ExpertEffectSelect value={value.expertEffect}
                    onChange={onExpertEffectChange}/>
            </section>
        </>;
    }

    // display or select berries
    return <section className="first">
        <label>{t('favorite berry')}:</label>
        <TypeSelectContainer>
            <span>
                <TypeSelect type={types[0]} size="small" disabled={disabled}
                    onChange={onFavoriteBerryChange1}/>
                <footer className={reasons[0].replace(/ /g, '-')}>{t(reasons[0])}</footer>
            </span>
            <span>
                <TypeSelect type={types[1]} size="small" disabled={disabled}
                    onChange={onFavoriteBerryChange2}/>
                <footer className={reasons[1].replace(/ /g, '-')}>{t(reasons[1])}</footer>
            </span>
            <span>
                <TypeSelect type={types[2]} size="small" disabled={disabled}
                    onChange={onFavoriteBerryChange3}/>
                <footer className={reasons[2].replace(/ /g, '-')}>{t(reasons[2])}</footer>
            </span>
        </TypeSelectContainer>
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

const TypeSelectContainer = styled('span')({
    display: 'flex',

    '& > span': {
        textAlign: 'center',
        '& > header': {
            display: 'inline',
            color: 'white',
            width: '3rem',
            background: '#7cd377',
            fontSize: '0.5rem',
            borderRadius: '0.7rem',
            margin: 0,
            marginBottom: '8px',
            padding: '2px 12px',
        },
        '& > button': {
            marginTop: 0,
            marginButton: 0,
        },
        '& > footer': {
            position: 'relative',
            top: '-3px',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            color: '#7cd377',
            '&.set-for-event': {
                color: '#e07377',
            },
        },
    },
});

export default FavoriteBerrySelect;
