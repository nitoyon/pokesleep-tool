import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "../../../data/pokemons";
import { getBerryStrength } from "../../../util/Berry";
import { formatWithComma } from "../../../util/NumberUtil";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { calcBerryStrengthBonus } from "../../../util/PokemonStrength";
import RateTextField from "../../common/RateTextField";
import { LevelInput } from "../IvForm/LevelControl";
import type { IvAction } from "../IvState";
import AreaBonusControl from "../Strength/AreaBonusControl";

const BerryCalculatorPanel = React.memo(
	({
		type,
		level,
		parameter,
		dispatch,
	}: {
		type: PokemonType;
		level: number;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();
		const [pokemonLevel, setPokemonLevel] = React.useState(level);
		const [multiplier, setMultiplier] = React.useState(() =>
			calcBerryStrengthBonus(type, parameter),
		);
		const [berryZoneRate, setBerryZoneRate] = React.useState(0);
		const [isBig, setIsBig] = React.useState(false);

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

		const onBerryZoneRateChange = React.useCallback((value: number) => {
			setBerryZoneRate(value);
		}, []);

		const onSizeChange = React.useCallback(
			(_event: React.MouseEvent<HTMLElement>, value: string) => {
				if (value === null) {
					return;
				}
				setIsBig(value === "big");
			},
			[],
		);

		React.useEffect(() => {
			setPokemonLevel(level);
		}, [level]);

		const strength = getBerryStrength(
			type,
			pokemonLevel,
			parameter.fieldBonus,
			multiplier,
			isBig,
			berryZoneRate,
		);

		return (
			<StyledPanel>
				<section>
					<span className="lbl" style={{ paddingRight: ".5rem" }}>
						<strong>{t("berry strength calculator")}:</strong>
					</span>
					<div>
						<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
						{formatWithComma(strength)}
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
				<section>
					<span className="lbl">{t("skills.Berry Zone.name")}:</span>
					<RateTextField
						step={0.2}
						min={0}
						max={24}
						value={berryZoneRate}
						onChange={onBerryZoneRateChange}
					/>
				</section>
				<section>
					<span className="lbl">{t("size")}:</span>
					<ToggleButtonGroup
						value={isBig ? "big" : "normal"}
						exclusive
						onChange={onSizeChange}
					>
						<ToggleButton value="normal">{t("normal berry")}</ToggleButton>
						<ToggleButton value="big">{t("big berry")}</ToggleButton>
					</ToggleButtonGroup>
				</section>
			</StyledPanel>
		);
	},
);

const StyledPanel = styled("div")({
	background: "#eee",
	borderRadius: "0.9rem",
	marginTop: "1rem",
	padding: "0.4rem 0.5rem",
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
			"& > button": {
				textTransform: "none",
			},
		},
		"& > div.MuiToggleButtonGroup-root > button": {
			padding: "4px 10px",
		},
	},
});

export default BerryCalculatorPanel;
