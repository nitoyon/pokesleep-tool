import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from './IvState';
import { BoxSortConfig } from './BoxView';
import IngredientIcon from './IngredientIcon';
import MainSkillIcon from './MainSkillIcon';
import SelectEx from '../common/SelectEx';
import { StrengthParameter } from '../../util/PokemonStrength';
import { MainSkillName, MainSkillNames } from '../../util/MainSkill';
import { IngredientName, IngredientNames } from '../../data/pokemons';
import fields from '../../data/fields';
import { FormControlLabel, Switch, MenuItem }  from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxSortConfigFooter = React.memo(({sortConfig, parameter, dispatch, sx, onChange}: {
    sortConfig: BoxSortConfig,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
    sx: object,
    onChange: (value: BoxSortConfig) => void,
}) => {
    const { t } = useTranslation();

    const onParameterChange = React.useCallback((value: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);
    const onLevelChange = React.useCallback((value: string) => {
        onParameterChange({...parameter, level: parseInt(value, 10) as 0|10|25|30|50|55|60|75|100})
    }, [onParameterChange, parameter])
    const onFieldChange = React.useCallback((value: string) => {
        onParameterChange({...parameter, fieldIndex: parseInt(value, 10)});
    }, [onParameterChange, parameter]);
    const onIngredientChange = React.useCallback((value: string) => {
        onChange({
            ...sortConfig, ingredient: value as IngredientName,
        });
    }, [onChange, sortConfig]);
    const onSkillChange = React.useCallback((value: string) => {
        onChange({
            ...sortConfig, mainSkill: value as MainSkillName,
        });
    }, [onChange, sortConfig]);
    const onEvolvedChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onParameterChange({...parameter, evolved: e.target.checked});
    }, [parameter, onParameterChange]);

    const ingMenus = React.useMemo(() => {
        const ret: React.ReactElement[] = IngredientNames.map(ing =>
            <IngMenuItem key={ing} value={ing}>
                <IngredientIcon name={ing}/>
            </IngMenuItem>);
        ret.push(<IngMenuItem key="unknown" value="unknown">
            {t('total')}
        </IngMenuItem>);
        return ret;
    }, [t]);

    const skillMenus = React.useMemo(() => {
        return MainSkillNames.map(name =>
            <SkillMenuItem key={name} value={name}>
                <MainSkillIcon mainSkill={name}/>
                {t(`skills.${name}`)}
            </SkillMenuItem>);
    }, [t]);

    const fieldMenus = React.useMemo(() => {
        // prepare field menus
        const ret = fields.map((field) =>
            <MenuItem key={field.index} value={field.index}>
                <span>{field.emoji}</span>
                {t(`area.${field.index}`)}
            </MenuItem>
        );
        ret.unshift(<MenuItem key={-1} value={-1}>
            {t('no favorite berries')}
        </MenuItem>);
        return ret;
    }, [t]);

    if (sortConfig.sort !== "berry" &&
        sortConfig.sort !== "ingredient" &&
        sortConfig.sort !== "skill count"
    ) {
        return <></>;
    }
    return <StyledBoxHeader style={sx}>
        <div>
            <span>
                <SelectEx onChange={onLevelChange} value={parameter.level}
                    sx={{padding: '0 .5rem', fontSize: '0.8rem', textWrap: 'nowrap'}}>
                    <MenuItem value={0}>{t('current level')}</MenuItem>
                    <MenuItem value={10}>Lv. 10</MenuItem>
                    <MenuItem value={25}>Lv. 25</MenuItem>
                    <MenuItem value={30}>Lv. 30</MenuItem>
                    <MenuItem value={50}>Lv. 50</MenuItem>
                    <MenuItem value={60}>Lv. 60</MenuItem>
                    <MenuItem value={75}>Lv. 75</MenuItem>
                    <MenuItem value={100}>Lv. 100</MenuItem>
                </SelectEx>
            </span>
            {sortConfig.sort === "berry" && <span className="field">
                <SelectEx value={parameter.fieldIndex} onChange={onFieldChange}
                    sx={{padding: '0 .5rem', fontSize: '0.8rem'}}>
                {fieldMenus}
                </SelectEx>
            </span>}
            {sortConfig.sort === "ingredient" && <span className="ing">
                <SelectEx onChange={onIngredientChange}
                    value={sortConfig.ingredient}
                    sx={{padding: '0 .5rem', fontSize: '0.8rem'}}
                    menuSx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: '16rem',
                    }}>
                    {ingMenus}
                </SelectEx>
            </span>}
            {sortConfig.sort === "skill count" && <span className="skill">
                <SelectEx onChange={onSkillChange}
                    sx={{fontSize: '0.8rem', textWrap: 'nowrap'}}
                    menuSx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                    }}
                    value={sortConfig.mainSkill}>
                    {skillMenus}
                </SelectEx>
            </span>}
            <span className="evolved">
                <FormControlLabel control={
                    <Switch checked={parameter.evolved} size="small"
                        onChange={onEvolvedChange} />
                    }
                    label={t('calc with evolved (short)')} />
            </span>
        </div>
    </StyledBoxHeader>;
});

const StyledBoxHeader = styled('div')({
    padding: '.2rem 0 .2rem 0',
    background: '#f3f5f0',
    borderTop: '1px solid #ccc',
    position: 'relative',
    overflow: 'hidden',
    '& > div': {
        display: 'flex',
        alignItems: 'stretch',
        gap: '10px',

        '& > span': {
            '& > button': {
                textWrap: 'nowrap',
            },
            '& span': {
                fontSize: '0.8rem',
            },

            '&.ing svg': {
                padding: '0 5px',
                width: '18px',
                height: '18px',
            },
            '&.skill svg': {
                width: '18px',
                height: '18px',
                paddingRight: '4px',
                verticalAlign: 'top',
            },
            '&.evolved': {
                paddingLeft: '5px',
                '& span.MuiTypography-root': {
                    textWrap: 'nowrap',
                },
            },
        },
    },
});

const IngMenuItem = styled(MenuItem)({
    width: '4rem',
});
const SkillMenuItem = styled(MenuItem)({
    maxWidth: '12rem',
    fontSize: '0.8rem',
    paddingLeft: '4px',
    textWrap: 'wrap',
    '& > svg': {
        width: '18px',
        height: '18px',
        padding: '0 4px',
        flexShrink: 0,
    },
});

export default BoxSortConfigFooter;
