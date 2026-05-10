import { hyperCutterSuccess } from "../../MainSkill";
import type { TeamMember } from "../Types";
import { IngredientDrawSkill } from "./IngredientDraw";

/**
 * Ingredient Draw S (Hyper Cutter).
 */
export class IngredientDrawHyperCutterSkill extends IngredientDrawSkill {
	apply(member: TeamMember): void {
		const { progress } = member;
		const index = Math.floor(this.rng() * this.ingredients.length);
		const ing = this.ingredients[index];
		let amount = this.skillValue;
		if (this.rng() < hyperCutterSuccess) {
			amount *= 2;
		}
		const current = progress.ingCounts.get(ing) ?? 0;
		progress.ingCounts.set(ing, current + amount);
	}
}
