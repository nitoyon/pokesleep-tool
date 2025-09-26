import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import IngredientButton from '../IngredientButton';
import TypeButton from '../TypeButton';
import { PokemonFilterConfig } from './PokemonSelectDialog';
import MainSkillButton from '../MainSkillButton';
import SpecialtyButton from '../SpecialtyButton';
import { MainSkillName, MainSkillNames } from '../../../util/MainSkill';
import { SpecialtyNames, PokemonSpecialty, IngredientName, IngredientNames,
    PokemonType, PokemonTypes } from '../../../data/pokemons';
import { useElementWidth } from '../../common/Hook';
import DraggableTabContainer from '../../common/DraggableTabContainer';
import { Button, Dialog, DialogActions, Switch,
    Tab, Tabs, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PokemonFilterDialog = React.memo(({open, value, onChange, onClose}: {
    open: boolean,
    value: PokemonFilterConfig,
    onChange: (value: PokemonFilterConfig) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const [width, elementRef] = useElementWidth();
    const [tabIndex, setTabIndex] = React.useState(value.tabIndex);
    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    }, []);
    const onClearClick = useCallback(() => {
        onChange(new PokemonFilterConfig({}));
    }, [onChange]);
    const onCloseClick = useCallback(() => {
        onClose();
    }, [onClose]);

    return <StyledPokemonFilterDialog open={open} onClose={onClose}>
        <StyledTabs variant="scrollable" scrollButtons
            ref={elementRef}
            value={tabIndex} onChange={onTabChange}>
            <StyledTab label={t('type')} value={0}/>
            <StyledTab label={t('ingredient')} value={1}/>
            <StyledTab label={t('main skill')} value={2}/>
        </StyledTabs>
        
        <DraggableTabContainer index={tabIndex} width={width} onChange={setTabIndex}>
            <div className="tabChild">
                <TypeTab value={value} onChange={onChange}/>
            </div>
            <div className="tabChild">
                <IngredientTab value={value} onChange={onChange}/>
            </div>
            <div className="tabChild">
                <MainSkillTab value={value} onChange={onChange}/>
            </div>
        </DraggableTabContainer>
        <DialogActions>
            <Button onClick={onClearClick}>{t('clear')}</Button>
            <Button onClick={onCloseClick}>{t('close')}</Button>
        </DialogActions>
    </StyledPokemonFilterDialog>;
});

const StyledPokemonFilterDialog = styled(Dialog)({
    'div.MuiPaper-root': {
        padding: '0 .5rem 0 .5rem',
        '& div.tabChild': {
            '& > section': {
                margin: '0 0.8rem',
                fontSize: '.9rem',
                display: 'flex',
                flex: '0 auto',
                alignItems: 'center',
                maxWidth: '40rem',
                '&:first-of-type': {
                    marginTop: '0.3rem',
                },
                '& > label': {
                    marginRight: 'auto',
                },
            },
        },
    },
});

const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: 'clamp(.3rem, 0.6vh, .7rem)',
});
const StyledTab = styled(Tab)({
    minHeight: '36px',
    minWidth: '0',
    textTransform: 'none',
});

