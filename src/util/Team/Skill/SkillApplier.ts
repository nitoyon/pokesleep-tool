import { IngredientNames } from "../../../data/pokemons";
import { addPendingEnergy, getEnergyByState } from "../TeamEnergy";
import type {
	IterationState,
	MemberProfile,
	MemberProgress,
	TeamMember,
} from "../Types";

/**
 * Apply skill effects for a triggered skill.
 * Strength effects are deferred to applySkillStrengths after the loop.
 *
 * Each member's energy is first advanced to tapSec so that the skill effect
 * is applied to the correct energy value at the moment of activation.
 */
export function applySkillEffect(
	member: TeamMember,
	tapSec: number,
	sim: IterationState,
): void {
	const { profile, progress } = member;
	const skillName = profile.skillName;

	switch (skillName) {
		case "Ingredient Magnet S":
		case "Ingredient Magnet S (Plus)":
		case "Ingredient Magnet S (Present)":
			addIngredientMagnet(profile.skillValue, progress);
			if (profile.skillValue2 !== 0) {
				addPlusIngredient(profile.skillValue2, member);
			}
			return;

		case "Charge Energy S":
			addEnergyTo(member.profile.index, profile.skillValue, sim);
			return;

		case "Charge Energy S (Moonlight)":
			addEnergyTo(member.profile.index, profile.skillValue, sim);
			if (Math.random() < 0.5) {
				addEnergizingCheer(tapSec, profile.skillValue, sim);
			}
			return;

		case "Charge Strength S":
		case "Charge Strength S (Random)":
		case "Charge Strength S (Stockpile)":
		case "Charge Strength M":
		case "Charge Strength M (Bad Dreams)":
			progress.skillStrength += profile.skillValue;
			return;

		case "Energy for Everyone S":
			addEnergyToAll(profile.skillValue, sim);
			return;

		case "Energizing Cheer S":
			addEnergizingCheer(tapSec, profile.skillValue, sim);
			return;

		default:
			// Strength-based skills are handled in applySkillStrengths after the loop
			break;
	}
}

function addIngredientMagnet(count: number, progress: MemberProgress): void {
	for (const ing of IngredientNames) {
		const current = progress.ingCounts.get(ing) ?? 0;
		progress.ingCounts.set(ing, current + count / IngredientNames.length);
	}
}

function addPlusIngredient(count: number, member: TeamMember): void {
	const { profile, progress } = member;
	const ing = profile.iv.ingredient1.name;
	const current = progress.ingCounts.get(ing) ?? 0;
	progress.ingCounts.set(ing, current + count);
}

function addEnergyToAll(diff: number, sim: IterationState): void {
	for (let i = 0; i < sim.members.length; i++) {
		addEnergyTo(i, diff * sim.members[i].profile.energyRecoveryFactor, sim);
	}
}

function addEnergyTo(i: number, diff: number, sim: IterationState): void {
	addPendingEnergy(sim, i, diff * sim.members[i].profile.energyRecoveryFactor);
}

function addEnergizingCheer(
	tapSec: number,
	diff: number,
	sim: IterationState,
	rand?: number,
): void {
	const energies = sim.members.map(({ progress }, index) => ({
		energy: getEnergyByState(progress, tapSec),
		progress: progress,
		index,
	}));

	const _rand = rand ?? Math.random();
	if (_rand < 0.5) {
		// 50% chance to target min energy member
		const minEnergy = Math.min(...energies.map((e) => e.energy));
		const candidates = energies.filter((e) => e.energy === minEnergy);
		const index = candidates[Math.floor(_rand * 2 * candidates.length)].index;
		addEnergyTo(
			index,
			diff * sim.members[index].profile.energyRecoveryFactor,
			sim,
		);
	} else {
		// 50% chance to select target from all members
		const index = Math.floor((_rand - 0.5) * energies.length);
		addEnergyTo(
			index,
			diff * sim.members[index].profile.energyRecoveryFactor,
			sim,
		);
	}
}

/**
 * Apply pre-computed skill strength values to progresses after each iteration,
 * using the final skillCount per member.
 */
export function applySkillValue(
	profiles: MemberProfile[],
	progresses: MemberProgress[],
): void {
	for (let i = 0; i < profiles.length; i++) {
		const profile = profiles[i];
		const skillCount = progresses[i].skillCount;
		if (skillCount === 0) continue;

		if (profile.skillValue !== 0) {
			progresses[i].skillStrength += profile.skillValue * skillCount;
		}
		if (profile.skillValue2 !== 0) {
			for (let j = 0; j < profiles.length; j++) {
				progresses[j].skillStrength += profile.skillValue2 * skillCount;
			}
		}
	}
}
