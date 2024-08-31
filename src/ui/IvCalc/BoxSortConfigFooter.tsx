import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from './IvState';
import { BoxSortConfig } from './BoxView';
import IngredientIcon from './IngredientIcon';
import MainSkillIcon from './MainSkillIcon';
import ResearchAreaTextField from '../common/ResearchAreaTextField';
import { StrengthParameter } from '../../util/PokemonStrength';
import { MainSkillName, MainSkillNames } from '../../util/MainSkill';
import { IngredientName, IngredientNames } from '../../data/pokemons';
import { FormControlLabel, Select, SelectChangeEvent, Switch, MenuItem }  from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxSortConfigFooter = React.memo(({sortConfig, parameter, dispatch, onChange}: {
    sortConfig: BoxSortConfig,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
    onChange: (value: BoxSortConfig) => void,
}) => {
    const { t } = useTranslation();

    const onParameterChange = React.useCallback((value: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);
    const onLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onParameterChange({...parameter, level: parseInt(e.target.value, 10) as 0|10|25|30|50|55|60|75|100})
    }, [onParameterChange, parameter])
    const onFieldChange = React.useCallback((fieldIndex: number) => {
        onParameterChange({...parameter, fieldIndex});
    }, [onParameterChange, parameter]);
    const onIngredientChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({
            ...sortConfig, ingredient: e.target.value as IngredientName,
        });
    }, [onChange, sortConfig]);
    const onSkillChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({
            ...sortConfig, mainSkill: e.target.value as MainSkillName,
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
        ret.unshift(<IngMenuItem key="unknown" value="unknown">
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

    if (sortConfig.sort !== "berry" &&
        sortConfig.sort !== "ingredient" &&
        sortConfig.sort !== "skill count"
    ) {
        return <></>;
    }
    return <StyledBoxHeader>
        <div>
            <span>
                <Select variant="standard" onChange={onLevelChange}
                    value={parameter.level.toString()}>
                    <MenuItem value={0}>{t('current level')}</MenuItem>
                    <MenuItem value={10}>Lv. 10</MenuItem>
                    <MenuItem value={25}>Lv. 25</MenuItem>
                    <MenuItem value={30}>Lv. 30</MenuItem>
                    <MenuItem value={50}>Lv. 50</MenuItem>
                    <MenuItem value={60}>Lv. 60</MenuItem>
                    <MenuItem value={75}>Lv. 75</MenuItem>
                    <MenuItem value={100}>Lv. 100</MenuItem>
                </Select>
            </span>
            {sortConfig.sort === "berry" && <span className="field">
                <ResearchAreaTextField value={parameter.fieldIndex} showEmpty
                    onChange={onFieldChange}/>
            </span>}
            {sortConfig.sort === "ingredient" && <span className="ing">
                <Select variant="standard" onChange={onIngredientChange}
                    value={sortConfig.ingredient}>
                    {ingMenus}
                </Select>
            </span>}
            {sortConfig.sort === "skill count" && <span className="skill">
                <Select variant="standard" onChange={onSkillChange}
                    value={sortConfig.mainSkill}>
                    {skillMenus}
                </Select>
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
    '& > div': {
        padding: '.2rem 0 .2rem 1.2rem',
        background: '#f3f5f0',
        borderTop: '1px solid #ccc',
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        gap: '10px',

        '& > span': {
            '& div': {
                fontSize: '0.8rem',
                '& > div.MuiSelect-select': {
                    paddingTop: 0,
                    paddingBottom: 0,
                },
            },
            '& span': {
                fontSize: '0.8rem',
            },

            '&.field > div': {
                paddingTop: '4px',
            },
            '&.ing svg': {
                paddingLeft: '5px',
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
    float: 'left',
});
const SkillMenuItem = styled(MenuItem)({
    width: '50%',
    fontSize: '0.8rem',
    float: 'left',
    paddingLeft: '4px',
    textWrap: 'wrap',
    '& > svg': {
        width: '18px',
        height: '18px',
        paddingRight: '4px',
        flexShrink: 0,
    },
});

export default BoxSortConfigFooter;
