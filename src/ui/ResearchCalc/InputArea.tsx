import './InputArea.css';
import Rank from '../../util/Rank';
import fields, { FieldData, MAX_STRENGTH } from '../../data/fields';
import { getDrowsyBonus } from '../../data/events';
import React, { useCallback, useState } from 'react';
import { Button, Checkbox, Collapse, FormControlLabel, InputAdornment, MenuItem,
    Slider, TextField } from '@mui/material';
import ScoreTableDialog from './ScoreTableDialog';
import ArrowButton from '../common/ArrowButton';
import ResearchAreaTextField from '../common/ResearchAreaTextField';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next';

interface InputAreaProps {
    /** state */
    data: InputAreaData;

    /** callback function when strength is changed */
    onChange: (value: Partial<InputAreaData>) => void;
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

const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

function InputArea({data, onChange: onchange}:InputAreaProps) {
    const { t } = useTranslation();
    const field = fields[data.fieldIndex];
    const strength = data.strength;
    const rank = new Rank(strength, field.ranks);
    const [isScoreTableDialogOpen, setIsScoreTableDialogOpen] = useState(false);

    const setRank = useCallback((rankIndex: number) => {
        if (rankIndex < 0 || rankIndex >= field.ranks.length) { return; }
        const strength = field.ranks[rankIndex];
        onchange?.({strength});
    }, [field.ranks, onchange]);

    const moveRank = useCallback((diff: number) => {
        if (diff === -1) {
            setRank(rank.index - 1);
        } else {
            setRank(rank.index + 1);
        }
    }, [setRank, rank.index]);
    const onRankChange = useCallback((e:any) => {
        const rankIndex = e.target.value as number;
        setRank(rankIndex);
    }, [setRank]);
    const onRankDownClick = useCallback(() => { moveRank(-1); }, [moveRank]);
    const onRankUpClick = useCallback(() => { moveRank(1); }, [moveRank]);

    const onFieldChange = useCallback((value: number) => {
        onchange?.({fieldIndex: value});
    }, [onchange]);

    const onStrengthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let strength = Number(e.target.value.replace(/,/g, ""));
        if (isNaN(strength)) {
            return;
        }
        strength = Math.max(0, strength);
        strength = Math.min(strength, MAX_STRENGTH);
        onchange?.({strength});
    }, [onchange]);

    function onSliderChange(e: Event, value: number | Array<any>) {
        // fix iOS bug on MUI slider
        // https://github.com/mui/material-ui/issues/31869
        if (isIOS && e.type === 'mousedown') {
            return;
        }

        if (typeof(value) !== "number") { return; }
        const strength = Math.min(value, rank.nextStrength - 1);
        onchange?.({...data, strength});
    }

    const onBonusChange = React.useCallback((e: any) => {
        const bonus = e.target.value as number;
        onchange?.({bonus});
    }, [onchange]);

    const onSecondSleepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const secondSleep = e.target.checked;
        onchange?.({secondSleep});
    }, [onchange]);

    const onScoreTableButtonClick = useCallback(() => {
        setIsScoreTableDialogOpen(true);
    }, [setIsScoreTableDialogOpen]);
    
    const onScoreTableDialogClose = useCallback(() => {
        setIsScoreTableDialogOpen(false);
    }, [setIsScoreTableDialogOpen]);

    return (<><form className="main">
        <div>{t("research area")}:</div>
        <div>
            <ResearchAreaTextField
                value={data.fieldIndex} onChange={onFieldChange}/>
        </div>
        <div>{t("strength")}:</div>
        <div>
            <div className="strength_first_line">
                <RankTextField field={field}
                    value={rank.index} onChange={onRankChange}/>
                <StrengthTextField
                    value={strength} onChange={onStrengthChange}/>
            </div>
            <div className="strength_second_line">
                <ArrowButton disabled={rank.index === 0} label="◀"
                    onClick={onRankDownClick}/>
                <Slider className="strength_progress" size="small" onChange={onSliderChange}
                    min={rank.thisStrength}
                    max={rank.nextStrength} value={strength} />
                <ArrowButton disabled={rank.rankNumber === 20} label="▶"
                    onClick={onRankUpClick}/>
            </div>
        </div>
        <div>{t("bonus")}:</div>
        <div>
            <div>
                <EventBonusTextField value={data.bonus} onChange={onBonusChange}/>
            </div>
            <SecondSleepCheckbox value={data.secondSleep} onChange={onSecondSleepChange}/>
        </div>
    </form>
    <div style={{textAlign: 'right'}}>
        <Button startIcon={<ScheduleIcon/>} onClick={onScoreTableButtonClick}>{t('sleep score table')}</Button>
    </div>
    <ScoreTableDialog open={isScoreTableDialogOpen}
        onClose={onScoreTableDialogClose} bonus={data.bonus} strength={strength}/>
    </>);
}

