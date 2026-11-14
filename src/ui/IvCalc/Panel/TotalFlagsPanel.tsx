import BlockIcon from "@mui/icons-material/Block";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { formatWithComma } from "../../../util/NumberUtil";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import type { IvAction } from "../IvState";
import SpecialtyButton from "../SpecialtyButton";

const TotalFlagsPanel = React.memo(
	({
		param,
		result,
		dispatch,
	}: {
		param: StrengthParameter;
		result: StrengthResult;
		dispatch: React.Dispatch<IvAction>;
	}) => {
		const onDisableClick = React.useCallback(
			(index: number) => {
				const totalFlags = [...param.totalFlags];
				if (index < totalFlags.length) {
					totalFlags[index] = !totalFlags[index];
				}
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: { ...param, totalFlags },
					},
				});
			},
			[dispatch, param],
		);

		return (
			<StyledTotalStrengthPanel>
				<h1>
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span style={{ transform: "scale(1, 0.9)" }}>
						{formatWithComma(Math.round(result.totalStrength))}
					</span>
				</h1>
				<div className="grid">
					<SpecialtyButton disabled specialty="Berries" />
					<div className={param.totalFlags[0] ? "" : "disabled"}>
						{formatWithComma(Math.round(result.berryTotalStrength))}
					</div>
					<IconButton
						size="small"
						onClick={() => onDisableClick(0)}
						className={param.totalFlags[0] ? "" : "disabled"}
					>
						<BlockIcon fontSize="small" />
					</IconButton>
					<SpecialtyButton disabled specialty="Ingredients" />
					<div className={param.totalFlags[1] ? "" : "disabled"}>
						{formatWithComma(Math.round(result.ingStrength))}
					</div>
					<IconButton
						size="small"
						onClick={() => onDisableClick(1)}
						className={param.totalFlags[1] ? "" : "disabled"}
					>
						<BlockIcon fontSize="small" />
					</IconButton>
					<SpecialtyButton disabled specialty="Skills" />
					<div className={param.totalFlags[2] ? "" : "disabled"}>
						{formatWithComma(
							Math.round(result.skillStrength + result.skillStrength2),
						)}
					</div>
					<IconButton
						size="small"
						onClick={() => onDisableClick(2)}
						className={param.totalFlags[2] ? "" : "disabled"}
					>
						<BlockIcon fontSize="small" />
					</IconButton>
				</div>
			</StyledTotalStrengthPanel>
		);
	},
);

interface StrengthResult {
	totalStrength: number;
	berryTotalStrength: number;
	ingStrength: number;
	skillStrength: number;
	skillStrength2: number;
}

const StyledTotalStrengthPanel = styled("div")({
	"& > h1": {
		fontSize: "1.4rem",
		margin: 0,
		display: "flex",
		alignItems: "center",
	},
	"& > div.grid": {
		margin: "0.2rem 0 0.5rem 1rem",
		display: "grid",
		gridTemplateColumns: "min-content min-content min-content",
		gridGap: "0.2rem 0rem",
		alignItems: "center",
		"& > div": {
			textAlign: "right",
			fontWeight: "bold",
			paddingLeft: "0.5rem",
			"&.disabled": {
				color: "#ccc",
				textDecoration: "line-through #ff0000",
			},
		},
		"& > button": {
			"& > svg": {
				fill: "#ccc",
			},
			"&.disabled > svg": {
				fill: "#ff0000",
			},
		},
	},
});

export default TotalFlagsPanel;
