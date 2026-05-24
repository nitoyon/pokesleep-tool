import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import fields, { getFavoriteBerries } from "../../../data/fields";
import type { PokemonType } from "../../../data/pokemons";
import { getBerryRank, getBerryStrength } from "../../../util/Berry";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { calcBerryStrengthBonus } from "../../../util/PokemonStrength";
import { LevelInput } from "../IvForm/LevelControl";
import type { IvAction } from "../IvState";
import AreaBonusControl from "../Strength/AreaBonusControl";
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
		const [pokemonLevel, setPokemonLevel] = React.useState(level);
		const [multiplier, setMultiplier] = React.useState(1);

		const onLevelChange = React.useCallback((value: number) => {
			setPokemonLevel(value);
		}, []);

		const onAreaBonusChange = React.useCallback(
			(fieldBonus: number) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: { ...parameter, fieldBonus },
					},
				});
			},
			[dispatch, parameter],
		);

		const onMultiplierChange = React.useCallback(
			(_event: React.MouseEvent<HTMLElement>, value: string) => {
				if (value === null) {
					return;
				}
				setMultiplier(parseFloat(value));
			},
			[],
		);

		React.useEffect(() => {
			if (open) {
				setPokemonLevel(level);
				setMultiplier(calcBerryStrengthBonus(type, parameter));
			}
		}, [open, level, type, parameter]);

		if (!open) {
			return null;
		}

		const favoriteFields = fields.filter(
			(x) => getFavoriteBerries(x.index).indexOf(type) >= 0,
		);
		const baseStrength = getBerryStrength(type, pokemonLevel);
		const strength = getBerryStrength(
			type,
			pokemonLevel,
			parameter.fieldBonus,
			multiplier,
		);

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
					<div className="calculator">
						<section>
							<span className="lbl">
								<strong>{t("berry strength calculator")}:</strong>
							</span>
							<div>
								<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
								{strength}
							</div>
						</section>
						<section>
							<span className="lbl">{t("pokemon level")}:</span>
							<LevelInput
								showSlider
								value={pokemonLevel}
								onChange={onLevelChange}
							/>
						</section>
						<section>
							<span className="lbl">{t("area bonus")}:</span>
							<AreaBonusControl
								value={parameter.fieldBonus}
								onChange={onAreaBonusChange}
							/>
						</section>
						<section>
							<span className="lbl">{t("multiplier")}:</span>
							<ToggleButtonGroup
								value={multiplier}
								exclusive
								onChange={onMultiplierChange}
							>
								<ToggleButton value={1}>×1</ToggleButton>
								<ToggleButton value={2}>×2</ToggleButton>
								<ToggleButton value={2.4}>×2.4</ToggleButton>
							</ToggleButtonGroup>
						</section>
					</div>
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
	"& > article, & > div.calculator": {
		"& > section": {
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
				"& > div > input": {
					fontSize: "0.9rem",
					width: "3rem",
				},
			},
			"& small": {
				fontSize: "0.7rem",
				color: "#999",
			},
			"& > div.MuiToggleButtonGroup-root > button": {
				padding: "4px 10px",
			},
		},
	},
	"& > div.calculator": {
		background: "#eee",
		borderRadius: "0.9rem",
		marginTop: "1rem",
		padding: "0.4rem 0.5rem",
	},
});

export default TypeInfoDialog;
