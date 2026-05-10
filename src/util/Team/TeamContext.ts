import type { StrengthParameter } from "../PokemonStrength";
import { createTeamMembers } from "./MemberProgress";
import type { MemberProfile, TeamContext } from "./Types";

/**
 * Build a fresh {@link TeamContext} for a single simulation iteration.
 */
export function createTeamContext(
	profiles: MemberProfile[],
	param: StrengthParameter,
): TeamContext {
	const dayLengthSec = 1440 * 60;
	const sleepMinutes = (param.sleepScore * 510) / 100;
	const sleepTimeSec = (1440 - sleepMinutes) * 60;

	return {
		members: createTeamMembers(profiles),
		teamProfile: {
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