interface RankTextFieldProps {
    field: FieldData;
    value: number;
    onChange: (e: any) => void;
}

const RankTextField = React.memo(({value, onChange, field}:RankTextFieldProps) => {
    const { t } = useTranslation();

    // prepare rank menus
    const rankMenuItems = [];
    for (let i = 0; i < 35; i++) {
        const selected = (value === i);
        const rankType = Rank.rankIndexToType(i);
        const rankNumber = Rank.rankIndexToRankNumber(i);
        const strength = field.ranks[i];
        rankMenuItems.push(
            <MenuItem key={i} value={i} dense selected={selected}>
                <span className={"rank_ball rank_ball_" + rankType}>◓</span>
                <span className="rank_number">{rankNumber}</span>
                <span className="strength">{t("num", {n: strength})}{t("range separator")}</span>
            </MenuItem>);
    }

    return (
        <TextField className="rank" variant="standard" size="small" select
            value={value}
            SelectProps={{ MenuProps: {
                sx: { height: "400px" },
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={onChange}>
            {rankMenuItems}
        </TextField>
    );
});

interface StrengthTextFieldProps {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StrengthAdornment = <InputAdornment position="start" sx={{color: "#ff944b"}}><LocalFireDepartmentIcon/></InputAdornment>;

const StrengthTextField = React.memo(({value, onChange}:StrengthTextFieldProps) => {
    const { t } = useTranslation();

    const [strengthFocused, setStrengthFocused] = useState(false);
    const onStrengthFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setStrengthFocused(true);
    }, []);
    const onStrengthBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setStrengthFocused(false);
    }, []);

    const strengthValue = strengthFocused ?
        value.toString() : t("num", {n: value});

    return (
        <TextField className="strength" variant="standard" size="small" type="tel"
            value={strengthValue}
            onChange={onChange} onFocus={onStrengthFocus} onBlur={onStrengthBlur}
            InputProps={{
                inputProps: {step: 1000, inputMode: "numeric"},
                startAdornment: StrengthAdornment,
            }}/>
    );
});

interface EventBonusProps {
    value: number;
    onChange: (e: any) => void;
}

const EventBonusTextField = React.memo(({value, onChange}:EventBonusProps) => {
    const { t } = useTranslation();
    const [todaysBonus, setTodaysBonus] = useState(getDrowsyBonus(new Date()));
    React.useEffect(() => {
        const id = setInterval(function() {
            setTodaysBonus(getDrowsyBonus(new Date()));
        }, 5000);
        return () => clearInterval(id);
    }, []);

    const onBonusClick = React.useCallback(() => {
        onChange({target: {value: todaysBonus}});
    }, [onChange, todaysBonus]);

    const open = (todaysBonus !== value);
    const bonusVal = todaysBonus === 1 ? t("none") : `×${todaysBonus}`;

    return (<>
        <TextField variant="standard" size="small" select
                value={value} onChange={onChange}>
                <MenuItem key="1" value={1} dense>{t("none")}</MenuItem>
                <MenuItem key="1.5" value={1.5} dense>×1.5</MenuItem>
                <MenuItem key="2" value={2} dense>×2</MenuItem>
                <MenuItem key="2.5" value={2.5} dense>×2.5</MenuItem>
                <MenuItem key="3" value={3} dense>×3</MenuItem>
                <MenuItem key="4" value={4} dense>×4</MenuItem>
        </TextField>
        <Collapse in={open} style={{paddingTop: '0.2rem'}}>
            <Button onClick={onBonusClick}
                sx={{
                    padding: '0 0 0 1rem',
                    margin: 0,
                    fontSize: '0.8rem',
                    textIndent: '-1rem',
                    textTransform: 'none',
                    lineHeight: 1.2,
                    textAlign: 'left',
                }}>
                ⚠️{t('bonus not match', {bonus: bonusVal})}
            </Button>
        </Collapse>
    </>);
});

interface SecondSleepCheckboxProps {
    value: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SecondSleepCheckbox = React.memo(({value, onChange}:SecondSleepCheckboxProps) => {
    const { t } = useTranslation();
    return (
        <FormControlLabel control={<Checkbox checked={value}
            onChange={onChange}/>} label={t('sleep twice')} />
    );
});

export { InputArea };
export type { InputAreaData };
