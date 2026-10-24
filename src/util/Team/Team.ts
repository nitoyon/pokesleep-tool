import type { PokemonBoxItem } from "../Box/PokemonBox";

/**
 * A single team slot: the box item assigned to it plus whether it is
 * currently included in the team strength calculation.
 */
export type TeamMemberSlot = {
	item: PokemonBoxItem;
	enabled: boolean;
	/** Whether this member is set to sneaky snacking. */
	sneakySnacking: boolean;
};

/**
 * A team consisting of 5 member slots.
 */
export type Team = {
	members: (TeamMemberSlot | undefined)[];
};

/** Number of teams the user can switch between. */
export const TEAM_COUNT = 4;

/** Number of member slots in a team. */
export const TEAM_MEMBER_COUNT = 5;

/**
 * Create the initial list of empty teams.
 * @returns Array of {@link TEAM_COUNT} empty teams.
 */
export function createInitialTeams(): Team[] {
	return Array.from({ length: TEAM_COUNT }, () => ({
		members: Array.from({ length: TEAM_MEMBER_COUNT }, () => undefined),
	}));
}
