import { getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { calculateSpecies } from "./SkillInitializer";

/**
 * Helper Boost.
 *
 * NOTE: initialize() computes skillValue here, but this class has no
 * apply() override, so the computed value is
 * currently unused. This is a known-suspicious asymmetry preserved as-is
 * (bug-for-bug) per the approved plan, not fixed here.
 */
export class HelperBoostSkill extends BaseSkill {
	count = 0;

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		_param: StrengthParameter,
	): void {
		const species = calculateSpecies(profile, profiles);
		this.count = getSkillValue(profile.skillName, profile.skillLevel, species);
	}

	apply(_member: TeamMember, _tapSec: number, sim: TeamContext): void {
		for (const member of sim.members) {
			member.progress.pendingExtraHelp += this.count;
		}
	}
}
