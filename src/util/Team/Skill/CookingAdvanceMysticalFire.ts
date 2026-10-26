import { getSkillSubValue } from "../../MainSkill";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { CookingPowerUpSkill } from "./CookingPowerUp";
import { addTastyChance } from "./TastyChance";

/**
 * Cooking Assist S (Bulk Up).
 *
 * Grants ingredients like Ingredient Magnet S, and additionally raises the
 * team's Extra Tasty rate.
 */
export class CookingAdvanceMysticalFire extends CookingPowerUpSkill {
	skillValue2 = 0;

	initialize(profile: MemberProfile, profiles: MemberProfile[]): void {
		super.initialize(profile, profiles);
		this.skillValue2 = getSkillSubValue(profile.skillName, profile.skillLevel);
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		super.apply(member, tapSec, sim);
		addTastyChance(member, this.skillValue2, sim);
	}
}
