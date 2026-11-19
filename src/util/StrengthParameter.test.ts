import PokemonIv from "./PokemonIv";
import {
	createStrengthParameter,
	deserializeStrengthParameter,
	serializeStrengthParameter,
} from "./StrengthParameter";

describe("StrengthParameter", () => {
	describe("serializeStrengthParameter / deserializeStrengthParameter", () => {
		test("falls back to default parameter", () => {
			const restored = deserializeStrengthParameter("{}");

			expect(
				restored.teamMember.isEqual(
					new PokemonIv({ pokemonName: "Raichu", level: 60 }),
				),
			).toBe(true);
		});

		test("deserialize teamMember", () => {
			const restored = deserializeStrengthParameter({
				teamMember: "MQCApwj5-38f",
			});

			expect(
				restored.teamMember.isEqual(
					new PokemonIv({
						pokemonName: "Venusaur",
						level: 30,
						ingredient: "ABC",
					}),
				),
			).toBe(true);
		});

		test("deserialize berryZone", () => {
			const restored = deserializeStrengthParameter({
				berryZone: { psychic: 10 },
			});
			expect(restored.berryZone.psychic).toBe(10);
		});

		test("deserialize recipeUsage", () => {
			const restored = deserializeStrengthParameter({
				recipeUsage: { help: 50, draw: 0, plus: 5, magnet: 100 },
			});
			expect(restored.recipeUsage).toEqual({
				help: 50,
				draw: 0,
				plus: 5,
				magnet: 100,
			});
		});

		test("recipeUsage falls back to defaults for missing or invalid values", () => {
			expect(deserializeStrengthParameter({}).recipeUsage).toEqual({
				help: 80,
				draw: 80,
				plus: 80,
				magnet: 0,
			});
			const restored = deserializeStrengthParameter({
				recipeUsage: { help: -1, draw: 101, magnet: "50" },
			});
			expect(restored.recipeUsage).toEqual({
				help: 80,
				draw: 80,
				plus: 80,
				magnet: 0,
			});
			const fraction = deserializeStrengthParameter({
				recipeUsage: { help: 50.5 },
			});
			expect(fraction.recipeUsage.help).toBe(80);
		});

		test("falls back to default teamMember when json.teamMember is an invalid string", () => {
			const restored = deserializeStrengthParameter({
				teamMember: "not a valid serialized IV",
			});

			expect(
				restored.teamMember.isEqual(
					new PokemonIv({ pokemonName: "Raichu", level: 60 }),
				),
			).toBe(true);
		});

		test("round-trips simple scalar fields", () => {
			const parameter = createStrengthParameter({
				fieldBonus: 10,
				level: 50,
				evolved: true,
				latiTwins: true,
			});
			const json = JSON.parse(serializeStrengthParameter(parameter));
			const restored = deserializeStrengthParameter(json);

			expect(restored.fieldBonus).toBe(10);
			expect(restored.level).toBe(50);
			expect(restored.evolved).toBe(true);
			expect(restored.latiTwins).toBe(true);
		});
	});
});
