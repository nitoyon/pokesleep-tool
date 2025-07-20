import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import TypeButton from '../TypeButton';
import SpecialtyButton from '../SpecialtyButton';
import { BoxFilterConfig } from './BoxView';
import { EditSubSkillControl } from '../IvForm/SubSkillControl';
import IngredientButton from '../IngredientButton';
import MainSkillButton from '../MainSkillButton';
import { StyledNatureUpEffect, StyledNatureDownEffect } from '../IvForm/NatureTextField';
import { PokemonSpecialty, SpecialtyNames, IngredientName, IngredientNames,
    PokemonType, PokemonTypes
} from '../../../data/pokemons';
import { MainSkillName, MainSkillNames } from '../../../util/MainSkill';
import SubSkill, { SubSkillType } from '../../../util/SubSkill';
import { NatureEffect } from '../../../util/Nature';
import { Button, Dialog, DialogActions, InputAdornment, Switch,
    Tab, Tabs, TextField } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const BoxFilterDialog = React.memo(({open, value, onChange, onClose}: {
    open: boolean,
    value: BoxFilterConfig,
    onChange: (value: BoxFilterConfig) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    const [tabIndex, setTabIndex] = React.useState(0);
    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    }, []);
    const onClearClick = useCallback(() => {
        onChange(new BoxFilterConfig({}));
    }, [onChange]);
    const onCloseClick = useCallback(() => {
        onClose();
    }, [onClose]);
    const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new BoxFilterConfig({...value, name: e.target.value}));
    }, [value, onChange]);
    const onTypeClick = useCallback((selected: PokemonType) => {
        const filterTypes: PokemonType[] = value.filterTypes.includes(selected) ?
            value.filterTypes.filter(x => x !== selected) :
            [...value.filterTypes, selected];
        onChange(new BoxFilterConfig({...value, filterTypes}));
    }, [value, onChange]);
    const onSpecialtyClick = useCallback((val: PokemonSpecialty) => {
        onChange(new BoxFilterConfig({
            ...value,
            filterSpecialty: value.filterSpecialty.includes(val) ?
                value.filterSpecialty.filter(x => x !== val) :
                [...value.filterSpecialty, val],
        }));
    }, [value, onChange]);
    const onIngClick = useCallback((selected: IngredientName) => {
        const ingredientName = value.ingredientName === selected ?
            undefined : selected;
        onChange(new BoxFilterConfig({...value, ingredientName}));
    }, [value, onChange]);
    const onIngredientUnlockedOnlyChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new BoxFilterConfig({...value, ingredientUnlockedOnly: e.target.checked}));
    }, [onChange, value]);
    const onMainSkillChange = useCallback((mainSkillNames: MainSkillName[]) => {
        onChange(new BoxFilterConfig({...value, mainSkillNames}));
    }, [value, onChange]);

    const typeButtons: React.ReactElement[] = PokemonTypes.map(type =>
        <TypeButton key={type} type={type} onClick={onTypeClick}
            checked={value.filterTypes.includes(type)}/>);
    const specialtyButtons: React.ReactElement[] = SpecialtyNames.map(specialty =>
        <SpecialtyButton key={specialty} specialty={specialty} onClick={onSpecialtyClick}
            checked={value.filterSpecialty.includes(specialty)}/>
    );
    const ingButtons: React.ReactElement[] = IngredientNames.map(ing =>
        <IngredientButton key={ing} ingredient={ing} onClick={onIngClick}
            checked={value.ingredientName === ing}/>);

    return <StyledPokemonFilterDialog open={open} onClose={onClose}>
        <div>
            <TextField size="small" fullWidth value={value.name}
                onChange={onNameChange}
                InputProps={{
                    endAdornment: <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                }}/>
        </div>
        <StyledTabs variant="scrollable" scrollButtons
            value={tabIndex} onChange={onTabChange}>
            <StyledTab label={t('type')} value={0}/>
            <StyledTab label={t('ingredient')} value={1}/>
            <StyledTab label={t('main skill')} value={2}/>
            <StyledTab label={t('sub skills')} value={3}/>
            <StyledTab label={t('nature')} value={4}/>
        </StyledTabs>
        <div className="tabContainer">
            <div className={`tabChild ${tabIndex === 0 ? 'tabChildActive' : ''}`}>
                {typeButtons}
                <h4 style={{margin: '1rem 0 0.5rem'}}>{t('specialty')}</h4>
                {specialtyButtons}
            </div>
            <div className={`tabChild ${tabIndex === 1 ? 'tabChildActive' : ''}`}>
                {ingButtons}
                <section>
                    <label>{t('unlocked only')}:</label>
                    <Switch checked={value.ingredientUnlockedOnly}
                        onChange={onIngredientUnlockedOnlyChange}/>
                </section>
            </div>
            <div className={`tabChild ${tabIndex === 2 ? 'tabChildActive' : ''}`}>
                <MainSkillTab value={value.mainSkillNames}
                    onChange={onMainSkillChange}/>
            </div>
            <div className={`tabChild ${tabIndex === 3 ? 'tabChildActive' : ''}`}>
                <SubSkillTab value={value} onChange={onChange}/>
            </div>
            <div className={`tabChild ${tabIndex === 4 ? 'tabChildActive' : ''}`}>
                <NatureTab value={value} onChange={onChange}/>
            </div>
        </div>
        <DialogActions>
            <Button onClick={onClearClick}>{t('clear')}</Button>
            <Button onClick={onCloseClick}>{t('close')}</Button>
        </DialogActions>
    </StyledPokemonFilterDialog>;
});

