import { getSkillSubValue, getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Dream Shard Magnet S (Aura Sphere).
 */
export class DreamShardMagnetAuraSphereSkill extends BaseSkill {
	skillValue2 = 0;

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;
		this.skillValue = Math.ceil(
			getSkillValue(skillName, skillLevel) * profile.bonus.dreamShard,
		);
		this.skillValue2 = Math.ceil(
			getSkillSubValue(skillName, skillLevel) * (1 + param.fieldBonus / 100),
		);
	}

	apply(member: TeamMember): void {
		member.progress.skillDreamShards += this.skillValue;
		member.progress.skillStrength += this.skillValue2;
	}
}
