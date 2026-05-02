import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatNice, round1 } from "../../../util/NumberUtil";
import type { IngredientStrength } from "../../../util/PokemonStrength";
import IngredientIcon from "../IngredientIcon";

const IngArticle = React.memo(
	({ ingredients }: { ingredients: IngredientStrength[] }) => {
		const { t } = useTranslation();

		return (
			<StyledIngArticle className={`ing${ingredients.length}`}>
				{ingredients.map((x) => (
					<React.Fragment key={x.name}>
						<span className="ing">
							<IngredientIcon name={x.name} />
							<span>{round1(x.count)}</span>
						</span>
						<span className="strength">
							<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
							<span>{formatNice(Math.floor(x.strength), t)}</span>
						</span>
					</React.Fragment>
				))}
			</StyledIngArticle>
		);
	},
);

const StyledIngArticle = styled("div")({
	fontWeight: 600,
	justifyContent: "center",
	alignItems: "center",
	fontSize: "1.1rem",
	height: "3rem",
	display: "grid",
	gridTemplateColumns: "auto auto",
	"& > span.ing": {
		textAlign: "right",
		"& > svg": {
			width: "0.6em",
			height: "0.6em",
			paddingRight: "0.1rem",
		},
		"& > span": {
			fontSize: "0.8em",
			verticalAlign: "middle",
		},
	},
	"& svg, & span": {
		verticalAlign: "middle",
	},
	"& > span.strength": {
		paddingLeft: "0.3rem",
		textAlign: "right",
		"& > svg": { width: "0.6em", height: "0.6em" },
		"& > span": { fontSize: "0.6em" },
	},
	"&.ing2": {
		lineHeight: "50%",
	},
	"&.ing3": {
		"& > span.ing > svg": { width: "0.4em", height: "0.4em" },
		fontSize: "0.8em",
		lineHeight: "50%",
	},
});

export default IngArticle;
