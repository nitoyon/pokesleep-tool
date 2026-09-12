import {
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	Switch,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { whistlePeriod } from "../../../util/Energy";
import { clamp } from "../../../util/NumberUtil";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import NumericSliderInput from "../../common/NumericSliderInput";
import type { IvAction } from "../IvState";
import RecipeBonusLevelForm from "../Panel/RecipeBonusLevelForm";
import AreaControlGroup from "../Strength/AreaControlGroup";
import EventSelectControl from "../Strength/EventSelectControl";
import LevelEvolvedControlGroup from "../Strength/LevelEvolvedControlGroup";
import PeriodSelect from "../Strength/PeriodSelect";
import TapFrequencyControlGroup from "../Strength/TapFrequencyControlGroup";

const TeamParameterDialog = React.memo(
	({
		value,
		dispatch,
		open,
		onClose,
	}: {
		value: StrengthParameter;
		dispatch: (action: IvAction) => void;
		open: boolean;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();

		const onChange = React.useCallback(
			(value: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter: value } });
			},
			[dispatch],
		);
		const onScoreChange = React.useCallback(
			(sleepScore: number) => {
				sleepScore = clamp(0, sleepScore, 100);
				onChange({
					...value,
					sleepScore,
				});
			},
			[onChange, value],
		);
		const onAlwaysFullChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({
					...value,
					isEnergyAlwaysFull: e.target.checked,
				});
			},
			[onChange, value],
		);

		const isNotWhistle = value.period !== whistlePeriod;

		return (
			<StyledDialog open={open} onClose={onClose} fullWidth>
				<DialogContent>
					<section>
						<span className="lbl">{t("period")}:</span>
						<PeriodSelect dispatch={dispatch} value={value} />
					</section>
					<AreaControlGroup value={value} onChange={onChange} />
					<section className="mt">
						<span className="lbl">{t("event")}:</span>
						<EventSelectControl value={value} onChange={onChange} />
					</section>
					<LevelEvolvedControlGroup
						dispatch={dispatch}
						value={value}
						onChange={onChange}
					/>
					<section className="mt">
						<span className="lbl">{t("energy")}:</span>
						<div />
					</section>
					<section className="ml">
						<span className="lbl">{t("sleep score")}:</span>
						<NumericSliderInput
							value={value.sleepScore}
							onChange={onScoreChange}
							sx={{ width: "2rem", fontSize: "0.9rem" }}
							min={0}
							max={100}
						/>
					</section>
					<section className="ml">
						<span className="lbl">{t("always 81%+")}:</span>
						<Switch
							size="small"
							checked={value.isEnergyAlwaysFull}
							onChange={onAlwaysFullChange}
						/>
					</section>
					<Collapse in={isNotWhistle}>
						<TapFrequencyControlGroup
							value={value}
							onChange={onChange}
							mt="1rem"
						/>
					</Collapse>
					<RecipeBonusLevelForm value={value} onChange={onChange} />
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledDialog>
		);
	},
);

const StyledDialog = styled(Dialog)({
	"& > div.MuiDialog-container > div.MuiPaper-root": {
		width: "100%",
		margin: "20px",
		maxHeight: "calc(100% - 20px)",
	},
	"& .MuiDialogContent-root": {
		padding: "1rem",
		"& section": {
			margin: "0.2rem 0",
			fontSize: ".9rem",
			display: "flex",
			flex: "0 auto",
			"&.mt": {
				marginTop: "1rem",
			},
			"&.ml": {
				marginLeft: "1rem",
			},
			"& > span.lbl": {
				marginRight: "auto",
				marginTop: 0,
				textWrap: "wrap",
			},
			"& > span > button": {
				marginRight: 0,
			},
			"& > .MuiInput-underline": {
				fontSize: "0.9rem",
			},
			"& div.MuiToggleButtonGroup-root > button": {
				fontSize: "0.75rem",
				padding: "0.5rem 0.2rem",
				lineHeight: 1.1,
				maxWidth: "7rem",
			},
		},
	},
});

export default TeamParameterDialog;
