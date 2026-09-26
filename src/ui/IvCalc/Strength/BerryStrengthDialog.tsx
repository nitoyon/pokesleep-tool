import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "../../../data/pokemons";
import { getBerryStrength } from "../../../util/Berry";
import { formatWithComma } from "../../../util/NumberUtil";
import {
	calcBerryStrengthBonus,
	type StrengthParameter,
} from "../../../util/PokemonStrength";
import type { IvAction } from "../IvState";
import BerryCalculatorPanel from "../Panel/BerryCalculatorPanel";
import { StyledInfoDialog } from "./StrengthBerryIngSkillView";

const BerryStrengthDialog = React.memo(
	({
		open,
		onClose,
		type,
		level,
		parameter,
		dispatch,
	}: {
		open: boolean;
		onClose: () => void;
		type: PokemonType;
		level: number;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();
		if (!open) {
			return null;
		}

		const fieldBonus = parameter.fieldBonus;
		const berryStrengthMultiplier = calcBerryStrengthBonus(type, parameter);
		const berryRawStrength = getBerryStrength(type, level);
		const berryStrength = getBerryStrength(
			type,
			level,
			fieldBonus,
			berryStrengthMultiplier,
		);

		return (
			<StyledInfoDialog
				open={open}
				onClose={onClose}
				PaperProps={{ style: { maxWidth: "20rem" } }}
			>
				<DialogTitle>
					<article>
						<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
						{formatWithComma(berryStrength)}
					</article>
					<footer>
						<span className="box box3">{berryRawStrength}</span>
						<> × </>
						(1 + <span className="box box4">{fieldBonus}%</span>)<> × </>
						<span className="box box5">{berryStrengthMultiplier}</span>
					</footer>
				</DialogTitle>
				<DialogContent>
					<article>
						<div>
							<span className="box box3">{berryRawStrength}</span>
						</div>
						<span>{t("berry strength")}</span>
						<div>
							<span className="box box4">{fieldBonus}%</span>
						</div>
						<span>{t("area bonus")}</span>
						<div>
							<span className="box box5">{berryStrengthMultiplier}</span>
						</div>
						<span>{t("favorite berry")}</span>
					</article>
					<div style={{ padding: "0 0.5rem" }}>
						<BerryCalculatorPanel
							type={type}
							level={level}
							parameter={parameter}
							dispatch={dispatch}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledInfoDialog>
		);
	},
);

export default BerryStrengthDialog;
