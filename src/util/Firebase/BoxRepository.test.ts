import { describe, expect, test } from "vitest";
import { diffBoxItems } from "../Box/BoxRepository";
import PokemonBox from "../Box/PokemonBox";
import PokemonIv from "../PokemonIv";
import { type BoxApi, FakeBoxApi } from "./BoxApi";
import { FirebaseBoxRepository } from "./BoxRepository";

let uidCounter = 0;
function createApi(): BoxApi {
	return new FakeBoxApi(`test${uidCounter++}`, 0);
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
		const box0 = new PokemonBox(await repo.load());
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

		const loaded = await new FirebaseBoxRepository(api).load();
		expect(loaded.map((x) => x.serialize())).toEqual(
			box2.items.map((x) => x.serialize()),
		);
	});

	test("keeps keys of loaded items", async () => {
		const api = createApi();
		const repo1 = new FirebaseBoxRepository(api);
		const box0 = new PokemonBox();
		const box1 = new PokemonBox();
		box1.add(new PokemonIv({ pokemonName: "Pikachu" }));
		await save(repo1, box0, box1);

		// Load with another repository, which renumbers the item IDs
		const repo2 = new FirebaseBoxRepository(api);
		const box2 = new PokemonBox(await repo2.load());
		const box3 = new PokemonBox(box2.items);
		box3.set(box2.items[0].id, box2.items[0].iv, "nick");
		await save(repo2, box2, box3);

		const loaded = await new FirebaseBoxRepository(api).load();
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

		expect(await new FirebaseBoxRepository(api).load()).toEqual([]);
	});

	test("continues after a failed request", async () => {
		const api = createApi();
		let fail = true;
		const failingApi: BoxApi = {
			getBox: () => api.getBox(),
			deleteBoxItems: (keys) => api.deleteBoxItems(keys),
			putBoxItems: (entries) =>
				fail ? Promise.reject(new Error("failed")) : api.putBoxItems(entries),
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
		expect((await api.getBox()).length).toBe(1);
	});
});
