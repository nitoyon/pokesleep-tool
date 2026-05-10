import type { IngredientName } from "../../../data/pokemons";
import { getIngredientDrawIngredients, getSkillValue } from "../../MainSkill";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Ingredient Draw S.
 */
export class IngredientDrawSkill extends BaseSkill {
	skillValue = 0;
	ingredients: IngredientName[] = [];
	protected bonus = 0;

	initialize(profile: MemberProfile): void {
		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;
		this.bonus = Math.max(
			profile.bonus.ingredientDraw,
			profile.bonus.skillIngredient,
		);
		this.skillValue = Math.floor(
			getSkillValue(skillName, skillLevel) * this.bonus,
		);
		this.ingredients = getIngredientDrawIngredients(profile.iv.pokemon);
	}

	apply(member: TeamMember): void {
		const { progress } = member;
		const index = Math.floor(this.rng() * this.ingredients.length);
		const ing = this.ingredients[index];
		const current = progress.ingCounts.get(ing) ?? 0;
		progress.ingCounts.set(ing, current + this.skillValue);
	}
}
