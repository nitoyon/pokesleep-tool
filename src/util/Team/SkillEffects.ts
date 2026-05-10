import { IngredientNames } from "../../data/pokemons";
import { getSkillSubValue, getSkillValue } from "../MainSkill";
import type { BerryBurstTeam, StrengthParameter } from "../PokemonStrength";
import { calculateBerryBurstStrength } from "../PokemonStrength";
import { addPendingEnergy, getEnergyByState } from "./TeamEnergy";
import type {
	IterationState,
	MemberContext,
	MemberSimulationState,
} from "./Types";

/**
 * Pre-compute per-trigger skill strength values for each member context.
 * Called once before the iteration loop.
 */
export function initializeSkillValue(
	contexts: MemberContext[],
	param: StrengthParameter,
): void {
	for (let memberIdx = 0; memberIdx < contexts.length; memberIdx++) {
		const ctx = contexts[memberIdx];
		ctx.skillValue = 0;
		ctx.skillValue2 = 0;

		const skillName = ctx.skillName;
		const skillLevel = ctx.skillLevel;

		switch (skillName) {
			case "Ingredient Magnet S":
			case "Ingredient Magnet S (Plus)":
			case "Ingredient Magnet S (Present)": {
				const bonus = Math.max(
					ctx.bonus.ingredientMagnet,
					ctx.bonus.skillIngredient,
				);
				ctx.skillValue = Math.floor(
					getSkillValue(skillName, skillLevel) * bonus,
				);

				if (
					skillName === "Ingredient Magnet S (Plus)" &&
					contexts.filter(
						(c) =>
							c.skillName.includes("Plus") || c.skillName.includes("Minus"),
					).length >= 2
				) {
					ctx.skillValue2 = Math.floor(
						getSkillSubValue(skillName, skillLevel, ctx.iv.ingredient1.name) *
							bonus,
					);
				}
				break;
			}

			case "Charge Strength S":
			case "Charge Strength S (Random)":
			case "Charge Strength S (Stockpile)":
			case "Charge Strength M":
			case "Charge Strength M (Bad Dreams)": {
				ctx.skillValue =
					getSkillValue(skillName, skillLevel) * (1 + param.fieldBonus / 100);
				break;
			}

			case "Dream Shard Magnet S":
			case "Dream Shard Magnet S (Random)": {
				ctx.skillValue =
					getSkillValue(skillName, skillLevel) * ctx.bonus.dreamShard;
				break;
			}

			case "Extra Helpful S": {
				ctx.skillValue = getSkillValue(skillName, skillLevel);
				break;
			}

			case "Helper Boost": {
				const species = calculateSpecies(ctx, contexts);
				ctx.skillValue = getSkillValue(skillName, skillLevel, species);
				break;
			}

			case "Berry Burst":
			case "Berry Burst (Disguise)":
			case "Energy for Everyone S (Lunar Blessing)":
			case "Berry Burst (Draco Meteor)": {
				initializeBerryBurstSkillValue(memberIdx, ctx, contexts, param);
				break;
			}

			default:
				break;
		}
	}
}

function initializeBerryBurstSkillValue(
	memberIdx: number,
	ctx: MemberContext,
	contexts: MemberContext[],
	param: StrengthParameter,
): void {
	const skillName = ctx.skillName;
	const skillLevel = ctx.skillLevel;
	const iv = ctx.iv;
	const others = contexts.filter((_, i) => i !== memberIdx);
	const members = Array.from({ length: 4 }, (_, i) => {
		const other = others[i];
		return other
			? { type: other.iv.pokemon.type, level: other.iv.level }
			: { type: iv.pokemon.type, level: 0 };
	});
	const berryBurstTeam: BerryBurstTeam = {
		members,
		species: calculateSpecies(ctx, contexts),
	};
	const skillValue = calculateBerryBurstStrength(
		iv,
		berryBurstTeam,
		param,
		ctx.bonus.berryBurst,
		skillLevel,
	).total;
	if (skillName === "Energy for Everyone S (Lunar Blessing)") {
		ctx.skillValue = getSkillValue(skillName, skillLevel);
		ctx.skillValue2 = skillValue;
	} else {
		ctx.skillValue = skillValue;
	}
}

export function calculateSpecies(
	ctx: MemberContext,
	contexts: MemberContext[],
): number {
	const type = ctx.iv.pokemon.type;
	return new Set(
		contexts.filter((c) => c.iv.pokemon.type === type).map((c) => c.iv.idForm),
	).size;
}

