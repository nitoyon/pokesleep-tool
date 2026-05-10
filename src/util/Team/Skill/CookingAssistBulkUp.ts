import { getSkillSubValue } from "../../MainSkill";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { IngredientMagnetSkill } from "./IngredientMagnet";
import { addTastyChance } from "./TastyChance";

/**
 * Cooking Assist S (Bulk Up).
 *
 * Grants ingredients like Ingredient Magnet S, and additionally raises the
 * team's Extra Tasty rate.
 */
export class CookingAssistBulkUpSkill extends IngredientMagnetSkill {
	skillValue2 = 0;

	initialize(profile: MemberProfile, profiles: MemberProfile[]): void {
		super.initialize(profile, profiles);
		this.skillValue2 = getSkillSubValue(profile.skillName, profile.skillLevel);
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		super.apply(member, tapSec, sim);
		addTastyChance(this.skillValue2, sim);
	}
}
