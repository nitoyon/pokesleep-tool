import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { styled } from '@mui/system';
import { SleepType } from '../../data/fields';
import pokemons, { PokemonData, PokemonSkill } from '../../data/pokemons';
import Nature from '../../util/Nature';
import PokemonRp, { IngredientType } from '../../util/PokemonRp';
import SubSkill from '../../util/SubSkill';
import PokemonTextField from './PokemonTextField';
import RpRaderChart from './RpRaderChart';
import { Autocomplete, ButtonBase, MenuItem, Popper, Select, SelectChangeEvent, Slider, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ResearchCalcAppRoot = styled('div')({
   margin: "0 .5rem",
});

const RpUnit = styled('div')({
    marginLeft: '0.8rem',
    marginBottom: '.4rem',
    '& header': {
        fontSize: '1rem',
        '& span': {
            display: 'inline-block',
            width: '4rem',
            fontSize: '.6rem',
            padding: '.1rem 0',
            textAlign: 'center',
            color: 'white',
            borderRadius: '.6rem',
            verticalAlign: '20%',
        },
        '& strong': {
            display: 'inline-block',
            width: '4.5rem',
            textAlign: 'right',
            color: '#555',
        }
    },
    '& section': {
        fontSize: '0.7rem',
        color: '#666',
    },
});

const ResearchCalcApp = React.memo(() => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement|null>(null);
    const width = useDomWidth(containerRef);
    const [pokemonName, setPokemonName] = useState("Bulbasaur");
    const [level, setLevel] = useState(30);
    const [skillLevel, setSkillLevel] = useState(3);
    const [ingredient, setIngredient] = useState<IngredientType>("AAA");
    const [subSkill10, setSubSkill10] = useState<SubSkill|null>(null);
    const [subSkill25, setSubSkill25] = useState<SubSkill|null>(null);
    const [subSkill50, setSubSkill50] = useState<SubSkill|null>(null);
    const [subSkill75, setSubSkill75] = useState<SubSkill|null>(null);
    const [subSkill100, setSubSkill100] = useState<SubSkill|null>(null);
    const [nature, setNature] = useState<Nature|null>(null);

    const rp = new PokemonRp(pokemonName);
    rp.level = level;
    rp.skillLevel = skillLevel;
    rp.ingredient = ingredient;
    rp.subSkill10 = subSkill10;
    rp.subSkill25 = subSkill25;
    rp.subSkill50 = subSkill50;
    rp.subSkill75 = subSkill75;
    rp.subSkill100 = subSkill100;
    rp.nature = nature;

    const rpResult = rp.calculate();

    const pokemon = rp.pokemon;
    if (skillLevel === 7 && !canBeLevel7(pokemon.skill)) {
        setSkillLevel(6);
    }

    const raderHeight = 400;
    const raderColor = pokemon.specialty === "Berries" ? "#24d76a" :
        pokemon.specialty === "Ingredients" ? "#fab855" : "#44a2fd";
    const round = (n: number) => Math.round(n * 10) / 10;
    const trunc1 = (n: number) => {
        n = round(n);
        return t('num', {n: Math.floor(n)}) +
            "." + (n * 10 % 10);
    };
    return <ResearchCalcAppRoot>
        <div ref={containerRef}>
            <div style={{transform: 'scale(1, 0.9)'}}>
                <span style={{
                    color: '#fd775d',
                    fontWeight: 'bold',
                    paddingRight: '.4rem',
                    fontSize: '.8rem',
                    verticalAlign: '15%',
                }}>SP</span>
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}>{t('num', {n: rpResult.rp})}</span>
            </div>
            <RpUnit>
                <header>
                    <span style={{background: '#24d76a'}}>きのみ</span>
                    <strong>{trunc1(rpResult.berryRp)}</strong>
                </header>
                <section>確率: {round(rp.berryRatio * 100)}%, エナジー: {rp.berryEnergy}×{rp.berryCount}</section>
            </RpUnit>
            <RpUnit>
                <header>
                    <span style={{background: '#fab855'}}>食材</span>
                    <strong>{trunc1(rpResult.ingredientRp)}</strong>
                </header>
                <section>確率: {round(rp.ingredientRatio * 100)}%, エナジー: {round(rp.ingredientEnergy * rp.ingredientG)}</section>
            </RpUnit>
            <RpUnit>
                <header>
                    <span style={{background: '#44a2fd'}}>スキル</span>
                    <strong>{trunc1(rpResult.skillRp)}</strong>
                </header>
                <section>確率: {round(rp.skillRatio * 100)}%, エナジー: {t('num', {n: rp.skillValue})}</section>
            </RpUnit>
        </div>
        <RpRaderChart rp={rpResult} width={width} height={raderHeight} color={raderColor}/>
        <form className="main" style={{marginTop: '.5rem'}}>
            <div>ポケモン:</div>
            <PokemonTextField value={pokemonName} onChange={setPokemonName}/>
            <div>レベル:</div>
            <LevelTextField value={level} onChange={setLevel}/>
            <div>食材:</div>
            <IngredientTextField pokemon={rp.pokemon}
                value={ingredient} onChange={setIngredient}/>
            <div>おてつだい時間:</div>
            <div>
                {Math.floor(rp.frequency/60)}分{Math.floor(rp.frequency)%60}秒
            </div>
            <div>スキルレベル:</div>
            <SkillLevelControl pokemon={rp.pokemon} value={skillLevel} onChange={setSkillLevel}/>
            <div>サブスキル:</div>
            <div>
                <SubSkillTextField value={subSkill10} onChange={setSubSkill10}/><br/>
                <SubSkillTextField value={subSkill25} onChange={setSubSkill25}/><br/>
                <SubSkillTextField value={subSkill50} onChange={setSubSkill50}/><br/>
                <SubSkillTextField value={subSkill75} onChange={setSubSkill75}/><br/>
                <SubSkillTextField value={subSkill100} onChange={setSubSkill100}/>
            </div>
            <div>せいかく:</div>
            <NatureTextField value={nature} onChange={setNature}/>
        </form>
    </ResearchCalcAppRoot>;
});

