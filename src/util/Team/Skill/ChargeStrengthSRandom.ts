import { getSkillRandomRange } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Charge Strength S (Random).
 */
export class ChargeStrengthSRandomSkill extends BaseSkill {
	min = 0;
	max = 0;
	areaBonus = 1;

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		const [min, max] = getSkillRandomRange(
			profile.skillName,
			profile.skillLevel,
		);
		this.min = min;
		this.max = max;
		this.areaBonus = 1 + param.fieldBonus / 100;
	}

	apply(member: TeamMember): void {
		const rand = Math.floor(this.rng() * 151);
		const value = this.min + ((this.max - this.min) * rand) / 150;
		const strength = Math.ceil(value * this.areaBonus);
		member.progress.skillStrength += strength;
	}
}
