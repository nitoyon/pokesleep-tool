import { beforeEach, describe, expect, test, vi } from "vitest";
import PokemonIv from "../PokemonIv";
import { LocalBoxRepository } from "./LocalBoxRepository";
import PokemonBox, { PokemonBoxItem } from "./PokemonBox";

describe("LocalBoxRepository", () => {
	let localStorageMock: { [key: string]: string } = {};

	beforeEach(() => {
		localStorageMock = {};
		global.localStorage = {
			getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				localStorageMock[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete localStorageMock[key];
			}),
			clear: vi.fn(() => {
				localStorageMock = {};
			}),
			length: 0,
			key: vi.fn(() => null),
		};
	});

	test("load returns empty array when nothing is saved", async () => {
		expect(await new LocalBoxRepository().load()).toEqual([]);
	});

	test("load returns empty array for non-array data", async () => {
		localStorage.setItem("PstPokeBox", "{}");
		expect(await new LocalBoxRepository().load()).toEqual([]);
	});

	test("load skips invalid items", async () => {
		const iv = new PokemonIv({ pokemonName: "Pikachu" });
		localStorage.setItem(
			"PstPokeBox",
			JSON.stringify([1, "invalid", `${iv.serialize()}@nick`]),
		);
		const items = await new LocalBoxRepository().load();
		expect(items.length).toBe(1);
		expect(items[0].iv.pokemonName).toBe("Pikachu");
		expect(items[0].nickname).toBe("nick");
	});

	test("load limits the number of items", async () => {
		const data = new PokemonIv({ pokemonName: "Pikachu" }).serialize();
		localStorage.setItem(
			"PstPokeBox",
			JSON.stringify(Array(PokemonBox.maxEntryCount + 1).fill(data)),
		);
		const items = await new LocalBoxRepository().load();
		expect(items.length).toBe(PokemonBox.maxEntryCount);
	});

	test("apply saves the snapshot and load restores it", async () => {
		const repo = new LocalBoxRepository();
		const items = [
			new PokemonBoxItem(new PokemonIv({ pokemonName: "Pikachu" }), "nick"),
			new PokemonBoxItem(new PokemonIv({ pokemonName: "Raichu" })),
		];
		await repo.apply([], items);

		const loaded = await repo.load();
		expect(loaded.map((x) => x.serialize())).toEqual(
			items.map((x) => x.serialize()),
		);
	});

	test("apply rejects when localStorage throws", async () => {
		localStorage.setItem = vi.fn(() => {
			throw new Error("quota exceeded");
		});
		await expect(new LocalBoxRepository().apply([], [])).rejects.toThrow(
			"quota exceeded",
		);
	});
});
