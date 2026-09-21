import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
import React from "react";
import { formatWithComma } from "../../../util/NumberUtil";
import type { StrengthResult } from "../../../util/PokemonStrength";
import MagoBerry from "../../Resources/MagoBerry";

const BerryArticle = React.memo(({ result }: { result: StrengthResult }) => {
	// format berry value
	const berryStrength = formatWithComma(Math.round(result.berryStrength));
	const bigBerryStrength = formatWithComma(Math.round(result.bigBerryStrength));
	const hasBigBerry = bigBerryStrength !== "0";

	return (
		<StyledBerryArticle className={hasBigBerry ? "berry2" : "berry1"}>
			<div>
				<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
				<span>{berryStrength}</span>
			</div>
			{hasBigBerry && (
				<div>
					<MagoBerry />
					<span>{bigBerryStrength}</span>
				</div>
			)}
		</StyledBerryArticle>
	);
});

const StyledBerryArticle = styled("article")({
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	flexDirection: "column",
	fontWeight: 600,
	verticalAlign: "middle",
	fontSize: "1.1rem",
	height: "3rem",
	"& > div": {
		"& > span": {
			verticalAlign: "middle",
		},
		"& > svg": {
			verticalAlign: "middle",
		},
	},
	"&.berry2": {
		lineHeight: "1.6",
		fontSize: "0.8rem",
		"& > div > svg": {
			width: "16px",
			height: "16px",
		},
	},
});

export default BerryArticle;
