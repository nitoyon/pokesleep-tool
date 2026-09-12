import { IngredientNames } from "../../../data/pokemons";
import { getSkillValue } from "../../MainSkill";
import type {
	MemberProfile,
	MemberProgress,
	TeamContext,
	TeamMember,
} from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Ingredient Magnet S.
 */
export class IngredientMagnetSkill extends BaseSkill {
	skillValue = 0;
	protected bonus = 0;

	initialize(profile: MemberProfile, _profiles: MemberProfile[]): void {
		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;
		this.bonus = Math.max(
			profile.bonus.ingredientMagnet,
			profile.bonus.skillIngredient,
		);
		this.skillValue = Math.floor(
			getSkillValue(skillName, skillLevel) * this.bonus,
		);
	}

	apply(member: TeamMember, _tapSec: number, _sim: TeamContext): void {
		const { progress } = member;
		this.addIngredientMagnet(this.skillValue, progress);
	}

	private addIngredientMagnet(count: number, progress: MemberProgress): void {
		for (const ing of IngredientNames) {
			const current = progress.ingCounts.get(ing) ?? 0;
			progress.ingCounts.set(ing, current + count / IngredientNames.length);
		}
	}
}
