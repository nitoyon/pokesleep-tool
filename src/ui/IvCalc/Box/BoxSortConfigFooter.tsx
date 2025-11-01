import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from '../IvState';
import { BoxSortConfig } from '../../../util/PokemonBoxSort';
import IngredientIcon from '../IngredientIcon';
import MainSkillIcon from '../MainSkillIcon';
import FixedLevelSelect from '../Strength/FixedLevelSelect';
import ResearchAreaSelect from '../Strength/ResearchAreaSelect';
import SelectEx from '../../common/SelectEx';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { MainSkillName, MainSkillNames } from '../../../util/MainSkill';
import { IngredientName, IngredientNames } from '../../../data/pokemons';
import { Divider, FormControlLabel, Switch, MenuItem }  from '@mui/material';
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
        ret.push(<Divider key="divider" style={{gridColumn: '1 / -1'}}/>);
        ret.push(<IngMenuItem key="strength" value="strength"
            style={{gridColumn: 'span 2', width: '8rem'}}>
            {t('total strength')}
        </IngMenuItem>);
        ret.push(<IngMenuItem key="count" value="count"
            style={{gridColumn: 'span 2', width: '8rem'}}>
            {t('total count')}
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

    if (sortConfig.sort !== "total strength" &&
        sortConfig.sort !== "berry" &&
        sortConfig.sort !== "ingredient" &&
        sortConfig.sort !== "skill count"
    ) {
        return <></>;
    }
    return <StyledBoxHeader>
        <div>
            <span>
                <FixedLevelSelect value={parameter} dispatch={dispatch}
                    sx={{padding: '0 .2rem', fontSize: '0.8rem', textWrap: 'nowrap'}}/>
            </span>
            {(sortConfig.sort === "berry" || sortConfig.sort === "total strength") &&
            <span className="field">
                <ResearchAreaSelect value={parameter} onChange={onParameterChange}
                    fontSize="0.8rem" showConfigButton/>
            </span>}
            {sortConfig.sort === "ingredient" && <span className="ing">
                <SelectEx onChange={onIngredientChange}
                    value={sortConfig.ingredient}
                    sx={{padding: '0 .5rem', fontSize: '0.8rem'}}
                    menuSx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
    '& > div': {
        padding: '.2rem 0 .2rem 1.2rem',
        background: '#f3f5f0',
        borderTop: '1px solid #ccc',
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        gap: '0 10px',

        '& > span': {
            '& > button': {
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
            },
            '& span': { // for switch
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
    fontSize: '0.9rem',
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
