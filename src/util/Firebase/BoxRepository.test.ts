import { describe, expect, test } from "vitest";
import { diffBoxItems } from "../Box/BoxRepository";
import PokemonBox, { type PokemonBoxItem } from "../Box/PokemonBox";
import PokemonIv from "../PokemonIv";
import { type BoxApi, FakeBoxApi } from "./BoxApi";
import { FirebaseBoxRepository } from "./BoxRepository";

function createApi(): BoxApi {
	return new FakeBoxApi();
}

/** Load items from the repository */
async function load(repo: FirebaseBoxRepository): Promise<PokemonBoxItem[]> {
	return (await repo.load()).items;
}

/** Apply box changes to the repository */
async function save(
	repo: FirebaseBoxRepository,
	prev: PokemonBox,
	next: PokemonBox,
): Promise<void> {
	await repo.apply(diffBoxItems(prev.items, next.items), next.items);
}

describe("FirebaseBoxRepository", () => {
	test("saves added, updated and removed items", async () => {
		const api = createApi();
		const repo = new FirebaseBoxRepository(api);
		const box0 = new PokemonBox(await load(repo));
		expect(box0.items).toEqual([]);

		const box1 = new PokemonBox(box0.items);
		const id1 = box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		const id2 = box1.add(new PokemonIv({ pokemonName: "Raichu" }));
		await save(repo, box0, box1);

		const box2 = new PokemonBox(box1.items);
		box2.set(id1, new PokemonIv({ pokemonName: "Pikachu" }), "nick");
		box2.remove(id2);
		box2.add(new PokemonIv({ pokemonName: "Bulbasaur" }));
		await save(repo, box1, box2);

		const loaded = await load(new FirebaseBoxRepository(api));
		expect(loaded.map((x) => x.serialize())).toEqual(
			box2.items.map((x) => x.serialize()),
		);
	});

	test("needs init until items are added", async () => {
		const api = createApi();
		const repo = new FirebaseBoxRepository(api);
		expect((await repo.load()).needsInit).toBe(true);

		const box0 = new PokemonBox();
		const box1 = new PokemonBox();
		box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		await save(repo, box0, box1);
		const loaded = await repo.load();
		expect(loaded.needsInit).toBe(false);

		// Removing all items does not reset the initialized state
		const box2 = new PokemonBox(loaded.items);
		const box3 = new PokemonBox(box2.items);
		box3.remove(box2.items[0].id);
		await save(repo, box2, box3);
		expect(await repo.load()).toEqual({ items: [], needsInit: false });
	});

	test("keeps IDs of loaded items", async () => {
		const api = createApi();
		const repo1 = new FirebaseBoxRepository(api);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox();
		box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		await save(repo1, box0, box1);

		// Load with another repository, which renumbers the item IDs
		const repo2 = new FirebaseBoxRepository(api);
		const box2 = new PokemonBox(await load(repo2));
		const box3 = new PokemonBox(box2.items);
		box3.set(box2.items[0].id, box2.items[0].iv, "nick");
		await save(repo2, box2, box3);

		const loaded = await load(new FirebaseBoxRepository(api));
		expect(loaded.length).toBe(1);
		expect(loaded[0].nickname).toBe("nick");
	});

	test("sends changes in order without waiting", async () => {
		const api = createApi();
		const repo = new FirebaseBoxRepository(api);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox(box0.items);
		const id = box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		const box2 = new PokemonBox(box1.items);
		box2.remove(id);

		// Remove is requested before add completes
		const p1 = save(repo, box0, box1);
		const p2 = save(repo, box1, box2);
		await Promise.all([p1, p2]);

		expect(await load(new FirebaseBoxRepository(api))).toEqual([]);
	});

	test("updates an item before add completes", async () => {
		const api = createApi();
		const repo = new FirebaseBoxRepository(api);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox(box0.items);
		const id = box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		const box2 = new PokemonBox(box1.items);
		box2.set(id, new PokemonIv({ pokemonName: "Pikachu" }), "nick");

		const p1 = save(repo, box0, box1);
		const p2 = save(repo, box1, box2);
		await Promise.all([p1, p2]);

		const loaded = await load(new FirebaseBoxRepository(api));
		expect(loaded.map((x) => x.nickname)).toEqual(["nick"]);
	});

	test("loads after pending saves complete", async () => {
		const api = createApi();
		const repo = new FirebaseBoxRepository(api);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox();
		box1.add(new PokemonIv({ pokemonName: "Pikachu" }));

		// Load is requested before the save completes
		const p = save(repo, box0, box1);
		const loaded = await load(repo);
		await p;
		expect(loaded.length).toBe(1);
	});

	test("continues after a failed request", async () => {
		const api = createApi();
		let fail = true;
		const failingApi: BoxApi = {
			getBoxItems: () => api.getBoxItems(),
			addBoxItems: (data) =>
				fail ? Promise.reject(new Error("failed")) : api.addBoxItems(data),
			updateBoxItems: (entries) => api.updateBoxItems(entries),
			deleteBoxItems: (ids) => api.deleteBoxItems(ids),
		};
		const repo = new FirebaseBoxRepository(failingApi);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox();
		box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		await expect(save(repo, box0, box1)).rejects.toThrow("failed");

		fail = false;
		const box2 = new PokemonBox(box1.items);
		box2.add(new PokemonIv({ pokemonName: "Raichu" }));
		await save(repo, box1, box2);
		expect((await api.getBoxItems()).items.length).toBe(1);
	});

	test("adds an updated item whose add failed", async () => {
		const api = createApi();
		let fail = true;
		const failingApi: BoxApi = {
			getBoxItems: () => api.getBoxItems(),
			addBoxItems: (data) =>
				fail ? Promise.reject(new Error("failed")) : api.addBoxItems(data),
			updateBoxItems: (entries) => api.updateBoxItems(entries),
			deleteBoxItems: (ids) => api.deleteBoxItems(ids),
		};
		const repo = new FirebaseBoxRepository(failingApi);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox();
		const id = box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		await expect(save(repo, box0, box1)).rejects.toThrow("failed");

		fail = false;
		const box2 = new PokemonBox(box1.items);
		box2.set(id, new PokemonIv({ pokemonName: "Pikachu" }), "nick");
		await save(repo, box1, box2);

		const loaded = await load(new FirebaseBoxRepository(api));
		expect(loaded.map((x) => x.nickname)).toEqual(["nick"]);
	});
});
