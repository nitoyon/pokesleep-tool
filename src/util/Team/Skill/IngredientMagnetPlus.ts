import { getSkillSubValue } from "../../MainSkill";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { IngredientMagnetSkill } from "./IngredientMagnet";

/**
 * Ingredient Magnet S (Plus).
 */
export class IngredientMagnetPlusSkill extends IngredientMagnetSkill {
	skillValue2 = 0;

	initialize(profile: MemberProfile, profiles: MemberProfile[]): void {
		super.initialize(profile, profiles);

		if (
			profiles.filter(
				(c) => c.skillName.includes("Plus") || c.skillName.includes("Minus"),
			).length >= 2
		) {
			this.skillValue2 = Math.floor(
				getSkillSubValue(
					profile.skillName,
					profile.skillLevel,
					profile.iv.ingredient1.name,
				) * this.bonus,
			);
		}
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		super.apply(member, tapSec, sim);

		if (this.skillValue2 !== 0) {
			const { profile, progress } = member;
			// NOTE: Oil or Tomato when triggered by Skill Copy,
			const ing = profile.iv.ingredient1.name;
			const current = progress.ingCounts.get(ing) ?? 0;
			progress.ingCounts.set(ing, current + this.skillValue2);
		}
	}
}
