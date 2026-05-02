import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
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

		const mainSkill = pokemonIv.versatileSkill;
		const mainSkillValue: string = formatNice(skillValue, t);
		const mainSkillValue2: string =
			skillValue2 === 0 ? "" : formatNice(skillValue2, t);

		const skill1 = (
			<div>
				<MainSkillIcon
					mainSkill={mainSkill}
					firstIngredient={pokemonIv.pokemon.ing1.name}
				/>
				<span style={{ paddingLeft: "0.2rem" }}>{mainSkillValue}</span>
			</div>
		);

		let strength1: React.ReactNode = null;
		if (skillValue !== skillStrength && skillStrength > 0) {
			strength1 = (
				<span className="strength">
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span>{formatNice(skillStrength, t)}</span>
				</span>
			);
		}

		let strength2: React.ReactNode = null;
		if (skillValue2 !== skillStrength2 && skillStrength2 > 0) {
			strength2 = (
				<span className="strength">
					<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
					<span>{formatNice(skillStrength2, t)}</span>
				</span>
			);
		}

		let skill2 = null;
		if (mainSkillValue2 !== "") {
			// Set to `Versatile` for Mew
			const mainSkill2 = pokemonIv.pokemon.skill;

			skill2 = (
				<div>
					{mainSkill === "Ingredient Magnet S (Plus)" ? (
						<IngredientIcon name={pokemonIv.pokemon.ing1.name} />
					) : (
						<MainSkillIcon mainSkill={mainSkill2} second />
					)}
					<span style={{ paddingLeft: "0.2rem" }}>{mainSkillValue2}</span>
				</div>
			);
		}

		return (
			<StyledSkillArticle
				className={mainSkillValue2 !== "" ? `skill2 skillc` : `skill1 skillc`}
			>
				{strength1 === null ? (
					<div style={{ gridColumn: "1 / -1" }}>{skill1}</div>
				) : (
					<>
						{skill1}
						{strength1}
					</>
				)}
				{strength2 === null ? (
					<div style={{ gridColumn: "1 / -1" }}>{skill2}</div>
				) : (
					<>
						{skill2}
						{strength2}
					</>
				)}
			</StyledSkillArticle>
		);
	},
);

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
