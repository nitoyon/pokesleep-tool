import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatWithComma } from "../../../util/NumberUtil";
import type {
	StrengthParameter,
	StrengthResult,
} from "../../../util/PokemonStrength";
import CollapseEx from "../../common/CollapseEx";
import type { IvAction } from "../IvState";
import TotalFlagsPanel from "../Panel/TotalFlagsPanel";

const TotalStrengthDialog = React.memo(
	({
		param,
		result,
		open,
		dispatch,
		onClose,
	}: {
		param: StrengthParameter;
		result: StrengthResult;
		open: boolean;
		dispatch: React.Dispatch<IvAction>;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();

		const onHelpingBonusEffectChange = React.useCallback(() => {
			dispatch({
				type: "changeParameter",
				payload: {
					parameter: {
						...param,
						addHelpingBonusEffect: !param.addHelpingBonusEffect,
					},
				},
			});
		}, [dispatch, param]);

		return (
			<StyledTotalStrengthDialog open={open} onClose={onClose}>
				<article>
					<TotalFlagsPanel param={param} result={result} dispatch={dispatch} />
					<CollapseEx show={result.helpingBonusStrength > 0}>
						<footer className="helpingBonus">
							<span className="lbl">{t("helping bonus addition")}: </span>
							<strong>{formatWithComma(result.helpingBonusStrength)}</strong>
						</footer>
					</CollapseEx>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								checked={param.addHelpingBonusEffect}
								onChange={onHelpingBonusEffectChange}
							/>
						}
						label={t("helping bonus addition label")}
					/>
					<CollapseEx show={param.addHelpingBonusEffect}>
						<footer className="helpingBonusNote">
							{t("other member calculation")}
						</footer>
					</CollapseEx>

					<p>{t("strength detail1")}</p>
					<p>{t("strength detail2")}</p>
					<ul style={{ paddingLeft: "1rem" }}>
						<li>{t("strength restriction2")}</li>
					</ul>
				</article>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledTotalStrengthDialog>
		);
	},
);

const StyledTotalStrengthDialog = styled(Dialog)({
	"& article": {
		margin: "0.8rem 0.8rem 0 0.8rem",
		"& footer.helpingBonus": {
			padding: "0 0 0.5rem 1rem",
			fontSize: "0.9rem",
		},
		"& > label.MuiFormControlLabel-root": {
			alignItems: "start",
			marginRight: 0,
			"& > span.MuiFormControlLabel-label": {
				paddingTop: "0.5rem",
				fontSize: "0.9rem",
			},
		},
		"& footer.helpingBonusNote": {
			padding: "0 0 0.5rem 1.8rem",
			fontSize: "0.8rem",
			color: "#999",
		},
		"& > p": {
			margin: "0.5rem 0",
			fontSize: "0.9rem",
		},
		"& > ul": {
			margin: 0,
			fontSize: "0.9rem",
		},
	},
});

export default TotalStrengthDialog;
