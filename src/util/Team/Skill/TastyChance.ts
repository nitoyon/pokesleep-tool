import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Tasty Chance S.
 */
export class TastyChanceSkill extends BaseSkill {
	apply(_member: TeamMember, _tapSec: number, sim: TeamContext): void {
		addTastyChance(this.skillValue, sim);
	}
}

/** Adds `diff` to the team's Extra Tasty rate accumulator. */
export function addTastyChance(diff: number, sim: TeamContext): void {
	sim.teamProgress.extraTastyRate += diff;
}
