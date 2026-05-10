import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
import React from "react";
import type { IngredientName } from "../../../data/pokemons";
import { formatWithComma, round1 } from "../../../util/NumberUtil";
import IngredientIcon from "../IngredientIcon";
import SpecialtyButton from "../SpecialtyButton";

/** Minimal result interface required by DailyView. */
interface DailyViewResult {
	totalStrength: number;
	berryTotalStrength: number;
	skillStrength: number;
	skillStrength2: number;
	ingredients: { name: IngredientName; count: number }[];
}

const DailyView = React.memo(
	({ results }: { results: (DailyViewResult | undefined)[] }) => {
		const total = results.reduce((sum, r) => sum + (r?.totalStrength ?? 0), 0);
		const totalBerry = results.reduce(
			(sum, r) => sum + (r?.berryTotalStrength ?? 0),
			0,
		);
		const totalSkill = results.reduce(
			(sum, r) => sum + (r?.skillStrength ?? 0) + (r?.skillStrength2 ?? 0),
			0,
		);

		const ingMap = new Map<IngredientName, number>();
		for (const r of results) {
			if (!r) continue;
			for (const ing of r.ingredients) {
				ingMap.set(ing.name, (ingMap.get(ing.name) ?? 0) + ing.count);
			}
		}
		const ingNamesByCount = [...ingMap.keys()].sort(
			(a, b) => (ingMap.get(b) ?? 0) - (ingMap.get(a) ?? 0),
		);

		return (
			<StyledDailyView>
				<h2>
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span>{formatWithComma(total)}</span>
				</h2>
				<div className="category">
					<SpecialtyButton specialty="Berries" disabled />
				</div>
				<StyledTotalArticle>
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span>{formatWithComma(totalBerry)}</span>
				</StyledTotalArticle>
				<div className="category">
					<SpecialtyButton specialty="Ingredients" disabled />
				</div>
				<StyledTotalArticle className="ing">
					{ingNamesByCount.map((ing) => (
						<span key={ing} className="ing">
							<IngredientIcon name={ing} />
							<span>{round1(ingMap.get(ing) ?? 0)}</span>
						</span>
					))}
				</StyledTotalArticle>
				<div className="category">
					<SpecialtyButton specialty="Skills" disabled />
				</div>
				<StyledTotalArticle>
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span>{formatWithComma(totalSkill)}</span>
				</StyledTotalArticle>
			</StyledDailyView>
		);
	},
);

const StyledDailyView = styled("div")({
	margin: "1rem 0.5rem 0 0.5rem",
	display: "grid",
	gap: "0.2rem 0.5rem",
	gridTemplateColumns: "fit-content(3rem) 1fr",
	"& > h2": {
		gridColumn: "1 / -1",
		fontSize: "1.1rem",
		margin: 0,
		display: "flex",
		"& > svg, & > span": {
			verticalAlign: "middle",
		},
	},
	"& > div.category": {
		alignSelf: "start",
		justifySelf: "start",
	},
});

const StyledTotalArticle = styled("div")({
	fontSize: "0.8rem",
	"&.ing": {
		marginLeft: "0.2rem",
	},
	"& > svg, & > span": {
		verticalAlign: "middle",
	},
	"& > svg": {
		width: "1.1rem",
		height: "1.1rem",
	},
	"& > span.ing": {
		whiteSpace: "nowrap",
		verticalAlign: "middle",
		paddingRight: "0.4rem",
		"&:last-of-type": {
			paddingRight: "0",
		},
		"& > svg": {
			paddingRight: "0.1rem",
			width: "0.8rem",
			height: "0.8rem",
			verticalAlign: "middle",
		},
		"& > span": {
			fontSize: "0.7rem",
			verticalAlign: "middle",
		},
	},
});

export default DailyView;
