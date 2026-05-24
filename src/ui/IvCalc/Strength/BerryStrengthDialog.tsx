import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { getBerryStrength } from "../../../util/Berry";
import { formatWithComma } from "../../../util/NumberUtil";
import type PokemonIv from "../../../util/PokemonIv";
import { StyledInfoDialog } from "./StrengthBerryIngSkillView";

const BerryStrengthDialog = React.memo(
	({
		open,
		onClose,
		iv,
		fieldBonus,
		berryStrengthMultiplier,
	}: {
		open: boolean;
		onClose: () => void;
		iv: PokemonIv;
		fieldBonus: number;
		berryStrengthMultiplier: number;
	}) => {
		const { t } = useTranslation();
		if (!open) {
			return null;
		}

		const berryRawStrength = getBerryStrength(iv.pokemon.type, iv.level);
		const berryStrength = getBerryStrength(
			iv.pokemon.type,
			iv.level,
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
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledInfoDialog>
		);
	},
);

export default BerryStrengthDialog;
