import { disguiseSuccessRate } from "../../MainSkill";
import type { TeamMember } from "../Types";
import { BerryBurstSkill } from "./BerryBurst";

/**
 * Berry Burst (Disguise).
 */
export class BerryBurstDisguiseSkill extends BerryBurstSkill {
	apply(member: TeamMember): void {
		const { progress } = member;
		progress.skillStrength += this.skillValue;

		// Great Success doubles the berries
		// - Skip if triggered by Skill Copy
		// - Skip if already successed
		if (
			member.profile.iv.pokemon.skill === "Berry Burst (Disguise)" &&
			!progress.disguiseGreatSuccess &&
			this.rng() < disguiseSuccessRate
		) {
			progress.disguiseGreatSuccess = true;
			progress.skillStrength += this.skillValue;
		}
	}
}
