import { describe, expect, test } from "vitest";
import PokemonIv from "../PokemonIv";
import { diffBoxItems } from "./BoxRepository";
import PokemonBox from "./PokemonBox";

function createBox(): PokemonBox {
	const box = new PokemonBox();
	box.add(new PokemonIv({ pokemonName: "Pikachu" }));
	box.add(new PokemonIv({ pokemonName: "Raichu" }));
	return box;
}

describe("diffBoxItems", () => {
	test("returns empty array when nothing changed", () => {
		const box = createBox();
		expect(diffBoxItems(box.items, box.items)).toEqual([]);
		expect(diffBoxItems(box.items, [...box.items])).toEqual([]);
	});

	test("returns empty array for empty boxes", () => {
		expect(diffBoxItems([], [])).toEqual([]);
	});

	test("detects added items", () => {
		const box = createBox();
		const prev = box.items;
		const id = box.add(new PokemonIv({ pokemonName: "Bulbasaur" }));
		expect(diffBoxItems(prev, box.items)).toEqual([
			{ type: "add", item: box.getById(id) },
		]);
	});

	test("detects updated items", () => {
		const box = createBox();
		const prev = box.items;
		const id = prev[0].id;
		box.set(id, new PokemonIv({ pokemonName: "Raichu" }), "nick");
		expect(diffBoxItems(prev, box.items)).toEqual([
			{ type: "update", item: box.getById(id) },
		]);
	});

	test("detects removed items", () => {
		const box = createBox();
		const prev = box.items;
		const id = prev[1].id;
		box.remove(id);
		expect(diffBoxItems(prev, box.items)).toEqual([{ type: "remove", id }]);
	});

	test("detects removing all items", () => {
		const box = createBox();
		const prev = box.items;
		box.removeAll();
		expect(diffBoxItems(prev, box.items)).toEqual([
			{ type: "remove", id: prev[0].id },
			{ type: "remove", id: prev[1].id },
		]);
	});
});
