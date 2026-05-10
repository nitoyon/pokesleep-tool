import { getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Charge Strength S / M.
 *
 * Both skills just add a precomputed strength value with no extra effect,
 * so one class handles both of them (see SkillFactory).
 */
export class ChargeStrengthSSkill extends BaseSkill {
	skillValue = 0;

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;
		this.skillValue = Math.ceil(
			getSkillValue(skillName, skillLevel) * (1 + param.fieldBonus / 100),
		);
	}

	apply(member: TeamMember): void {
		member.progress.skillStrength += this.skillValue;
	}
}
