import { getSkillSubValue, presentCandyRate } from "../../MainSkill";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { IngredientMagnetSkill } from "./IngredientMagnet";

/**
 * Ingredient Magnet S (Present).
 */
export class IngredientMagnetPresentSkill extends IngredientMagnetSkill {
	private candyCount = 0;

	initialize(profile: MemberProfile, profiles: MemberProfile[]): void {
		super.initialize(profile, profiles);

		const baseCount = getSkillSubValue(profile.skillName, profile.skillLevel);
		this.candyCount = Math.floor(baseCount * this.bonus);
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		super.apply(member, tapSec, sim);
		if (this.rng() < presentCandyRate) {
			member.progress.skillCandy += this.candyCount;
		}
	}
}
