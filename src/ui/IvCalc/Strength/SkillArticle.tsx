import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
import type i18next from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatNice } from "../../../util/NumberUtil";
import type PokemonIv from "../../../util/PokemonIv";
import IngredientIcon from "../IngredientIcon";
import MainSkillIcon from "../MainSkillIcon";

const SkillArticle = React.memo(
	({
		pokemonIv,
		skillValue,
		skillStrength,
		skillValue2,
		skillStrength2,
	}: {
		pokemonIv: PokemonIv;
		skillValue: number;
		skillStrength: number;
		skillValue2: number;
		skillStrength2: number;
	}) => {
		const { t } = useTranslation();

		const skill1 = getSkill1Row(pokemonIv, skillValue, skillStrength, t);
		const skill2 = getSkill2Row(pokemonIv, skillValue2, skillStrength2, t);

		return (
			<StyledSkillArticle
				className={skill2 !== null ? `skill2 skillc` : `skill1 skillc`}
			>
				{skill1}
				{skill2}
			</StyledSkillArticle>
		);
	},
);

function getSkill1Row(
	pokemonIv: PokemonIv,
	skillValue: number,
	skillStrength: number,
	t: typeof i18next.t,
): React.ReactElement {
	const mainSkill = pokemonIv.versatileSkill;
	const mainSkillValue: string = formatNice(skillValue, t);

	const skill1 = (
		<div>
			<MainSkillIcon
				mainSkill={mainSkill}
				firstIngredient={pokemonIv.pokemon.ing1.name}
			/>
			<span style={{ paddingLeft: "0.2rem" }}>{mainSkillValue}</span>
		</div>
	);

	// Show skill value only
	if (skillValue === skillStrength || skillStrength === 0) {
		return <div style={{ gridColumn: "1 / -1" }}>{skill1}</div>;
	}

	// Show skill strength too
	const strength1 = (
		<span className="strength">
			<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
			<span>{formatNice(skillStrength, t)}</span>
		</span>
	);

	return (
		<>
			{skill1}
			{strength1}
		</>
	);
}

function getSkill2Row(
	pokemonIv: PokemonIv,
	skillValue2: number,
	skillStrength2: number,
	t: typeof i18next.t,
): React.ReactNode {
	if (skillValue2 === 0 && skillStrength2 === 0) {
		return null;
	}

	// Set to `Versatile` for Mew
	const mainSkill2 = pokemonIv.pokemon.skill;
	const mainSkillValue2: string = formatNice(skillValue2, t);

	const skill2 = (
		<div>
			{mainSkill2 === "Ingredient Magnet S (Plus)" ? (
				<IngredientIcon name={pokemonIv.pokemon.ing1.name} />
			) : (
				<MainSkillIcon mainSkill={mainSkill2} second />
			)}
			<span style={{ paddingLeft: "0.2rem" }}>{mainSkillValue2}</span>
		</div>
	);

	// Show skill value only
	if (skillValue2 === skillStrength2 || skillStrength2 === 0) {
		return <div style={{ gridColumn: "1 / -1" }}>{skill2}</div>;
	}

	// Show skill strength too
	const strength2 = (
		<span className="strength">
			<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
			<span>{formatNice(skillStrength2, t)}</span>
		</span>
	);
	return (
		<>
			{skill2}
			{strength2}
		</>
	);
}

const StyledSkillArticle = styled("article")({
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	flexDirection: "column",
	fontWeight: 600,
	textAlign: "center",
	verticalAlign: "middle",
	fontSize: "1.1rem",
	margin: "auto 0",
	height: "3rem",
	"& span, & svg": {
		verticalAlign: "middle",
	},
	"&.skill2": {
		lineHeight: "1.6",
		fontSize: "0.8rem",
		"& > div > svg": {
			width: "16px",
			height: "16px",
		},
	},
	"&.skillc": {
		display: "grid",
		gridTemplateColumns: "auto auto",
		"&.skill1": {
			fontSize: "0.9rem",
			"& > div > svg": { width: "0.8em", height: "0.8em" },
		},
		"& > span.strength": {
			paddingLeft: "0.3rem",
			textAlign: "right",
			fontSize: "0.7em",
			"& > svg": { width: "0.6em", height: "0.6em" },
		},
	},
});

export default SkillArticle;