const TypeTab = React.memo(({value, onChange}: {
    value: PokemonFilterConfig,
    onChange: (value: PokemonFilterConfig) => void
}) => {
    const { t } = useTranslation();

    const onTypeClick = useCallback((selected: PokemonType) => {
        onChange(new PokemonFilterConfig({...value,
            filterType: value.filterType === selected ? null : selected}));
    }, [value, onChange]);
    const onSpecialtyClick = useCallback((val: PokemonSpecialty) => {
        onChange(new PokemonFilterConfig({
            ...value,
            filterSpecialty: value.filterSpecialty.includes(val) ?
                [] : [val],
        }))
    }, [value, onChange]);
    const onEvolveChange = useCallback((_: React.MouseEvent, val: string|null) => {
        if (val === null || value.filterEvolve === val) { return; }
        onChange(new PokemonFilterConfig({...value, filterEvolve: val as "all"|"non"|"final"}));
    }, [value, onChange]);

    const buttons: React.ReactElement[] = PokemonTypes.map(type =>
        <TypeButton key={type} type={type} onClick={onTypeClick}
            checked={type === value.filterType}/>);
    const specialtyButtons: React.ReactElement[] = SpecialtyNames.map(specialty =>
        <SpecialtyButton key={specialty} specialty={specialty} onClick={onSpecialtyClick}
            checked={value.filterSpecialty.includes(specialty)}/>
    );

    return (<>
        <div>
            {buttons}
        </div>
        <div>
        <h4 style={{margin: '1rem 0 0.5rem'}}>{t('specialty')}</h4>
            {specialtyButtons}
        </div>
        <div>
            <h4 style={{margin: '1rem 0 0.5rem'}}>{t('evolve')}</h4>
            <StyledToggleButtonGroup value={value.filterEvolve} exclusive
                onChange={onEvolveChange}>
                <ToggleButton value="all">{t('all')}</ToggleButton>
                <ToggleButton value="non">{t('non-evolve')}</ToggleButton>
                <ToggleButton value="final">{t('final-evoltion')}</ToggleButton>
            </StyledToggleButtonGroup>
        </div>
    </>);
});

const IngredientTab = React.memo(({value, onChange}: {
    value: PokemonFilterConfig,
    onChange: (value: PokemonFilterConfig) => void
}) => {
    const { t } = useTranslation();

    const onIngClick = useCallback((selected: IngredientName) => {
        const ingredientName = value.ingredientName === selected ? 'unknown' : selected;
        onChange(new PokemonFilterConfig({...value, ingredientName}));
    }, [value, onChange]);

    const onIngAClick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new PokemonFilterConfig({...value, ingredientA: e.target.checked}));
    }, [value, onChange]);
    const onIngBClick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new PokemonFilterConfig({...value, ingredientB: e.target.checked}));
    }, [value, onChange]);
    const onIngCClick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new PokemonFilterConfig({...value, ingredientC: e.target.checked}));
    }, [value, onChange]);

    const ingButtons: React.ReactElement[] = IngredientNames.map(ing =>
        <IngredientButton key={ing} ingredient={ing} onClick={onIngClick}
            checked={value.ingredientName === ing}/>);

    return (<>
        <div style={{marginBottom: '1rem'}}>
            {ingButtons}
        </div>
        <section>
            <label>{t('ing-a')}:</label>
            <Switch checked={value.ingredientA} size="small" onChange={onIngAClick}/>
        </section>
        <section>
            <label>{t('ing-b')}:</label>
            <Switch checked={value.ingredientB} size="small" onChange={onIngBClick}/>
        </section>
        <section>
        <label>{t('ing-c')}:</label>
            <Switch checked={value.ingredientC} size="small" onChange={onIngCClick}/>
        </section>
    </>);
});

const MainSkillTab = React.memo(({value, onChange}: {
    value: PokemonFilterConfig,
    onChange: (value: PokemonFilterConfig) => void,
}) => {
    const onMainSkillClick = useCallback((selected: MainSkillName) => {
        const mainSkillNames = value.mainSkillNames.includes(selected) ?
            value.mainSkillNames.filter(x => x !== selected) :
            [...value.mainSkillNames, selected];
        onChange(new PokemonFilterConfig({...value, mainSkillNames}));
    }, [value, onChange]);

    const mainSkillButtons: React.ReactElement[] = MainSkillNames.map(skill =>
        <MainSkillButton key={skill} mainSkill={skill} onClick={onMainSkillClick}
            checked={value.mainSkillNames.includes(skill)}/>);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
    }}>
        {mainSkillButtons}
    </div>;
});

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
    '& > button': {
        textTransform: 'none',
        lineHeight: 1,
    },
    '& > button:first-of-type': {
        borderRadius: '1rem 0 0 1rem',
    },
    '& > button:last-of-type': {
        borderRadius: '0 1rem 1rem 0',
    },
});

export default PokemonFilterDialog;
