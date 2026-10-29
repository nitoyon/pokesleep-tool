import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type PokemonIv from "../../util/PokemonIv";
import PokemonRating, { type RatingValue } from "../../util/PokemonRating";
import type { StrengthParameter } from "../../util/PokemonStrength";
import RaderChart from "./Chart/RaderChart";
import InfoButton from "./InfoButton";
import BerryIngSkillView from "./Rp/BerryIngSkillView";

const RatingView = React.memo(
	({
		pokemonIv,
		parameter,
		width,
	}: {
		pokemonIv: PokemonIv;
		parameter: StrengthParameter;
		width: number;
	}) => {
		const { t } = useTranslation();
		const [helpOpen, setHelpOpen] = React.useState(false);
		const onHelpClick = React.useCallback(() => {
			setHelpOpen(true);
		}, []);
		const onHelpDialogClose = React.useCallback(() => {
			setHelpOpen(false);
		}, []);

		const result = React.useMemo(
			() => new PokemonRating(pokemonIv, parameter).calculate(),
			[pokemonIv, parameter],
		);

		const raderHeight = 400;

		const trunc1 = (n: number) => {
			n = Math.round(n * 10) / 10;
			return `${t("num", { n: Math.floor(n) })}.${Math.round(n * 10) % 10}`;
		};

		const formatTop = (value: RatingValue) => (
			<>
				<span style={{ paddingLeft: 0, paddingRight: ".1rem" }}>
					{t("rating top")}
				</span>
				{formatPercent(value.topPercent)}
				<span>%</span>
			</>
		);
		const formatAmount = (value: RatingValue) =>
			`${t("rating expected")}: ${trunc1(value.value)}`;

		return (
			<div style={{ minHeight: "190px" }}>
				<p style={{ margin: "0" }}>
					{t("rate subskill and nature")}
					<InfoButton onClick={onHelpClick} />
				</p>
				<BerryIngSkillView
					berryValue={formatTop(result.berry)}
					berryProb={trunc1(result.berryRate * 100)}
					berrySubValue={formatAmount(result.berry)}
					ingredientValue={formatTop(result.ingredient)}
					ingredientProb={trunc1(result.ingRate * 100)}
					ingredientSubValue={formatAmount(result.ingredient)}
					skillValue={formatTop(result.skill)}
					skillProb={trunc1(result.skillRate * 100)}
					skillSubValue={formatAmount(result.skill)}
				/>
				<RaderChart
					width={width}
					height={raderHeight}
					specialty={pokemonIv.pokemon.specialty}
					berry={1 - result.berry.topPercent / 100}
					ingredient={1 - result.ingredient.topPercent / 100}
					skill={1 - result.skill.topPercent / 100}
				/>
				<HelpDialog open={helpOpen} onClose={onHelpDialogClose} />
			</div>
		);
	},
);

/**
 * Format the top percent (ex: 12.3, 1.2, 0.12, <0.01).
 */
function formatPercent(n: number): string {
	if (n >= 1) {
		return (Math.ceil(n * 10) / 10).toFixed(1);
	}
	if (n >= 0.01) {
		return (Math.ceil(n * 100) / 100).toFixed(2);
	}
	return "<0.01";
}

const HelpDialog = React.memo(
	({ open, onClose }: { open: boolean; onClose: () => void }) => {
		const { t } = useTranslation();

		return (
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>{t("rating")}</DialogTitle>
				<DialogContent dividers style={{ fontSize: "0.95rem" }}>
					<p style={{ marginTop: 0 }}>{t("rating detail1")}</p>
					<p>{t("rating detail2")}</p>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

export default RatingView;
