import {
	getSkillSubValue,
	superLuckIngRate,
	superLuckShard5Rate,
	superLuckShardRate,
} from "../../MainSkill";
import type { MemberProfile, TeamMember } from "../Types";
import { IngredientDrawSkill } from "./IngredientDraw";

/**
 * Ingredient Draw S (Super Luck).
 */
export class IngredientDrawSuperLuckSkill extends IngredientDrawSkill {
	protected baseShards = 0;
	protected shardBonus = 0;

	initialize(profile: MemberProfile): void {
		super.initialize(profile);
		this.baseShards = getSkillSubValue(profile.skillName, profile.skillLevel);
		this.shardBonus = profile.bonus.ingredientDraw * profile.bonus.dreamShard;
	}

	apply(member: TeamMember): void {
		const { progress } = member;

		const rand = this.rng();
		if (rand < superLuckShardRate) {
			progress.skillDreamShards += this.baseShards * this.shardBonus;
			return;
		}

		if (rand < superLuckShardRate + superLuckShard5Rate) {
			progress.skillDreamShards += this.baseShards * 5 * this.shardBonus;
			return;
		}

		const rand2 =
			(rand - (superLuckShardRate + superLuckShard5Rate)) / superLuckIngRate;
		const index = Math.floor(rand2 * this.ingredients.length);
		const ing = this.ingredients[index];
		const current = progress.ingCounts.get(ing) ?? 0;
		progress.ingCounts.set(ing, current + this.skillValue);
	}
}
