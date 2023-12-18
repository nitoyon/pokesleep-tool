import './InputArea.css';
import { Rank } from './Rank';
import fields_ from './field.json';
import React from 'react';
import { IconButton, InputAdornment, Menu, MenuItem, Slider, TextField } from '@mui/material';
import { t } from 'i18next'

type InputAreaProps = {
    /** state */
    data: InputAreaData;

    /** callback function when strength is changed */
    onchange: (value: InputAreaData) => void;
}

type FieldData = {
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

type InputAreaData = {
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

    /** whether to do two sleep sessions in one day */
    secondSleep: boolean;
}

type InputAreaState = InputAreaData & {
    /** current rank */
    rank: Rank;

    /** rank button element */
    rankMenuAnchor:HTMLElement | null;
};

class InputArea extends React.Component<InputAreaProps, InputAreaState> {
    constructor(props: InputAreaProps) {
        super(props);
        this.state = this.createState(props.data.fieldIndex,
            props.data.strength, props.data.secondSleep);
    }

    createState(fieldIndex: number, strength: number, secondSleep: boolean): InputAreaState {
        const field = fields[fieldIndex];
        const rank = new Rank(strength, field.ranks);

        return {
            fieldIndex, strength, secondSleep, rank,
            powers: fields[fieldIndex].powers,
            ranks: fields[fieldIndex].ranks,
            rankMenuAnchor: null,
        };
    }

    setRank = (rank: number) => {
        const field = fields[this.state.fieldIndex];
        if (rank < 0 || rank >= field.ranks.length) { return; }
        const strength = field.ranks[rank];
        const state = this.createState(field.index, strength, this.state.secondSleep);
        this.setState(state, () => {
            this.props.onchange?.(this.state);
        });
    }

    moveRank = (diff: number) => {
        this.setRank(this.state.rank.index + diff);
    }

    onFieldChange = (e: any) => {
        const fieldIndex = e.target.value as number;
        const state = this.createState(fieldIndex, this.state.strength, this.state.secondSleep);
        this.setState(state, () => {
            this.props.onchange?.(this.state);
        });
    }

    onStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const strength = Number(e.target.value);
        const state = this.createState(this.state.fieldIndex, strength, this.state.secondSleep);
        this.setState(state, () => {
            this.props.onchange?.(this.state);
        });
    }

    onSliderChange = (e: Event, value: number | Array<any>) => {
        if (typeof(value) !== "number") { return; }
        const strength = Math.min(value, this.state.rank.nextStrength - 1);
        const state = this.createState(this.state.fieldIndex, strength, this.state.secondSleep);
        this.setState(state, () => {
            this.props.onchange?.(this.state);
        });
    }

    onSecondSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const secondSleep = e.target.checked;
        this.setState({secondSleep}, () => {
            this.props.onchange?.(this.state);
        });
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
        const onRankButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            this.setState({rankMenuAnchor: event.currentTarget});
        }
        const onRankMenuClose = () => {
            this.setState({rankMenuAnchor: null});
        }
        const rankMenuOpen = Boolean(this.state.rankMenuAnchor);
        const rankMenuItems = [];
        const field = fields[this.state.fieldIndex];
        for (let i = 0; i < 35; i++) {
            const selected = (this.state.rank.index === i);
            const rankType = Rank.rankIndexToType(i);
            const rankNumber = Rank.rankIndexToRankNumber(i);
            const strength = field.ranks[i];
            rankMenuItems.push(
                <MenuItem key={i} value={i} dense selected={selected} onClick={() => this.setRank(i)}>
                    <span className={"rank_ball_" + rankType}>◓</span>
                    <span className="rank_number">{rankNumber}</span>
                    <span className="strength">{t("num", {n: strength})}{t("range separator")}</span>
                </MenuItem>);
        }

        return <form className="main">
            <div className="strength_container">
                <div className="rank_container">
                    <IconButton className="rank" onClick={onRankButtonClick}>
                        <span className={"rank_ball rank_ball_" + this.state.rank.type}>◓</span>
                        <span className="rank_badge">{this.state.rank.rankNumber}</span>
                        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z"></path>
                        </svg>
                    </IconButton>
                    <Menu anchorEl={this.state.rankMenuAnchor} open={rankMenuOpen} onClose={onRankMenuClose}
                        PaperProps={{style: {maxHeight: "200px"}}}>
                        {rankMenuItems}
                    </Menu>
                </div>
                <div className="strength_main">
                    <div className="strength_first_line">
                        <TextField variant="standard" size="small" select value={this.state.fieldIndex}
                            onChange={this.onFieldChange}>
                            {fieldMenuItems}
                        </TextField>
                        <TextField id="strength" variant="standard" size="small" type="number"
                            value={this.state.strength} inputProps={{step: 10000}}
                            onChange={this.onStrengthChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">🔥</InputAdornment>,
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
            </div>

            <div>
                <input type="checkbox" checked={this.state.secondSleep} id="second_sleep"
                    onChange={this.onSecondSleepChange}/>
                <label htmlFor="second_sleep">{t('sleep twice')}</label>
            </div>
        </form>
    }
}

export { InputArea };
export { fields };
export type { InputAreaData };
