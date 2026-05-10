import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Tasty Chance S.
 */
export class TastyChanceSkill extends BaseSkill {
	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		addTastyChance(member, this.skillValue, sim);
	}
}

/** Adds `diff` to the team's Extra Tasty rate accumulator. */
export function addTastyChance(
	member: TeamMember,
	diff: number,
	sim: TeamContext,
): void {
	member.progress.skillExtraTastyRate += diff;
	sim.teamProgress.extraTastyRate += diff;
}
