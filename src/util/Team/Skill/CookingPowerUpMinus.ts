import { getSkillSubValue } from "../../MainSkill";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { CookingPowerUpSkill } from "./CookingPowerUp";
import { addEnergizingCheer } from "./EnergizingCheer";

/**
 * Cooking Power-Up S (Minus).
 */
export class CookingPowerUpMinusSkill extends CookingPowerUpSkill {
	skillValue2 = 0;

	initialize(profile: MemberProfile, profiles: MemberProfile[]): void {
		super.initialize(profile, profiles);

		if (
			profiles.filter(
				(c) => c.skillName.includes("Plus") || c.skillName.includes("Minus"),
			).length >= 2
		) {
			this.skillValue2 = getSkillSubValue(
				profile.skillName,
				profile.skillLevel,
			);
		}
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		super.apply(member, tapSec, sim);

		if (this.skillValue2 !== 0) {
			addEnergizingCheer(tapSec, this.skillValue2, sim, this.rng);
		}
	}
}