function useDomWidth(domRef: React.MutableRefObject<HTMLDivElement|null>) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const handler = () => {
            if (domRef.current !== null) {
                setWidth(domRef.current.clientWidth);
            }
        };
        handler();
        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("resize", handler);
        };
    }, [domRef]);
    return width;
}

/** Props for form control */
interface ControlProps<T> {
    /** Current value of the form control. */
    value: T;
    /** A function called when value has been changed. */
    onChange: (value: T) => void;
}

/** Props for form control which required current pokemon name. */
interface PokemonControlProps<T> extends ControlProps<T> {
    /** Current pokemon. */
    pokemon: PokemonData;
}

const LevelControlContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingRight: '.9rem',
});

const LevelTextField = React.memo(({value, onChange}: ControlProps<number>) => {
    const _onChange = useCallback((e: any) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        if (value > 100) {
            value = 100;
        }
        onChange(value);
    }, [onChange]);

    return (<LevelControlContainer>
            <TextField variant="standard" size="small" type="number"
                onBlur={_onChange}
                value={value}
                InputProps={{inputProps: {min: 1, max: 100}}}
                onChange={_onChange}/>
            <Slider min={0} max={100} size="small"
                value={value} onChange={_onChange}/>
        </LevelControlContainer>
    );
});

const SkillLevelControl = React.memo(({pokemon, value, onChange}: PokemonControlProps<number>) => {
    const { t } = useTranslation();
    const maxLevel = canBeLevel7(pokemon.skill) ? 7 : 6;

    // prepare menus
    const options = [];
    for (let i = 1; i <= maxLevel; i++) {
        options.push(<MenuItem key={i} value={i} dense>Lv {i}</MenuItem>);
    }

    const _onChange = useCallback((e: any) => {
        onChange(e.target.value as number);
    }, [onChange]);

    return <div>
        <span style={{marginRight: '1rem'}}>{t(`skill.${pokemon.skill}`)}</span>
        <TextField variant="standard" size="small" select
            value={value}
            SelectProps={{ MenuProps: {
                sx: { height: "400px" },
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={_onChange}>
            {options}
        </TextField>
    </div>;
});

const IngredientTextField = React.memo(({pokemon, value, onChange}: PokemonControlProps<IngredientType>) => {
    const _onChange = useCallback((e: any) => {
        onChange(e.target.value as IngredientType);
    }, [onChange]);

    // prepare menus
    const options = [];
    options.push(<MenuItem key="AAA" value="AAA" dense>AAA</MenuItem>);
    options.push(<MenuItem key="AAB" value="AAB" dense>AAB</MenuItem>);
    if (pokemon.ing3 !== undefined) {
        options.push(<MenuItem key="AAC" value="AAC" dense>AAC</MenuItem>);
    }
    options.push(<MenuItem key="ABA" value="ABA" dense>ABA</MenuItem>);
    options.push(<MenuItem key="ABB" value="ABB" dense>ABA</MenuItem>);
    if (pokemon.ing3 !== undefined) {
        options.push(<MenuItem key="ABC" value="ABC" dense>ABC</MenuItem>);
    }

    return (
        <TextField variant="standard" size="small" select
            value={value}
            SelectProps={{ MenuProps: {
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={_onChange}>
            {options}
        </TextField>
    );
});

const SubSkillTextField = React.memo(({value, onChange}: ControlProps<SubSkill|null>) => {
    const {t} = useTranslation();

    // prepare menus
    const menuItems = [];
    menuItems.push(<MenuItem key="" value=""></MenuItem>);
    for (const subSkill of SubSkill.allSubSkills) {
        menuItems.push(<MenuItem key={subSkill.name} value={subSkill.name}>
            {t(`subskill.${subSkill.name}`)}
        </MenuItem>);
    }

    const _onChange = useCallback((e: SelectChangeEvent) => {
        onChange(e.target.value === "" ? null :
            new SubSkill(e.target.value));
    }, [onChange]);

    return (
        <Select size="small" value={value?.name ?? ""} onChange={_onChange}>
            {menuItems}
        </Select>
    );
});

const NatureTextField = React.memo(({value, onChange}: ControlProps<Nature|null>) => {
    const {t} = useTranslation();

    // prepare menus
    const menuItems = [];
    menuItems.push(<MenuItem key="" value=""></MenuItem>);
    for (const nature of Nature.allNatures) {
        menuItems.push(<MenuItem key={nature.name} value={nature.name}>
            {t(`nature.${nature.name}`)}
        </MenuItem>);
    }

    const _onChange = useCallback((e: SelectChangeEvent) => {
        onChange(e.target.value === "" ? null :
            new Nature(e.target.value));
    }, [onChange]);

    return (
        <Select size="small" value={value?.name ?? ""} onChange={_onChange}>
            {menuItems}
        </Select>
    );
});

function canBeLevel7(skill: PokemonSkill): boolean {
    return skill === "Charge Strength M" ||
        skill === "Charge Strength S" ||
        skill === "Dream Shard Magnet S";
}

export default ResearchCalcApp;