const StyledPokemonFilterDialog = styled(Dialog)({
    'div.MuiPaper-root': {
        maxWidth: '480px',
        '& > div': {
            margin: '.5rem .5rem 0 .5rem',
        },
        '& > div.tabContainer': {
            display: 'grid',
            '& > div.tabChild': {
                gridArea: '1 / 1',
                visibility: 'hidden',
                '& > section': {
                    margin: '0 0.8rem',
                    fontSize: '.9rem',
                    display: 'flex',
                    flex: '0 auto',
                    alignItems: 'center',
                    '&:first-of-type': {
                        marginTop: '0.3rem',
                    },
                    '& > label': {
                        marginRight: 'auto',
                    },
                },
            },
            '& > div.tabChild.tabChildActive': {
                visibility: 'visible',
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
    padding: '6px clamp(6px, 1vw, 8px)',
    textTransform: 'none',
});

const MainSkillTab = React.memo(({value, onChange}: {
    value: MainSkillName[];
    onChange: (value: MainSkillName[]) => void,
}) => {
    const onMainSkillClick = useCallback((selected: MainSkillName) => {
        const newValue = value.includes(selected) ?
            value.filter(x => x !== selected) :
            [...value, selected];
        onChange(newValue);
    }, [value, onChange]);

    const mainSkillButtons: React.ReactElement[] = MainSkillNames.map(skill =>
        <MainSkillButton key={skill} mainSkill={skill} onClick={onMainSkillClick}
            checked={value.includes(skill)}/>);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
    }}>
        {mainSkillButtons}
    </div>;
});

const SubSkillTab = React.memo(({value, onChange}: {
    value: BoxFilterConfig,
    onChange: (value: BoxFilterConfig) => void,
}) => {
    const { t } = useTranslation();

    const onClick = useCallback((selected: SubSkillType) => {
        const subSkillNames = value.subSkillNames.includes(selected) ?
            value.subSkillNames.filter(x => x !== selected) :
            [...value.subSkillNames, selected];
        onChange(new BoxFilterConfig({...value, subSkillNames}));
    }, [value, onChange]);
    const onSubSkillUnlockedOnlyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new BoxFilterConfig({...value, subSkillUnlockedOnly: e.target.checked}));
    }, [value, onChange]);
    const onSubSkillAndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new BoxFilterConfig({...value, subSkillAnd: e.target.checked}));
    }, [value, onChange]);

    const subSkill2Badge = React.useCallback((subSkill: SubSkill) => {
        return value.subSkillNames.includes(subSkill.name) ? <CheckIcon/> : 0;
    }, [value]);

    return <>
        <EditSubSkillControl subSkill2Badge={subSkill2Badge}
            onClick={onClick}/>
        <section style={{marginTop: '2rem'}}>
            <label>{t('unlocked only')}:</label>
            <Switch checked={value.subSkillUnlockedOnly} size="small"
                onChange={onSubSkillUnlockedOnlyChange}/>
        </section>
        <section>
            <label>AND:</label>
            <Switch checked={value.subSkillAnd} size="small"
                onChange={onSubSkillAndChange}/>
        </section>
    </>;
});