/**
 * Apply skill effects for a triggered skill.
 * Strength effects are deferred to applySkillStrengths after the loop.
 *
 * Each member's energy is first advanced to tapSec so that the skill effect
 * is applied to the correct energy value at the moment of activation.
 */
export function applySkillEffect(
	memberIdx: number,
	tapSec: number,
	sim: IterationState,
): void {
	const ctx = sim.contexts[memberIdx];
	const state = sim.states[memberIdx];
	const skillName = ctx.skillName;

	switch (skillName) {
		case "Ingredient Magnet S":
		case "Ingredient Magnet S (Plus)":
		case "Ingredient Magnet S (Present)":
			addIngredientMagnet(ctx.skillValue, sim.states[memberIdx]);
			if (ctx.skillValue2 !== 0) {
				addPlusIngredient(ctx.skillValue2, memberIdx, sim);
			}
			return;

		case "Charge Energy S":
			addEnergyTo(memberIdx, ctx.skillValue, sim);
			return;

		case "Charge Energy S (Moonlight)":
			addEnergyTo(memberIdx, ctx.skillValue, sim);
			if (Math.random() < 0.5) {
				addEnergizingCheer(tapSec, ctx.skillValue, sim);
			}
			return;

		case "Charge Strength S":
		case "Charge Strength S (Random)":
		case "Charge Strength S (Stockpile)":
		case "Charge Strength M":
		case "Charge Strength M (Bad Dreams)":
			state.skillStrength += ctx.skillValue;
			return;

		case "Energy for Everyone S":
			addEnergyToAll(ctx.skillValue, sim);
			return;

		case "Energizing Cheer S":
			addEnergizingCheer(tapSec, ctx.skillValue, sim);
			return;

		default:
			// Strength-based skills are handled in applySkillStrengths after the loop
			break;
	}
}

function addIngredientMagnet(
	count: number,
	state: MemberSimulationState,
): void {
	for (const ing of IngredientNames) {
		const current = state.ingCounts.get(ing) ?? 0;
		state.ingCounts.set(ing, current + count / IngredientNames.length);
	}
}

function addPlusIngredient(
	count: number,
	memberIdx: number,
	sim: IterationState,
): void {
	const ctx = sim.contexts[memberIdx];
	const ing = ctx.iv.ingredient1.name;
	const current = sim.states[memberIdx].ingCounts.get(ing) ?? 0;
	sim.states[memberIdx].ingCounts.set(ing, current + count);
}

function addEnergyToAll(diff: number, sim: IterationState): void {
	for (let i = 0; i < sim.contexts.length; i++) {
		addEnergyTo(i, diff * sim.contexts[i].energyRecoveryFactor, sim);
	}
}

function addEnergyTo(i: number, diff: number, sim: IterationState): void {
	addPendingEnergy(sim, i, diff * sim.contexts[i].energyRecoveryFactor);
}

function addEnergizingCheer(
	tapSec: number,
	diff: number,
	sim: IterationState,
	rand?: number,
): void {
	const energies = sim.states.map((state, index) => ({
		energy: getEnergyByState(state, tapSec),
		state: state,
		index,
	}));

	const _rand = rand ?? Math.random();
	if (_rand < 0.5) {
		// 50% chance to target min energy member
		const minEnergy = Math.min(...energies.map((e) => e.energy));
		const candidates = energies.filter((e) => e.energy === minEnergy);
		const index = candidates[Math.floor(_rand * 2 * candidates.length)].index;
		addEnergyTo(index, diff * sim.contexts[index].energyRecoveryFactor, sim);
	} else {
		// 50% chance to select target from all members
		const index = Math.floor((_rand - 0.5) * energies.length);
		addEnergyTo(index, diff * sim.contexts[index].energyRecoveryFactor, sim);
	}
}

/**
 * Apply pre-computed skill strength values to states after each iteration,
 * using the final skillCount per member.
 */
export function applySkillValue(
	contexts: MemberContext[],
	states: MemberSimulationState[],
): void {
	for (let i = 0; i < contexts.length; i++) {
		const ctx = contexts[i];
		const skillCount = states[i].skillCount;
		if (skillCount === 0) continue;

		if (ctx.skillValue !== 0) {
			states[i].skillStrength += ctx.skillValue * skillCount;
		}
		if (ctx.skillValue2 !== 0) {
			for (let j = 0; j < contexts.length; j++) {
				states[j].skillStrength += ctx.skillValue2 * skillCount;
			}
		}
	}
}
