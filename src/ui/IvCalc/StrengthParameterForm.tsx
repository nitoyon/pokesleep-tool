import React from 'react';
import { styled } from '@mui/system';
import { Button, Collapse, FormControl, MenuItem, Select, SelectChangeEvent, Switch,
    } from '@mui/material';
import { IvAction } from './IvState';
import ResearchAreaTextField from '../common/ResearchAreaTextField';
import { PokemonType, PokemonTypes } from '../../data/pokemons';
import { CalculateParameter } from '../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

type PeriodType = "1day"|"1week"|"whistle";

const StyledSettingForm = styled('div')({
    padding: '0 .5rem',
    marginBottom: '10rem',
    '& section': {
        margin: '0.2rem 0',
        fontSize: '.9rem',
        display: 'flex',
        flex: '0 auto',
        alignItems: 'center',
        '&.mt': {
            marginTop: '1rem',
        },
        '& > label': {
            marginRight: 'auto',
        },
        '& > div > button': {
            fontSize: '0.8rem',
            padding: '0.5rem 0.2rem',
            lineHeight: 1.1,
        },
    },
    '& > button': {
        marginLeft: '-.4rem',
    }
});

const StrengthSettingForm = React.memo(({dispatch, value, hasHelpingBonus}: {
    dispatch: React.Dispatch<IvAction>,
    value: CalculateParameter,
    hasHelpingBonus: boolean,
}) => {
    const { t } = useTranslation();

    const onChange = React.useCallback((value: CalculateParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);

    const onPeriodChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, period: parseInt(e.target.value as PeriodType, 10) as 24|168|3});
    }, [onChange, value]);
    const onFieldChange = React.useCallback((fieldIndex: number) => {
        onChange({...value, fieldIndex});
    }, [onChange, value]);
    const onFavoriteBerryChange1 = React.useCallback((e: SelectChangeEvent<PokemonType>) => {
        const favoriteType = [value.favoriteType[0] ?? "normal",
            value.favoriteType[1] ?? "normal",
            value.favoriteType[2] ?? "normal"];
        favoriteType[0] = e.target.value as PokemonType;
        onChange({...value, favoriteType});
    }, [onChange, value]);
    const onFavoriteBerryChange2 = React.useCallback((e: SelectChangeEvent<PokemonType>) => {
        const favoriteType = [value.favoriteType[0] ?? "normal",
            value.favoriteType[1] ?? "normal",
            value.favoriteType[2] ?? "normal"];
        favoriteType[1] = e.target.value as PokemonType;
        onChange({...value, favoriteType});
    }, [onChange, value]);
    const onFavoriteBerryChange3 = React.useCallback((e: SelectChangeEvent<PokemonType>) => {
        const favoriteType = [value.favoriteType[0] ?? "normal",
            value.favoriteType[1] ?? "normal",
            value.favoriteType[2] ?? "normal"];
        favoriteType[2] = e.target.value as PokemonType;
        onChange({...value, favoriteType});
    }, [onChange, value]);
    const onFieldBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, fieldBonus: parseInt(e.target.value, 10)});
    }, [onChange, value]);
    const onHelpBonusCountChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, helpBonusCount: parseInt(e.target.value, 10) as 0|1|2|3|4});
    }, [onChange, value]);
    const onGoodCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, isGoodCampTicketSet: e.target.checked});
    }, [onChange, value]);
    const onLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, level: parseInt(e.target.value, 10) as 0|10|25|30|50|55|60|75|100})
    }, [onChange, value])
    const onEvolvedChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, evolved: e.target.checked});
    }, [onChange, value]);
    const onMaxSkillLevelChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, maxSkillLevel: e.target.checked});
    }, [onChange, value]);
    const onTapFrequencyChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, tapFrequency: e.target.value as "always"|"none"});
    }, [onChange, value]);
    const onEditEnergyClick = React.useCallback(() => {
        dispatch({type: 'openEnergyDialog'});
    }, [dispatch]);
    const onRecipeBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, recipeBonus: parseInt(e.target.value)});
    }, [onChange, value]);
    const onRecipeLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, recipeLevel: parseInt(e.target.value) as 1|10|20|30|40|50|55});
    }, [onChange, value]);

    const typeMenus = PokemonTypes.map((x: PokemonType) =>
        <MenuItem key={x} value={x}>{t(`types.${x}`)}</MenuItem>);
    while (value.favoriteType.length < 3) {
        value.favoriteType.push('normal');
    }

    const isNotWhistle = (value.period !== 3);
    return <StyledSettingForm>
        <section>
            <label>{t('period')}:</label>
            <Select variant="standard" onChange={onPeriodChange} value={value.period.toString()}>
                <MenuItem value={24}>{t('1day')}</MenuItem>
                <MenuItem value={168}>{t('1week')}</MenuItem>
                <MenuItem value={3}>{t('whistle')}</MenuItem>
            </Select>
        </section>
        <section>
            <label>{t('research area')}:</label>
            <ResearchAreaTextField value={value.fieldIndex} showEmpty
                onChange={onFieldChange}/>
        </section>
        <Collapse in={value.fieldIndex === 0}>
            <section>
                <label>{t('favorite berry')}:</label>
                <span>
                    <Select variant="standard" size="small" value={value.favoriteType[0]}
                        onChange={onFavoriteBerryChange1}>
                        {typeMenus}
                    </Select><> </>
                    <Select variant="standard" size="small" value={value.favoriteType[1]}
                        onChange={onFavoriteBerryChange2}>
                        {typeMenus}
                    </Select><> </>
                    <Select variant="standard" size="small" value={value.favoriteType[2]}
                        onChange={onFavoriteBerryChange3}>
                        {typeMenus}
                    </Select>
                </span>
            </section>
        </Collapse>
        <section>
            <label>{t('area bonus')}:</label>
            <Select variant="standard" value={value.fieldBonus.toString()}
                onChange={onFieldBonusChange}>
                <MenuItem value={0}>0%</MenuItem>
                <MenuItem value={5}>5%</MenuItem>
                <MenuItem value={10}>10%</MenuItem>
                <MenuItem value={15}>15%</MenuItem>
                <MenuItem value={20}>20%</MenuItem>
                <MenuItem value={25}>25%</MenuItem>
                <MenuItem value={30}>30%</MenuItem>
                <MenuItem value={35}>35%</MenuItem>
                <MenuItem value={40}>40%</MenuItem>
                <MenuItem value={45}>45%</MenuItem>
                <MenuItem value={50}>50%</MenuItem>
                <MenuItem value={55}>55%</MenuItem>
                <MenuItem value={60}>60%</MenuItem>
            </Select>
        </section>
        <Collapse in={isNotWhistle}>
            <section>
                <label>{t('good camp ticket')}:</label>
                <Switch checked={value.isGoodCampTicketSet} onChange={onGoodCampTicketChange}/>
            </section>
        </Collapse>
        <section className="mt">
            <label>{t('level')}:</label>
            <Select variant="standard" onChange={onLevelChange} value={value.level.toString()}>
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
        </section>
        <section>
            <label>{t('calc with evolved')}:</label>
            <Switch checked={value.evolved} onChange={onEvolvedChange}/>
        </section>
        <section>
            <label>{t('calc with max skill level')}:</label>
            <Switch checked={value.maxSkillLevel} onChange={onMaxSkillLevelChange}/>
        </section>
        <section className="mt">
            <label>{t('helping bonus')}:</label>
            <Select variant="standard" value={value.helpBonusCount.toString()}
                onChange={onHelpBonusCountChange}>
                {!hasHelpingBonus && <MenuItem value={0}>{t('none')}</MenuItem>}
                <MenuItem value={1}>×1</MenuItem>
                <MenuItem value={2}>×2</MenuItem>
                <MenuItem value={3}>×3</MenuItem>
                <MenuItem value={4}>×4</MenuItem>
                {hasHelpingBonus && <MenuItem value={5}>×5</MenuItem>}
            </Select>
        </section>
        <Collapse in={isNotWhistle}>
            <section>
                <label>{t('tap frequency')}:</label>
                <Select variant="standard" value={value.tapFrequency}
                    onChange={onTapFrequencyChange}>
                    <MenuItem value="always">{t('every minute')}</MenuItem>
                    <MenuItem value="none">{t('none')}</MenuItem>
                </Select>
            </section>
            <section className="mt">
                <label>{t('energy')}:</label>
                <Button onClick={onEditEnergyClick}>{t('edit')}</Button>
            </section>
        </Collapse>
        <section className="mt">
            <label>{t('recipe range (the number of ingredients)')}:</label>
            <FormControl size="small">
            <Select variant="standard" value={value.recipeBonus.toString()}
                onChange={onRecipeBonusChange}>
                <MenuItem value={0}>{t('mixed recipe')}</MenuItem>
                <MenuItem value={6}>7{t('range separator')}9 {t('ingredients unit')}</MenuItem>
                <MenuItem value={11}>14{t('range separator')}16 {t('ingredients unit')}</MenuItem>
                <MenuItem value={17}>22{t('range separator')}26 {t('ingredients unit')}</MenuItem>
                <MenuItem value={25}>30{t('range separator')}38 {t('ingredients unit')}</MenuItem>
                <MenuItem value={35}>53{t('range separator')}55 {t('ingredients unit')}</MenuItem>
                <MenuItem value={48}>62{t('range separator')}77 {t('ingredients unit')}</MenuItem>
            </Select></FormControl>
        </section>
        <section>
            <label>{t('average recipe level')}:</label>
            <Select variant="standard" value={value.recipeLevel.toString()}
                onChange={onRecipeLevelChange}>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={55}>55</MenuItem>
            </Select>
        </section>
    </StyledSettingForm>;
});

export default StrengthSettingForm;
