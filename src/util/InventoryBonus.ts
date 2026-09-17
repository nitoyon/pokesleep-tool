import type { BonusEffectsWithReason } from "./PokemonStrength";

/** Bonus that affect inventory consumption */
export interface InventoryBonus {
	/** Berry count bonus from events (0 or 1) */
	berry: 0 | 1;
	/** Ingredient count bonus from events (0 or 1) */
	ingredient: 0 | 1;
	/** Carry limit bonus (add) */
	carryLimitAdd: number;
	/** Carry limit bonus (multiply) */
	carryLimitMul: 1 | 1.5;
	/**
	 * Whether expert mode ingredient bonus applies.
	 * True if following condition are all met.
	 * - Expert mode
	 * - ExpertEffects is `ing`
	 * - Favorite berry
	 */
	expertIng: boolean;
}

/**
 * Build an InventoryBonus from a BonusEffectsWithReason
 * @param bonus Bonus effects (event + expert mode, with reason).
 * @returns Inventory bonus derived from the given bonus effects.
 */
export function bonusEffectToInventoryBonus(
	bonus: BonusEffectsWithReason,
): InventoryBonus {
	return {
		berry: bonus.berry,
		ingredient:
			bonus.ingredientReason === "ex" ? 0 : (bonus.ingredient as 0 | 1),
		carryLimitAdd: bonus.carryLimitAdd,
		carryLimitMul: bonus.carryLimitMul,
		expertIng: bonus.ingredientReason === "ex",
	};
}
