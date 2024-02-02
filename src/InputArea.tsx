import './InputArea.css';
import { Rank } from './Rank';
import fields_ from './field.json';
import React, { useState } from 'react';
import { Checkbox, FormControlLabel, InputAdornment, MenuItem,
    Slider, TextField } from '@mui/material';
import ArrowButton from './ArrowButton';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslation } from 'react-i18next';

interface InputAreaProps {
    /** state */
    data: InputAreaData;

    /** callback function when strength is changed */
    onChange: (value: InputAreaData) => void;
}

interface FieldData {
    /** field index */
    index: number;
    /** field name */
    name: string;
    /** field emoji */
    emoji: string;
    /** required power to reach the rank */
    ranks: number[];
    /** required power to meet (n + 3) pokemons  */
    powers: number[];
}
const fields = fields_ as FieldData[];

// add sentinel
const MAX_STRENGTH = 9999999;
for (const field of fields) {
    field.ranks.push(MAX_STRENGTH + 1);
}

interface InputAreaData {
    /** field index */
    fieldIndex: number;

    /** current strength */
    strength: number;

    /** event bonus (multiplier) */
    bonus: number;

    /** whether to do two sleep sessions in one day */
    secondSleep: boolean;
}

function InputArea({data, onChange: onchange}:InputAreaProps) {
    const { t } = useTranslation();
    const field = fields[data.fieldIndex];
    const strength = data.strength;
    const rank = new Rank(strength, field.ranks);

    function setRank(rankIndex: number) {
        if (rankIndex < 0 || rankIndex >= field.ranks.length) { return; }
        const strength = field.ranks[rankIndex];
        onchange?.({...data, strength: strength});
    }

    function moveRank(diff: number) {
        if (diff === -1) {
            setRank(rank.index - 1);
        } else {
            setRank(rank.index + 1);
        }
    }

    function onFieldChange(e: any) {
        const fieldIndex = e.target.value as number;
        onchange?.({...data, fieldIndex});
    }

    function onStrengthChange(e: React.ChangeEvent<HTMLInputElement>) {
        let strength = Number(e.target.value.replace(/,/g, ""));
        if (isNaN(strength)) {
            return;
        }
        strength = Math.max(0, strength);
        strength = Math.min(strength, MAX_STRENGTH);
        onchange?.({...data, strength});
    }
    const [strengthFocused, setStrengthFocused] = useState(false);
    function onStrengthFocus(e: React.FocusEvent<HTMLInputElement>) {
        setStrengthFocused(true);
    }
    function onStrengthBlur(e: React.FocusEvent<HTMLInputElement>) {
        setStrengthFocused(false);
    }
    const strengthValue = strengthFocused ?
        data.strength.toString() : t("num", {n: strength});

    function onSliderChange(e: Event, value: number | Array<any>) {
        if (typeof(value) !== "number") { return; }
        const strength = Math.min(value, rank.nextStrength - 1);
        onchange?.({...data, strength});
    }

    function onBonusChange(e: any) {
        const bonus = e.target.value as number;
        onchange?.({...data, bonus});
    }

    function onSecondSleepChange(e: React.ChangeEvent<HTMLInputElement>) {
        const secondSleep = e.target.checked;
        onchange?.({...data, secondSleep});
    }

    // prepare field menus
    const fieldMenuItems = [];
    for (const field of fields) {
        fieldMenuItems.push(
            <MenuItem key={field.index} value={field.index}>
                <span className="field_icon">{field.emoji}</span>
                {t(`area.${field.index}`)}
            </MenuItem>
        );
    }

    // prepare rank menus
    const rankMenuItems = [];
    for (let i = 0; i < 35; i++) {
        const selected = (rank.index === i);
        const rankType = Rank.rankIndexToType(i);
        const rankNumber = Rank.rankIndexToRankNumber(i);
        const strength = field.ranks[i];
        rankMenuItems.push(
            <MenuItem key={i} value={i} dense selected={selected} onClick={() => setRank(i)}>
                <span className={"rank_ball rank_ball_" + rankType}>◓</span>
                <span className="rank_number">{rankNumber}</span>
                <span className="strength">{t("num", {n: strength})}{t("range separator")}</span>
            </MenuItem>);
    }

    return <form className="main">
        <div>{t("research area")}:</div>
        <div>
            <TextField variant="standard" size="small" select value={data.fieldIndex}
                SelectProps={{ MenuProps: {
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                }}}
                onChange={onFieldChange}>
                {fieldMenuItems}
            </TextField>
        </div>
        <div>{t("strength")}:</div>
        <div>
            <div className="strength_first_line">
                <TextField className="rank" variant="standard" size="small" select
                    value={rank.index}
                    SelectProps={{ MenuProps: {
                         sx: { height: "400px" },
                         anchorOrigin: { vertical: "bottom", horizontal: "left" },
                         transformOrigin: { vertical: "top", horizontal: "left" },
                    }}}>
                    {rankMenuItems}
                </TextField>
                <TextField className="strength" variant="standard" size="small" type="tel"
                    value={strengthValue}
                    onChange={onStrengthChange} onFocus={onStrengthFocus} onBlur={onStrengthBlur}
                    InputProps={{
                        inputProps: {step: 1000, inputMode: "numeric"},
                        startAdornment: <InputAdornment position="start" sx={{color: "#ff944b"}}><LocalFireDepartmentIcon/></InputAdornment>,
                    }}/>
            </div>
            <div className="strength_second_line">
                <ArrowButton disabled={rank.index === 0} label="◀"
                    onClick={() => { moveRank(-1) }}/>
                <Slider className="strength_progress" size="small" onChange={onSliderChange}
                    min={rank.thisStrength}
                    max={rank.nextStrength} value={strength} />
                <ArrowButton disabled={rank.rankNumber === 20} label="▶"
                    onClick={() => { moveRank(1) }}/>
            </div>
        </div>
        <div>{t("bonus")}:</div>
        <div>
            <div>
                <TextField variant="standard" size="small" select
                    value={data.bonus} onChange={onBonusChange}>
                    <MenuItem key="1" value={1} dense>{t("none")}</MenuItem>
                    <MenuItem key="1.5" value={1.5} dense>×1.5</MenuItem>
                    <MenuItem key="2" value={2} dense>×2</MenuItem>
                    <MenuItem key="2.5" value={2.5} dense>×2.5</MenuItem>
                    <MenuItem key="3" value={3} dense>×3</MenuItem>
                    <MenuItem key="4" value={4} dense>×4</MenuItem>
                </TextField>
            </div>
            <FormControlLabel control={<Checkbox checked={data.secondSleep} onChange={onSecondSleepChange}/>} label={t('sleep twice')} />
        </div>
    </form>
}

export { InputArea };
export { fields };
export type { InputAreaData };
