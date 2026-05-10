import { getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Extra Helpful S.
 */
export class ExtraHelpfulSkill extends BaseSkill {
	count = 0;

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		_param: StrengthParameter,
	): void {
		this.count = getSkillValue(profile.skillName, profile.skillLevel);
	}

	apply(_member: TeamMember, _tapSec: number, sim: TeamContext): void {
		const index = Math.floor(this.rng() * sim.members.length);
		sim.members[index].progress.pendingExtraHelp += this.count;
	}
}
