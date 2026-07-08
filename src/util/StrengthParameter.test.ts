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
