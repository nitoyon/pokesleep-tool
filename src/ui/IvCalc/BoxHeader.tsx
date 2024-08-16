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
import { Select, SelectChangeEvent, MenuItem }  from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxHeader = React.memo(({sortConfig, parameter, dispatch}: {
    sortConfig: BoxSortConfig,
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
    const onFieldChange = React.useCallback((fieldIndex: number) => {
        onChange({...parameter, fieldIndex});
    }, [onChange, parameter]);
    const onIngredientChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeBoxSortConfig", payload: { parameter: {
            ...sortConfig, ingredient: e.target.value as IngredientName,
        }}});
    }, [dispatch, sortConfig]);
    const onSkillChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeBoxSortConfig", payload: { parameter: {
            ...sortConfig, mainSkill: e.target.value as MainSkillName,
        }}});
    }, [dispatch, sortConfig]);

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
            {sortConfig.sort === "berry" && <span>
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
        </div>
    </StyledBoxHeader>;
});

const StyledBoxHeader = styled('div')({
    background: '#f9f9f9',
    padding: '0 0.4rem 4px',

    '& > div': {
        padding: '.2rem 0 .2rem .6rem',
        border: '1px solid #ccc',
        borderRadius: '0.5rem',
        background: '#f3f5f0',
        position: 'relative',

        '& > span': {
            marginRight: '.6rem',
            '&:last-of-type': {
                marginRight: 0,
            },

            '& > div': {
                fontSize: '0.8rem',
                '& > div.MuiSelect-select': {
                    paddingTop: 0,
                    paddingBottom: 0,
                },
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

export default BoxHeader;
