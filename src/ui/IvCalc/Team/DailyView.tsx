import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import type { IngredientName } from "../../../data/pokemons";
import { formatWithComma, round1 } from "../../../util/NumberUtil";
import type PokemonIv from "../../../util/PokemonIv";
import IngredientIcon from "../IngredientIcon";
import MainSkillIcon from "../MainSkillIcon";
import PokemonIcon from "../PokemonIcon";
import SpecialtyButton from "../SpecialtyButton";

/** Minimal result interface required by DailyView. */
interface DailyViewResult {
	iv: PokemonIv;
	totalStrength: number;
	berryTotalStrength: number;
	skillCount: number;
	skillStrength: number;
	skillExtraHelp: number;
	skillHelperBoost: number;
	skillEnergizingCheer: number;
	skillEnergyForEveryone: number;
	skillDreamShards: number;
	skillPotExtended: number;
	skillExtraTastyRate: number;
	ingredients: { name: IngredientName; count: number }[];
}

const DailyView = React.memo(
	({ results }: { results: (DailyViewResult | undefined)[] }) => {
		const total = results.reduce((sum, r) => sum + (r?.totalStrength ?? 0), 0);
		const totalBerry = results.reduce(
			(sum, r) => sum + (r?.berryTotalStrength ?? 0),
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
				<StyledTotalArticle style={{ marginLeft: "-0.1rem" }}>
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span>{formatWithComma(totalBerry)}</span>
				</StyledTotalArticle>
				<div className="category">
					<SpecialtyButton specialty="Ingredients" disabled />
				</div>
				<StyledTotalArticle className="ing">
					{ingNamesByCount.map((ing) => (
						<span key={ing} className="ing2">
							<IngredientIcon name={ing} />
							<span>{round1(ingMap.get(ing) ?? 0)}</span>
						</span>
					))}
				</StyledTotalArticle>
				<div className="category">
					<SpecialtyButton specialty="Skills" disabled />
				</div>
				<StyledTotalArticle>
					<SkillView results={results} />
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
	"& > svg, & > span": {
		verticalAlign: "middle",
	},
	"& > svg": {
		width: "1.1rem",
		height: "1.1rem",
	},
	"& > span.ing2": {
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
	"& > div > span.skill": {
		whiteSpace: "nowrap",
		"& > div": {
			verticalAlign: "middle",
			display: "inline-block",
			marginRight: "0.1rem",
		},
		"& > svg": {
			width: 14,
			height: 14,
			marginRight: "0.1rem",
			verticalAlign: "middle",
		},
		"& > span": {
			fontSize: "0.7rem",
			paddingRight: "0.4rem",
			verticalAlign: "middle",
		},
	},
});

const SkillView = React.memo(
	({ results }: { results: (DailyViewResult | undefined)[] }) => {
		const { t } = useTranslation();
		const skillsByMember = results
			.filter((x) => x !== undefined)
			.filter((x) => x.skillCount > 0)
			.map((x, i) => (
				<span className="skill" key={`${x.iv.idForm}-${i.toString()}`}>
					<PokemonIcon
						idForm={x.iv.idForm}
						shiny={x.iv.shiny}
						size={12}
						radius={4}
					/>
					<span>
						{round1(x.skillCount)}
						{t("times unit")}
					</span>
				</span>
			));

		const skillByTotal = [];
		const totalSkillStrength = results.reduce(
			(sum, r) => sum + (r?.skillStrength ?? 0),
			0,
		);
		if (totalSkillStrength > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Charge Strength S" />
					<span>{formatWithComma(totalSkillStrength)}</span>
				</span>,
			);
		}
		const totalSkillExtraHelp = results.reduce(
			(sum, r) => sum + (r?.skillExtraHelp ?? 0),
			0,
		);
		if (totalSkillExtraHelp > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Extra Helpful S" />
					<span>{round1(totalSkillExtraHelp)}</span>
				</span>,
			);
		}
		const totalSkillHelperBoost = results.reduce(
			(sum, r) => sum + (r?.skillHelperBoost ?? 0),
			0,
		);
		if (totalSkillHelperBoost > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Helper Boost" />
					<span>{round1(totalSkillHelperBoost)}</span>
				</span>,
			);
		}
		const totalSkillEnergizingCheer = results.reduce(
			(sum, r) => sum + (r?.skillEnergizingCheer ?? 0),
			0,
		);
		if (totalSkillEnergizingCheer > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Energizing Cheer S" />
					<span>{round1(totalSkillEnergizingCheer)}</span>
				</span>,
			);
		}
		const totalSkillEnergyForEveryone = results.reduce(
			(sum, r) => sum + (r?.skillEnergyForEveryone ?? 0),
			0,
		);
		if (totalSkillEnergyForEveryone > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Energy for Everyone S" />
					<span>{round1(totalSkillEnergyForEveryone)}</span>
				</span>,
			);
		}
		const totalSkillShards = results.reduce(
			(sum, r) => sum + (r?.skillDreamShards ?? 0),
			0,
		);
		if (totalSkillShards > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Dream Shard Magnet S" />
					<span>{formatWithComma(totalSkillShards)}</span>
				</span>,
			);
		}
		const totalSkillPot = results.reduce(
			(sum, r) => sum + (r?.skillPotExtended ?? 0),
			0,
		);
		if (totalSkillPot > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Cooking Power-Up S" />
					<span>{round1(totalSkillPot)}</span>
				</span>,
			);
		}
		const totalSkillTasty = results.reduce(
			(sum, r) => sum + (r?.skillExtraTastyRate ?? 0),
			0,
		);
		if (totalSkillTasty > 0) {
			skillByTotal.push(
				<span className="skill">
					<MainSkillIcon mainSkill="Tasty Chance S" />
					<span>{round1(totalSkillTasty)}</span>
				</span>,
			);
		}

		return (
			<>
				{skillsByMember.length > 0 && <div>{skillsByMember}</div>}
				{skillByTotal.length > 0 && <div>{skillByTotal}</div>}
			</>
		);
	},
);

export default DailyView;
