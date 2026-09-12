import { getSkillValue } from "../../MainSkill";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Cooking Power-Up S.
 */
export class CookingPowerUpSkill extends BaseSkill {
	initialize(profile: MemberProfile, _profiles: MemberProfile[]): void {
		this.skillValue = getSkillValue(profile.skillName, profile.skillLevel);
	}

	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		member.progress.skillPotExtended += this.skillValue;
		sim.teamProgress.potExtended += this.skillValue;
	}
}
