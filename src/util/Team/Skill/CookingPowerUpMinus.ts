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

		const hasPlusOrMinus =
			profiles
				.filter((p) => p !== profile)
				.filter(
					(c) => c.skillName.includes("Plus") || c.skillName.includes("Minus"),
				).length >= 1;
		if (hasPlusOrMinus) {
			this.skillValue2 = getSkillSubValue(
				profile.skillName,
				profile.skillLevel,
			);
		}
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		super.apply(member, tapSec, sim);

		if (this.skillValue2 !== 0) {
			addEnergizingCheer(member, tapSec, this.skillValue2, sim, this.rng);
		}
	}
}
