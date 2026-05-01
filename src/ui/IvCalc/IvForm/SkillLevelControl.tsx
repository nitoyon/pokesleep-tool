import React from "react";
import { styled } from "@mui/system";
import SelectEx from "../../common/SelectEx";
import SkillDetailDialog from "./SkillDetailDialog";
import {
	getMaxSkillLevel,
	MainSkillName,
	VersatileCandidates,
} from "../../../util/MainSkill";
import PokemonIv from "../../../util/PokemonIv";
import InfoButton from "../InfoButton";
import { MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

const SkillLevelControl = React.memo(
	({
		value,
		onChange,
	}: {
		value: PokemonIv;
		onChange: (value: PokemonIv) => void;
	}) => {
		const { t } = useTranslation();
		const [infoOpen, setInfoOpen] = React.useState(false);
		const onInfoClick = React.useCallback(() => {
			setInfoOpen(true);
		}, []);
		const onInfoClose = React.useCallback(() => {
			setInfoOpen(false);
		}, []);

		const pokemon = value.pokemon;
		const maxLevel = getMaxSkillLevel(pokemon.skill);

		// prepare menus
		const isVersatile = value.pokemon.skill === "Versatile";
		const versatileOptions = React.useMemo(() => {
			if (!isVersatile) {
				return [];
			}
			return VersatileCandidates.map((name) => (
				<VersatileMenuItem key={name} value={name} dense>
					<span className="hide">{t("skills.Versatile.name")} (</span>
					{t(`skills.${name.replace(" (Random)", "")}.name`)}
					<span className="hide">)</span>
				</VersatileMenuItem>
			));
		}, [isVersatile, t]);

		const levelOptions = React.useMemo(() => {
			const ret = [];
			for (let i = 1; i <= maxLevel; i++) {
				ret.push(
					<MenuItem key={i} value={i} dense>
						Lv {i}
					</MenuItem>,
				);
			}
			return ret;
		}, [maxLevel]);

		const onSkillLevelChange = React.useCallback(
			(val: string) => {
				onChange(value.clone({ skillLevel: parseInt(val, 10) }));
			},
			[value, onChange],
		);

		const onVersatileChange = React.useCallback(
			(val: string) => {
				onChange(value.clone({ versatileSkill: val as MainSkillName }));
			},
			[value, onChange],
		);

		return (
			<StyledSkillLevel>
				{!isVersatile && (
					<span style={{ marginRight: "10px" }}>
						{t(`skills.${value.pokemon.skill}.name`)}
					</span>
				)}
				{isVersatile && (
					<SelectEx
						sx={{ marginRight: "10px" }}
						menuSx={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
						}}
						value={value.versatileSkill}
						onChange={onVersatileChange}
					>
						{versatileOptions}
					</SelectEx>
				)}
				<SelectEx
					value={value.skillLevel}
					onChange={onSkillLevelChange}
					sx={{ padding: "0 8px" }}
				>
					{levelOptions}
				</SelectEx>
				{value.pokemon.skill !== "unknown" && (
					<InfoButton onClick={onInfoClick} />
				)}
				<SkillDetailDialog
					value={value}
					open={infoOpen}
					onClose={onInfoClose}
				/>
			</StyledSkillLevel>
		);
	},
);

const VersatileMenuItem = styled(MenuItem)({
	"& .hide": {
		display: "none",
	},
});

const StyledSkillLevel = styled("div")({
	"& .MuiSelect-select": {
		paddingTop: "1px",
		paddingBottom: "1px",
		fontSize: "0.9rem",
	},
});

export default SkillLevelControl;
