import './InputArea.css';
import { Rank } from './Rank';
import fields_ from './field.json';
import React from 'react';
import { Checkbox, FormControlLabel, IconButton, InputAdornment, MenuItem,
    Slider, TextField } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { t } from 'i18next'

interface InputAreaProps {
    /** state */
    data: InputAreaData;

    /** callback function when strength is changed */
    onchange: (value: InputAreaData) => void;
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
for (const field of fields) {
    field.ranks.push(10000000);
}

interface InputAreaData {
    /** field index */
    fieldIndex: number;

    /** required power to meet (n + 3) pokemons
     *
     * powers[0] : 4 pokemon threshold
     * powers[1] : 5 pokemon threshold
     *    :
     * powers[5] : 8 pokemon threshold
     */
    powers: number[];

    /** required power to reach the rank */
    ranks: number[],

    /** current strength */
    strength: number;

    /** event bonus (multiplier) */
    bonus: number;

    /** whether to do two sleep sessions in one day */
    secondSleep: boolean;
}

interface InputAreaState extends InputAreaData {
    /** current rank */
    rank: Rank;

    /** rank button element */
    rankMenuAnchor:HTMLElement | null;
}

class InputArea extends React.Component<InputAreaProps, InputAreaState> {
    constructor(props: InputAreaProps) {
        super(props);
        this.state = this.createState(props.data.fieldIndex,
            props.data.strength, props.data.bonus, props.data.secondSleep);
    }

    createState(fieldIndex: number, strength: number, 
        bonus: number, secondSleep: boolean): InputAreaState {
        const field = fields[fieldIndex];
        const rank = new Rank(strength, field.ranks);

        return {
            fieldIndex, strength,  secondSleep, rank, bonus,
            powers: fields[fieldIndex].powers,
            ranks: fields[fieldIndex].ranks,
            rankMenuAnchor: null,
        };
    }

    updateState<K extends keyof InputAreaState>(state: Pick<InputAreaState, K>) {
        this.setState(state, () => {
            this.props.onchange?.(this.state);
        });
    }

    setRank = (rankIndex: number, isLast: boolean) => {
        const field = fields[this.state.fieldIndex];
        if (rankIndex < 0 || rankIndex >= field.ranks.length) { return; }
        const strength = isLast ?
            field.ranks[rankIndex + 1] - 1 :
            field.ranks[rankIndex];
        const rank = new Rank(strength, field.ranks);
        this.updateState({rank, strength});
    }

    moveRank = (diff: number) => {
        if (diff === -1) {
            if (this.state.rank.thisStrength === this.state.strength) {
                this.setRank(this.state.rank.index - 1, false);
            } else {
                this.updateState({strength: this.state.rank.thisStrength});
            }
        } else {
            const maxStrength = this.state.rank.nextStrength - 1;
            if (maxStrength === this.state.strength) {
                this.setRank(this.state.rank.index + 1, true);
            } else {
                this.updateState({strength: maxStrength});
            }

        }
    }

    onFieldChange = (e: any) => {
        const fieldIndex = e.target.value as number;
        const field = fields[fieldIndex];
        const rank = new Rank(this.state.strength, field.ranks);
        this.updateState({fieldIndex, rank,
            powers: field.powers, ranks: field.ranks});
    }

    onStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const strength = Number(e.target.value.replace(/,/g, ""));
        if (isNaN(strength)) {
            return;
        }
        const field = fields[this.state.fieldIndex];
        const rank = new Rank(strength, field.ranks);
        this.updateState({rank, strength});
    }

    onRankChange = (e: any) => {
        const rankIndex = e.target.value as number;
        this.setRank(rankIndex, false);
    }

    onSliderChange = (e: Event, value: number | Array<any>) => {
        if (typeof(value) !== "number") { return; }
        const strength = Math.min(value, this.state.rank.nextStrength - 1);
        this.updateState({strength});
    }

    onBonusChange = (e: any) => {
        const bonus = e.target.value as number;
        this.updateState({bonus});
    }

    onSecondSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const secondSleep = e.target.checked;
        this.updateState({secondSleep});
    }

    render() {
        // prepare field menus
        const fieldMenuItems = [];
        for (const field of fields) {
            fieldMenuItems.push(
                <MenuItem key={field.index} value={field.index}>
                    {field.emoji}{t(`area.${field.index}`)}
                </MenuItem>
            );
        }

        // prepare rank menus
        const rankMenuItems = [];
        const field = fields[this.state.fieldIndex];
        for (let i = 0; i < 35; i++) {
            const selected = (this.state.rank.index === i);
            const rankType = Rank.rankIndexToType(i);
            const rankNumber = Rank.rankIndexToRankNumber(i);
            const strength = field.ranks[i];
            rankMenuItems.push(
                <MenuItem key={i} value={i} dense selected={selected} onClick={() => this.setRank(i, false)}>
                    <span className={"rank_ball rank_ball_" + rankType}>◓</span>
                    <span className="rank_number">{rankNumber}</span>
                    <span className="strength">{t("num", {n: strength})}{t("range separator")}</span>
                </MenuItem>);
        }

        return <form className="main">
            <div>{t("research area")}:</div>
            <div>
                <TextField variant="standard" size="small" select value={this.state.fieldIndex}
                    onChange={this.onFieldChange}>
                    {fieldMenuItems}
                </TextField>
            </div>
            <div>{t("strength")}:</div>
            <div>
                <div className="strength_first_line">
                    <TextField className="rank" variant="standard" size="small" select
                        value={this.state.rank.index}
                        SelectProps={{
                            MenuProps: { sx: { height: "300px" } },
                        }}>
                        {rankMenuItems}
                    </TextField>
                    <TextField className="strength" variant="standard" size="small" type="tel"
                        value={t("num", {n: this.state.strength})}
                        onChange={this.onStrengthChange}
                        InputProps={{
                            inputProps: {step: 1000},
                            startAdornment: <InputAdornment position="start" sx={{color: "#ff944b"}}><LocalFireDepartmentIcon/></InputAdornment>,
                        }}/>
                </div>
                <div className="strength_second_line">
                    <IconButton className="rank_move" disabled={this.state.rank.index === 0}
                        onClick={() => { this.moveRank(-1) }}>◀</IconButton>
                    <Slider className="strength_progress" size="small" onChange={this.onSliderChange}
                        min={this.state.rank.thisStrength}
                        max={this.state.rank.nextStrength} value={this.state.strength} />
                    <IconButton className="rank_move" disabled={this.state.rank.rankNumber === 20}
                        onClick={() => { this.moveRank(1) }}>▶</IconButton>
                </div>
            </div>
            <div>{t("bonus")}:</div>
            <div>
                <div>
                    <TextField variant="standard" size="small" select
                        value={this.state.bonus} onChange={this.onBonusChange}>
                        <MenuItem key="1" value={1} dense>{t("none")}</MenuItem>
                        <MenuItem key="1.5" value={1.5} dense>×1.5</MenuItem>
                        <MenuItem key="2" value={2} dense>×2</MenuItem>
                        <MenuItem key="2.5" value={2.5} dense>×2.5</MenuItem>
                        <MenuItem key="3" value={3} dense>×3</MenuItem>
                        <MenuItem key="4" value={4} dense>×4</MenuItem>
                    </TextField>
                </div>
                <FormControlLabel control={<Checkbox checked={this.state.secondSleep} onChange={this.onSecondSleepChange}/>} label={t('sleep twice')} />
            </div>
        </form>
    }
}

export { InputArea };
export { fields };
export type { InputAreaData };
