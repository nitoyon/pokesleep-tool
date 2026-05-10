import { addEnergyTo, getEnergyByState } from "../TeamEnergy";
import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Energizing Cheer S.
 */
export class EnergizingCheerSkill extends BaseSkill {
	apply(_member: TeamMember, tapSec: number, sim: TeamContext): void {
		addEnergizingCheer(tapSec, this.skillValue, sim, this.rng);
	}
}

/**
 * Pick a target member and add energy to them, biased towards the member
 * with the lowest current energy. Returns the chosen member's index.
 *
 * Exported because it's also used by other skills.
 */
export function addEnergizingCheer(
	tapSec: number,
	diff: number,
	sim: TeamContext,
	rng: () => number = Math.random,
): number {
	const energies = sim.members.map(({ progress }, index) => ({
		energy: getEnergyByState(progress, tapSec),
		progress: progress,
		index,
	}));

	const _rand = rng();
	const border = 0.65;
	if (_rand < border) {
		// 65% chance to target min energy member
		const minEnergy = Math.min(...energies.map((e) => e.energy));
		const candidates = energies.filter((e) => e.energy === minEnergy);
		const index =
			candidates[Math.floor((_rand / border) * candidates.length)].index;
		addEnergyTo(
			index,
			diff * sim.members[index].profile.energyRecoveryFactor,
			sim,
		);
		return index;
	} else {
		// 35% chance to select target from all members
		const index = Math.floor((_rand - border) * energies.length);
		addEnergyTo(
			index,
			diff * sim.members[index].profile.energyRecoveryFactor,
			sim,
		);
		return index;
	}
}
