import { beforeEach, describe, expect, test } from "vitest";
import { PokemonBoxItem } from "../Box/PokemonBox";
import PokemonIv from "../PokemonIv";
import { createInitialTeams, TEAM_COUNT } from "./Team";
import { loadTeams, saveTeams } from "./TeamStorage";

describe("TeamStorage", () => {
	beforeEach(() => {
		localStorage.removeItem("PstIvTeams");
	});

	test("returns empty teams when nothing is saved", () => {
		const { teams, teamIndex } = loadTeams();
		expect(teams).toEqual(createInitialTeams());
		expect(teamIndex).toBe(0);
	});

	test("saves the members and restores them", () => {
		const teams = createInitialTeams();
		const item = new PokemonBoxItem(
			new PokemonIv({ pokemonName: "Raichu" }),
			"nick",
		);
		teams[1].members[2] = { item, enabled: false, sneakySnacking: true };

		saveTeams({ teams, teamIndex: 1 });

		const loaded = loadTeams();
		expect(loaded.teamIndex).toBe(1);
		const slot = loaded.teams[1].members[2];
		expect(slot?.item.serialize()).toBe(item.serialize());
		expect(slot?.item.nickname).toBe("nick");
		expect(slot?.enabled).toBe(false);
		expect(slot?.sneakySnacking).toBe(true);
		expect(loaded.teams[1].members[0]).toBeUndefined();
		expect(loaded.teams[0].members.every((x) => x === undefined)).toBe(true);
	});

	test("defaults enabled and sneakySnacking when missing", () => {
		const item = new PokemonBoxItem(new PokemonIv({ pokemonName: "Raichu" }));
		localStorage.setItem(
			"PstIvTeams",
			JSON.stringify({
				teamIndex: 0,
				teams: [{ members: [{ item: item.serialize() }] }],
			}),
		);
		const slot = loadTeams().teams[0].members[0];
		expect(slot?.enabled).toBe(true);
		expect(slot?.sneakySnacking).toBe(false);
	});

	test("ignores invalid teamIndex", () => {
		for (const teamIndex of [-1, TEAM_COUNT, 1.5, "1"]) {
			localStorage.setItem("PstIvTeams", JSON.stringify({ teamIndex }));
			expect(loadTeams().teamIndex).toBe(0);
		}
	});

	test("ignores invalid data", () => {
		localStorage.setItem(
			"PstIvTeams",
			JSON.stringify({
				teamIndex: 99,
				teams: [{ members: [{ item: 1 }, "x", { item: "invalid!" }] }, null],
			}),
		);
		const { teams, teamIndex } = loadTeams();
		expect(teamIndex).toBe(0);
		expect(teams).toEqual(createInitialTeams());

		localStorage.setItem("PstIvTeams", "{broken");
		expect(loadTeams().teams).toEqual(createInitialTeams());
	});
});
