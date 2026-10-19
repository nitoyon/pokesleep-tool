import { describe, expect, test } from "vitest";
import PokemonIv from "../PokemonIv";
import PokemonBox, { deserializeBoxItem, PokemonBoxItem } from "./PokemonBox";

describe("PokemonBoxItem", () => {
	const iv = new PokemonIv({ pokemonName: "Pikachu" });
	const ivText = iv.serialize();

	test("serialize", () => {
		expect(new PokemonBoxItem(iv).serialize()).toBe(ivText);
		expect(new PokemonBoxItem(iv, "nick").serialize()).toBe(`${ivText}@nick`);
		expect(new PokemonBoxItem(iv, "", "f2a5").serialize()).toBe(
			`${ivText}.f2a5`,
		);
		expect(new PokemonBoxItem(iv, "nick", "f2a5").serialize()).toBe(
			`${ivText}.f2a5@nick`,
		);
	});

	test("serialize and deserialize round trip", () => {
		for (const [nickname, attributes] of [
			["", ""],
			["nick", ""],
			["", "f2a5"],
			["a.b@c", "f2a5.x1"],
		]) {
			const text = new PokemonBoxItem(iv, nickname, attributes).serialize();
			const data = deserializeBoxItem(text);
			expect(data?.iv.serialize()).toBe(ivText);
			expect(data?.nickname).toBe(nickname);
			expect(data?.attributes).toBe(attributes);
		}
	});

	test("clone keeps attributes", () => {
		const item = new PokemonBoxItem(iv, "nick", "f2a5");
		const copy = item.clone();
		expect(copy.id).not.toBe(item.id);
		expect(copy.serialize()).toBe(item.serialize());
	});
});

describe("deserializeBoxItem", () => {
	const ivText = new PokemonIv({ pokemonName: "Pikachu" }).serialize();

	test("old format", () => {
		expect(deserializeBoxItem(ivText)).toMatchObject({
			nickname: "",
			attributes: "",
		});
		expect(deserializeBoxItem(`${ivText}@nick`)).toMatchObject({
			nickname: "nick",
			attributes: "",
		});
	});

	test("does not read nickname as attributes", () => {
		expect(deserializeBoxItem(`${ivText}@.f3ff`)).toMatchObject({
			nickname: ".f3ff",
			attributes: "",
		});
		expect(deserializeBoxItem(`${ivText}@a.b@c`)).toMatchObject({
			nickname: "a.b@c",
			attributes: "",
		});
	});

	test("attributes", () => {
		expect(deserializeBoxItem(`${ivText}.f3ff`)).toMatchObject({
			nickname: "",
			attributes: "f3ff",
		});
		expect(deserializeBoxItem(`${ivText}.f3ff.x@nick`)).toMatchObject({
			nickname: "nick",
			attributes: "f3ff.x",
		});
	});

	test("invalid", () => {
		expect(deserializeBoxItem("invalid")).toBeNull();
		expect(deserializeBoxItem(`${ivText}x.f3ff`)).toBeNull();
	});
});

describe("PokemonBox", () => {
	test("set keeps attributes", () => {
		const box = new PokemonBox();
		const id = box.add(
			new PokemonBoxItem(
				new PokemonIv({ pokemonName: "Pikachu" }),
				"nick",
				"f2a5",
			),
		);
		box.set(id, new PokemonIv({ pokemonName: "Raichu" }), "new");
		const item = box.getById(id);
		expect(item?.iv.pokemonName).toBe("Raichu");
		expect(item?.nickname).toBe("new");
		expect(item?.attributes).toBe("f2a5");
	});
});
