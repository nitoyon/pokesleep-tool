import { getSkillValue, getStockpileStrength } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Charge Strength S (Stockpile).
 */
export class ChargeStrengthSStockpileSkill extends BaseSkill {
	skillValue = 0;

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		if (profile.iv.pokemon.skill === "Charge Strength S (Stockpile)") {
			// Stockpile: Use expected value
			const strength = getSkillValue(profile.skillName, profile.skillLevel);
			this.skillValue = Math.ceil(strength * (1 + param.fieldBonus / 100));
		} else {
			// Skill Copy or Metronome: Use spit value
			const strength = getStockpileStrength(profile.skillLevel, 0);
			this.skillValue = Math.ceil(strength * (1 + param.fieldBonus / 100));
		}
	}

	apply(member: TeamMember): void {
		member.progress.skillStrength += this.skillValue;
	}
}
