import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { addEnergizingCheer } from "./EnergizingCheer";

/**
 * Energizing Cheer S (Nuzzle).
 */
export class EnergizingCheerNuzzleSkill extends BaseSkill {
	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		const { profile } = member;
		const index = addEnergizingCheer(tapSec, this.skillValue, sim, this.rng);
		addSkillActivationBonus(index, profile.iv.skillLevel, sim, this.rng);
	}
}

function addSkillActivationBonus(
	index: number,
	skillLevel: number,
	sim: TeamContext,
	rng: () => number,
): void {
	const target = sim.members[index].profile.iv;
	const count = skillLevel + 1;
	const p = 1 - (1 - target.skillRate) ** count;
	const rand = rng();
	if (rand > p) {
		return;
	}

	// add activation bonus
	sim.members[index].progress.hasMainSkillActivationBonus = true;
}