const NatureTab = React.memo(({value, onChange}: {
    value: BoxFilterConfig,
    onChange: (value: BoxFilterConfig) => void,
}) => {
    const onNoEffectClick = useCallback((selected: NatureEffect) => {
        onChange(new BoxFilterConfig({
            ...value,
            neutralNature: !value.neutralNature,
            upNature: "No effect",
            downNature: "No effect",
        }));
    }, [value, onChange]);
    const onUpEffectClick = useCallback((selected: NatureEffect) => {
        let downNature: NatureEffect = value.downNature;
        if (downNature === selected) {
            downNature = "No effect";
        }
        onChange(new BoxFilterConfig({
            ...value,
            neutralNature: false,
            upNature: selected === value.upNature ? "No effect" : selected,
            downNature,
        }));
    }, [value, onChange]);
    const onDownEffectClick = useCallback((selected: NatureEffect) => {
        let upNature: NatureEffect = value.upNature;
        if (upNature === selected) {
            upNature = "No effect";
        }
        onChange(new BoxFilterConfig({
            ...value,
            neutralNature: false,
            upNature,
            downNature: selected === value.downNature ? "No effect" : selected,
        }));
    }, [value, onChange]);

    return <>
        <div style={{marginTop: '0.4rem'}}>
            <NatureButton label="No effect" onClick={onNoEffectClick}
                checked={value.neutralNature}/>
        </div>
        <StyledNatureContainer>
            <NatureButton label="Speed of help" up
                checked={value.upNature === "Speed of help"}
                onClick={onUpEffectClick}/>
            <NatureButton label="Main skill chance" up
                checked={value.upNature === "Main skill chance"}
                onClick={onUpEffectClick}/>
            <NatureButton label="Ingredient finding" up
                checked={value.upNature === "Ingredient finding"}
                onClick={onUpEffectClick}/>
            <NatureButton label="EXP gains" up
                checked={value.upNature === "EXP gains"}
                onClick={onUpEffectClick}/>
            <NatureButton label="Energy recovery" up
                checked={value.upNature === "Energy recovery"}
                onClick={onUpEffectClick}/>
        </StyledNatureContainer>
        <StyledNatureContainer>
            <NatureButton label="Speed of help" down
                checked={value.downNature === "Speed of help"}
                onClick={onDownEffectClick}/>
            <NatureButton label="Main skill chance" down
                checked={value.downNature === "Main skill chance"}
                onClick={onDownEffectClick}/>
            <NatureButton label="Ingredient finding" down
                checked={value.downNature === "Ingredient finding"}
                onClick={onDownEffectClick}/>
            <NatureButton label="EXP gains" down
                checked={value.downNature === "EXP gains"}
                onClick={onDownEffectClick}/>
            <NatureButton label="Energy recovery" down
                checked={value.downNature === "Energy recovery"}
                onClick={onDownEffectClick}/>
        </StyledNatureContainer>
    </>;
});

const StyledNatureContainer = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    marginTop: '1rem',
});

const NatureButton = React.memo(({label, checked, up, down, onClick}: {
    label: NatureEffect,
    checked: boolean,
    up?: boolean,
    down?: boolean,
    onClick: (value: NatureEffect) => void,
}) => {
    const { t } = useTranslation();
    const onClickHandler = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as NatureEffect;
        onClick(value);
    }, [onClick]);

    return <StyledNatureButton
        key={label} value={label} onClick={onClickHandler}>
        {up === true ?
            <StyledNatureUpEffect>{t(`nature effect.${label}`)}</StyledNatureUpEffect> :
        down === true ?
            <StyledNatureDownEffect>{t(`nature effect.${label}`)}</StyledNatureDownEffect> :
            t(`nature effect.${label}`)}
        {checked && <CheckIcon/>}
    </StyledNatureButton>;
});

const StyledNatureButton = styled(Button)({
    color: 'black',
    textAlign: 'left',
    fontSize: 'clamp(0.65rem, calc(2vw), 0.8rem)',
    textTransform: 'none',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    margin: '2px',
    '& > svg.MuiSvgIcon-root[data-testid="CheckIcon"]': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '15px',
        fontSize: '15px',
        color: 'white',
        border: '1px solid white',
        bottom: '1px',
        right: '10px',
    },
});

export default BoxFilterDialog;
