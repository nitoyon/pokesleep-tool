import type { StrengthParameter } from "../PokemonStrength";
import { createMemberProgress, createTeamMembers } from "./MemberProgress";
import type { MemberProfile, TeamContext } from "./Types";

/**
 * Build a fresh {@link TeamContext} for a single simulation iteration.
 */
export function createTeamContext(
	isWhistle: boolean,
	profiles: MemberProfile[],
	param: StrengthParameter,
): TeamContext {
	const dayLengthSec = 1440 * 60;
	const sleepMinutes = (param.sleepScore * 510) / 100;
	const sleepTimeSec = (1440 - sleepMinutes) * 60;

	return {
		members: createTeamMembers(profiles),
		teamProfile: {
			isWhistle,
			sleepTimeSec,
			dayLengthSec,
			param,
		},
		teamProgress: {
			potExtended: 0,
			extraTastyRate: 0,
		},
	};
}

/**
 * Reset an existing {@link TeamContext} in place for a new simulation
 * iteration. Reuses the same context/members/progress objects rather than
 * rebuilding them, since {@link createTeamContext} is called once per
 * Monte Carlo run and reallocating it per iteration is costly.
 */
export function resetTeamContext(sim: TeamContext): void {
	const periodSec = Math.abs(sim.teamProfile.param.period) * 3600;
	for (const member of sim.members) {
		// The previous iteration's nextHelpSec lands past periodSec
		const prevNextHelpSec = member.progress.nextHelpSec;
		member.progress = {
			...createMemberProgress(),
			energy: member.progress.energy,
			helpsSinceSkill: member.progress.helpsSinceSkill,
			nextHelpSec: prevNextHelpSec === -1 ? -1 : prevNextHelpSec - periodSec,
		};
	}
	sim.teamProgress.potExtended = 0;
	sim.teamProgress.extraTastyRate = 0;
}
