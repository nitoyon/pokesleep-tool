import { getSkillValue } from "../../MainSkill";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Dream Shard Magnet S.
 *
 * NOTE: initialize() computes skillValue, but apply() re-rolls the value via
 * calcDreamShardMagnetRandom instead of using it, so the computed value is
 * currently unused. This is a known-suspicious asymmetry preserved as-is
 * (bug-for-bug) from the original combined implementation, not fixed here.
 */
export class DreamShardMagnetSkill extends BaseSkill {
	skillValue = 0;

	initialize(profile: MemberProfile): void {
		this.skillValue = Math.ceil(
			getSkillValue(profile.skillName, profile.skillLevel) *
				profile.bonus.dreamShard,
		);
	}

	apply(member: TeamMember): void {
		member.progress.skillDreamShards += this.skillValue;
	}
}
