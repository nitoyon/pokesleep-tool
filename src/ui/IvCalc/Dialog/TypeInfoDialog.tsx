import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import fields, { getFavoriteBerries } from "../../../data/fields";
import type { PokemonType } from "../../../data/pokemons";
import { getBerryRank, getBerryStrength } from "../../../util/Berry";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import type { IvAction } from "../IvState";
import BerryCalculatorPanel from "../Panel/BerryCalculatorPanel";
import TypeButton from "../TypeButton";

const TypeInfoDialog = React.memo(
	({
		open,
		type,
		level,
		parameter,
		dispatch,
		onClose,
	}: {
		open: boolean;
		type: PokemonType;
		level: number;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();

		if (!open) {
			return null;
		}

		const favoriteFields = fields.filter(
			(x) => getFavoriteBerries(x.index).indexOf(type) >= 0,
		);
		const baseStrength = getBerryStrength(type, level);

		return (
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>
					<TypeButton type={type} disabled />
				</DialogTitle>
				<StyledContent>
					<article>
						<section>
							<span className="lbl">{t("base strength")}:</span>
							<div>
								<div style={{ textAlign: "right" }}>
									{baseStrength}
									<br />
									<small>
										({t("18berry rank", { rank: getBerryRank(type) })})
									</small>
								</div>
							</div>
						</section>
						<section>
							<span className="lbl">{t("favorite berry")}:</span>
							<div>
								{favoriteFields.map((x) => (
									<div key={x.index}>{t(`area.${x.index}`)}</div>
								))}
							</div>
						</section>
					</article>
					<BerryCalculatorPanel
						type={type}
						level={level}
						parameter={parameter}
						dispatch={dispatch}
					/>
				</StyledContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

const StyledContent = styled(DialogContent)({
	paddingBottom: 0,
	minWidth: 250,
	"& > article > section": {
		display: "flex",
		flex: "0 auto",
		alignItems: "start",
		marginTop: "0.5rem",
		"&:first-of-type": {
			marginTop: 0,
		},
		"& > span.lbl": {
			marginRight: "auto",
			fontSize: "0.9rem",
		},
		"& > div": {
			marginRight: 0,
			display: "flex",
			alignItems: "center",
			lineHeight: 1.2,
		},
		"& small": {
			fontSize: "0.7rem",
			color: "#999",
		},
	},
});

export default TypeInfoDialog;
