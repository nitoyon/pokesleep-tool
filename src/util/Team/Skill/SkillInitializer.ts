import { getSkillSubValue, getSkillValue } from "../../MainSkill";
import type { BerryBurstTeam, StrengthParameter } from "../../PokemonStrength";
import { calculateBerryBurstStrength } from "../../PokemonStrength";
import type { MemberProfile } from "../Types";

/**
 * Pre-compute per-trigger skill strength values for each member profile.
 * Called once before the iteration loop.
 */
export function initializeSkillValue(
	profiles: MemberProfile[],
	param: StrengthParameter,
): void {
	for (let memberIdx = 0; memberIdx < profiles.length; memberIdx++) {
		const profile = profiles[memberIdx];
		profile.skillValue = 0;
		profile.skillValue2 = 0;

		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;

		switch (skillName) {
			case "Ingredient Magnet S":
			case "Ingredient Magnet S (Plus)":
			case "Ingredient Magnet S (Present)": {
				const bonus = Math.max(
					profile.bonus.ingredientMagnet,
					profile.bonus.skillIngredient,
				);
				profile.skillValue = Math.floor(
					getSkillValue(skillName, skillLevel) * bonus,
				);

				if (
					skillName === "Ingredient Magnet S (Plus)" &&
					profiles.filter(
						(c) =>
							c.skillName.includes("Plus") || c.skillName.includes("Minus"),
					).length >= 2
				) {
					profile.skillValue2 = Math.floor(
						getSkillSubValue(
							skillName,
							skillLevel,
							profile.iv.ingredient1.name,
						) * bonus,
					);
				}
				break;
			}

			case "Charge Strength S":
			case "Charge Strength S (Random)":
			case "Charge Strength S (Stockpile)":
			case "Charge Strength M":
			case "Charge Strength M (Bad Dreams)": {
				profile.skillValue =
					getSkillValue(skillName, skillLevel) * (1 + param.fieldBonus / 100);
				break;
			}

			case "Dream Shard Magnet S":
			case "Dream Shard Magnet S (Random)": {
				profile.skillValue =
					getSkillValue(skillName, skillLevel) * profile.bonus.dreamShard;
				break;
			}

			case "Extra Helpful S": {
				profile.skillValue = getSkillValue(skillName, skillLevel);
				break;
			}

			case "Helper Boost": {
				const species = calculateSpecies(profile, profiles);
				profile.skillValue = getSkillValue(skillName, skillLevel, species);
				break;
			}

			case "Berry Burst":
			case "Berry Burst (Disguise)":
			case "Energy for Everyone S (Lunar Blessing)":
			case "Berry Burst (Draco Meteor)": {
				initializeBerryBurstSkillValue(memberIdx, profile, profiles, param);
				break;
			}

			default:
				break;
		}
	}
}

function initializeBerryBurstSkillValue(
	memberIdx: number,
	profile: MemberProfile,
	profiles: MemberProfile[],
	param: StrengthParameter,
): void {
	const skillName = profile.skillName;
	const skillLevel = profile.skillLevel;
	const iv = profile.iv;
	const others = profiles.filter((_, i) => i !== memberIdx);
	const members = Array.from({ length: 4 }, (_, i) => {
		const other = others[i];
		return other
			? { type: other.iv.pokemon.type, level: other.iv.level }
			: { type: iv.pokemon.type, level: 0 };
	});
	const berryBurstTeam: BerryBurstTeam = {
		members,
		species: calculateSpecies(profile, profiles),
	};
	const skillValue = calculateBerryBurstStrength(
		iv,
		berryBurstTeam,
		param,
		profile.bonus.berryBurst,
		skillLevel,
	).total;
	if (skillName === "Energy for Everyone S (Lunar Blessing)") {
		profile.skillValue = getSkillValue(skillName, skillLevel);
		profile.skillValue2 = skillValue;
	} else {
		profile.skillValue = skillValue;
	}
}

export function calculateSpecies(
	profile: MemberProfile,
	profiles: MemberProfile[],
): number {
	const type = profile.iv.pokemon.type;
	return new Set(
		profiles.filter((c) => c.iv.pokemon.type === type).map((c) => c.iv.idForm),
	).size;
}
