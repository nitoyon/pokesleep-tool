import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import TypeButton from './TypeButton';
import { BoxFilterConfig } from './BoxView';
import { EditSubSkillControl } from './SubSkillControl';
import IngredientIcon from './IngredientIcon';
import MainSkillIcon from './MainSkillIcon';
import { IngredientName, IngredientNames, PokemonType, PokemonTypes
} from '../../data/pokemons';
import { MainSkillName } from '../../util/MainSkill';
import SubSkill, { SubSkillType } from '../../util/SubSkill';
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

    let defaultTabIndex = value.filterTypes.length !== 0 ? 0 :
        value.ingredientName !== undefined ? 1 : 0;
    const [tabIndex, setTabIndex] = React.useState(defaultTabIndex);
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
        <Tabs variant="scrollable" scrollButtons="auto"
            value={tabIndex} onChange={onTabChange}>
            <Tab label={t('type')} value={0}/>
            <Tab label={t('ingredient')} value={1}/>
            <Tab label={t('main skill')} value={2}/>
            <Tab label={t('sub skills')} value={3}/>
        </Tabs>
        {tabIndex === 0 && <div>{typeButtons}</div>}
        {tabIndex === 1 && <div>
            {ingButtons}
            <section>
                <label>{t('unlocked only')}:</label>
                <Switch checked={value.ingredientUnlockedOnly}
                    onChange={onIngredientUnlockedOnlyChange}/>
            </section>
        </div>}
        {tabIndex === 2 && <MainSkillTab value={value.mainSkillNames}
            onChange={onMainSkillChange}/>}
        {tabIndex === 3 && <SubSkillTab value={value} onChange={onChange}/>}
        <DialogActions>
            <Button onClick={onClearClick}>{t('clear')}</Button>
            <Button onClick={onCloseClick}>{t('close')}</Button>
        </DialogActions>
    </StyledPokemonFilterDialog>;
});

const StyledPokemonFilterDialog = styled(Dialog)({
    'div.MuiPaper-root > div': {
        margin: '.5rem .5rem 0 .5rem',
        '& > section': {
            margin: '0.3rem 0.8rem 0 0.8rem',
            fontSize: '.9rem',
            display: 'flex',
            flex: '0 auto',
            alignItems: 'center',
            '& > label': {
                marginRight: 'auto',
            },
        },
    },
});

const IngredientButton = React.memo(({ingredient, checked, onClick}: {
    ingredient: IngredientName,
    checked: boolean,
    onClick: (value: IngredientName) => void,
}) => {
    const onIngredientClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as IngredientName;
        onClick(value);
    }, [onClick]);
    return <StyledIngredientButton
        key={ingredient} value={ingredient} onClick={onIngredientClick}>
        <IngredientIcon name={ingredient}/>
        {checked && <CheckIcon/>}
    </StyledIngredientButton>;
});

const StyledIngredientButton = styled(Button)({
    width: '20%',
    height: '40px',
    color: 'white',
    fontSize: '0.9rem',
    padding: 0,
    margin: '0.2rem',
    borderRadius: '0.5rem',
    '& > svg.MuiSvgIcon-root': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '15px',
        fontSize: '15px',
        border: '2px solid white',
        bottom: '0px',
        right: '10px',
    },
});

const MainSkillTab = React.memo(({value, onChange}: {
    value: MainSkillName[];
    onChange: (value: MainSkillName[]) => void,
}) => {
    const mainSkills: MainSkillName[] = [
        "Charge Strength S", "Charge Strength M",
        "Ingredient Magnet S", "Energy for Everyone S",
        "Charge Energy S", "Energizing Cheer S",
        "Cooking Power-Up S", "Tasty Chance S",
        "Extra Helpful S", "Helper Boost",
        "Dream Shard Magnet S", "Metronome",
    ];
    const onMainSkillClick = useCallback((selected: MainSkillName) => {
        const newValue = value.includes(selected) ?
            value.filter(x => x !== selected) :
            [...value, selected];
        onChange(newValue);
    }, [value, onChange]);

    const mainSkillButtons: React.ReactElement[] = mainSkills.map(skill =>
        <MainSkillButton key={skill} mainSkill={skill} onClick={onMainSkillClick}
            checked={value.includes(skill)}/>);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        marginTop: '1rem',
    }}>
        {mainSkillButtons}
    </div>;
});

const MainSkillButton = React.memo(({mainSkill, checked, onClick}: {
    mainSkill: MainSkillName,
    checked: boolean,
    onClick: (value: MainSkillName) => void,
}) => {
    const { t } = useTranslation();

    const onMainSkillClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as MainSkillName;
        onClick(value);
    }, [onClick]);
    return <StyledMainSkillButton
        value={mainSkill} onClick={onMainSkillClick}>
        <div>
            {!checked && <MainSkillIcon mainSkill={mainSkill}/>}
            {checked && <CheckIcon/>}
        </div>
        {t(`skills.${mainSkill}`)}
    </StyledMainSkillButton>;
});

const StyledMainSkillButton = styled(Button)({
    height: '2.2rem',
    lineHeight: 1.2,
    margin: '1%',
    color: 'black',
    fontSize: '0.8rem',
    justifyContent: 'left',
    alignItems: 'center',
    textAlign: 'left',
    padding: 0,
    textTransform: 'none',
    '& > div': {
        width: '24px',
        '& > svg': {
            marginRight: '4px',
        },
        '& > svg[data-testid="CheckIcon"]': {
            color: 'white',
            width: '18px',
            height: '18px',
            background: '#24d76a',
            borderRadius: '5px',
            fontSize: '15px',
            border: '2px solid white',
        },
    },
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

    return <div style={{padding: '0 0.5rem'}}>
        <EditSubSkillControl subSkill2Badge={subSkill2Badge}
            onClick={onClick}/>
        <section>
            <label>{t('unlocked only')}:</label>
            <Switch checked={value.subSkillUnlockedOnly}
                onChange={onSubSkillUnlockedOnlyChange}/>
        </section>
        <section>
            <label>AND:</label>
            <Switch checked={value.subSkillAnd}
                onChange={onSubSkillAndChange}/>
        </section>
    </div>;
});

export default BoxFilterDialog;
