import { deserializeBoxItem } from "../Box/PokemonBox";
import {
	createInitialTeams,
	TEAM_COUNT,
	TEAM_MEMBER_COUNT,
	type Team,
} from "./Team";

/**
 * All the team information to be saved and restored.
 */
export type TeamsData = {
	/** All the teams. */
	teams: Team[];
	/** Index of the currently selected team in {@link teams}. */
	teamIndex: number;
};

/** localStorage key for the teams. */
const TEAMS_STORAGE_KEY = "PstIvTeams";

/**
 * Teams saved to localStorage.
 * Each member is saved as a serialized box item.
 */
type TeamsCache = {
	teamIndex: number;
	teams: {
		members: ({
			item: string;
			enabled: boolean;
			sneakySnacking: boolean;
		} | null)[];
	}[];
};

/**
 * Load the teams from localStorage.
 * @returns Loaded teams and the selected team index.
 */
export function loadTeams(): TeamsData {
	const teams = createInitialTeams();
	let teamIndex = 0;
	let json: unknown;
	try {
		json = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) ?? "null");
	} catch {
		return { teams, teamIndex };
	}
	if (typeof json !== "object" || json === null) {
		return { teams, teamIndex };
	}
	const cache = json as Partial<TeamsCache>;
	if (
		typeof cache.teamIndex === "number" &&
		Number.isInteger(cache.teamIndex) &&
		cache.teamIndex >= 0 &&
		cache.teamIndex < TEAM_COUNT
	) {
		teamIndex = cache.teamIndex;
	}
	if (!Array.isArray(cache.teams)) {
		return { teams, teamIndex };
	}
	for (let ti = 0; ti < TEAM_COUNT; ti++) {
		const members = cache.teams[ti]?.members;
		if (!Array.isArray(members)) {
			continue;
		}
		for (let i = 0; i < TEAM_MEMBER_COUNT; i++) {
			const m = members[i];
			if (typeof m !== "object" || m === null || typeof m.item !== "string") {
				continue;
			}
			const item = deserializeBoxItem(m.item);
			if (item === null) {
				continue;
			}
			teams[ti].members[i] = {
				item,
				enabled: typeof m.enabled === "boolean" ? m.enabled : true,
				sneakySnacking:
					typeof m.sneakySnacking === "boolean" ? m.sneakySnacking : false,
			};
		}
	}
	return { teams, teamIndex };
}

/**
 * Save all the teams to localStorage.
 * @param data All the current team information.
 */
export function saveTeams(data: TeamsData) {
	const cache: TeamsCache = {
		teamIndex: data.teamIndex,
		teams: data.teams.map((team) => ({
			members: team.members.map((m) =>
				m === undefined
					? null
					: {
							item: m.item.serialize(),
							enabled: m.enabled,
							sneakySnacking: m.sneakySnacking,
						},
			),
		})),
	};
	localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(cache));
}
