import events, { getEventBonus, loadHelpEventBonus } from "../data/events";
import fields, { isExpertField } from "../data/fields";
import { type PokemonType, PokemonTypes } from "../data/pokemons";
import {
	AlwaysTap,
	type EnergyParameter,
	isValidTapFrequency,
	NoTap,
	whistlePeriod,
} from "./Energy";
import { getMaxSkillLevel } from "./MainSkill";

/** Pseudo field index where all berries are favorites */
export const allFavoriteFieldIndex = -2;

/** Pseudo field index where no berries are favorites */
export const noFavoriteFieldIndex = -1;

/** Expert mode effects */
export type ExpertEffects = "berry" | "ing" | "skill";

/** Expert mode effects list */
export const ExpertEffectsList: Readonly<ExpertEffects[]> = [
	"berry",
	"ing",
	"skill",
];

/**
 * Represents the parameter of PokemonStrength.calc.
 */
export interface StrengthParameter extends EnergyParameter {
	/** Field bonus */
	fieldBonus: number;

	/** Pokemon level (0: current level, Others: specified level) */
	level: 0 | 10 | 25 | 30 | 50 | 55 | 60 | 70 | 75 | 80 | 100;

	/** Calculate with evolved Pokemon */
	evolved: boolean;

	/** Calculate with max skill level */
	maxSkillLevel: boolean;

	/**
	 * Total strength calculation flag (berry, ingredient, skill).
	 *
	 * This is a 3-element boolean array where:
	 * - 1st element: Include berry strength in total
	 * - 2nd element: Include ingredient strength in total
	 * - 3rd element: Include skill strength in total
	 *
	 * Examples:
	 * - [true, true, true]: Total strength includes berry, ingredient, and skill strength
	 * - [true, false, true]: Total strength includes berry and skill strength only
	 */
	totalFlags: boolean[];

	/**
	 * Whether to add other Pokémon's additional strength gained from this
	 * Pokémon's Helping Bonus.
	 *
	 * When set to true, the additional strength that other Pokémon gain due to
	 * this Pokémon's Helping Bonus is added to totalStrength.
	 */
	addHelpingBonusEffect: boolean;

	/**
	 * Recipe bonus, which increases as the number of ingredients increases.
	 */
	recipeBonus: number;

	/**
	 * Average recipe level (1 - 65).
	 */
	recipeLevel: RecipeLevel;

	/** Skill level of the 'Helper Boost' skill */
	helperBoostLevel: number;

	/** Number of different species of same type Pokémon on the team */
	helperBoostSpecies: number;

	/** Berry burst team configuration */
	berryBurstTeam: BerryBurstTeam & {
		/** Whether to calculate automatically using the default team */
		auto: boolean;
	};

	/** Mew config overwrite */
	mew: MewParameter;

	/** Latias/Latios twins are on the team */
	latiTwins: boolean;
}

/**
 * Berry burst team configuration.
 */
export interface BerryBurstTeam {
	/**
	 * Number of different Pokémon species of the same type on the team.
	 *
	 * - Used only when the main skill is "Energy for Everyone S (Lunar Blessing)".
	 * - Ignored if `auto` is set to true.
	 */
	species: number;
	/** Custom team members (0 - 4) */
	members: BerryBurstTeamMember[];
}

/** Custom team member to calculate berry burst */
export interface BerryBurstTeamMember {
	/** Berry type */
	type: PokemonType;
	/** Pokemon's level */
	level: number;
}

/** Custom mew configuration */
export interface MewParameter {
	/** Ingredient Rate */
	ing: number;
	/** Skill rate (low) */
	skill1: number;
	/** Skill rate (normal) */
	skill2: number;
	/** Skill rate (high) */
	skill3: number;
	/** Candy success rate */
	success: number;
}

/** Valid recipe level values (1-65) */
export type RecipeLevel = number;

/**
 * Normalize a StrengthParameter by applying event fixedBerries favoriteType overrides.
 * When the current event fixes berry types for the selected field, this function
 * ensures `parameter.favoriteType` is consistent with those fixed berries.
 * @param parameter The StrengthParameter to normalize.
 * @returns A new StrengthParameter with favoriteType adjusted if necessary.
 */
export function normalizeStrengthParameter(
	parameter: StrengthParameter,
): StrengthParameter {
	const event = getEventBonus(parameter.event, parameter.customEventBonus);

	let fixRequired = false;
	if (
		event.fixedBerries.length === 3 &&
		event.fixedAreas.includes(parameter.fieldIndex)
	) {
		const allNonNull = event.fixedBerries.every((b) => b !== null);
		if (allNonNull) {
			fixRequired = event.fixedBerries.some(
				(b) => !parameter.favoriteType.includes(b as PokemonType),
			);
		} else {
			for (let i = 0; i < 3; i++) {
				if (
					event.fixedBerries[i] !== null &&
					parameter.favoriteType[i] !== event.fixedBerries[i]
				) {
					fixRequired = true;
					break;
				}
			}
		}
	}

	if (!fixRequired) {
		return parameter;
	}

	const orig = [...parameter.favoriteType];
	const isExpert = isExpertField(parameter.fieldIndex);
	if (isExpert) {
		parameter.favoriteType = [
			event.fixedBerries[0] ?? orig[0],
			event.fixedBerries[1] ?? orig[1],
			event.fixedBerries[2] ?? orig[2],
		];
	} else {
		const newType: (PokemonType | null)[] = [...event.fixedBerries];
		if (newType[1] === null) {
			newType[1] = PokemonTypes.find((x) => !newType.includes(x)) ?? "normal";
		}
		if (newType[2] === null) {
			newType[2] = PokemonTypes.find((x) => !newType.includes(x)) ?? "normal";
		}
		parameter.favoriteType = newType as PokemonType[];
	}
	return parameter;
}

/**
 * Create a StrengthParameter from Partial<StrengthParameter>.
 * @param param The partial values to overwrite default values.
 * @returns The resulting StrengthParameter.
 */
export function createStrengthParameter(
	param: Partial<StrengthParameter>,
): StrengthParameter {
	const defaultParameters: StrengthParameter = {
		period: 24,
		fieldBonus: 0,
		fieldIndex: noFavoriteFieldIndex,
		favoriteType: ["normal", "fire", "water"],
		helpBonusCount: 0,
		e4eEnergy: 18,
		e4eCount: 3,
		recoveryBonusCount: 0,
		isEnergyAlwaysFull: false,
		sleepScore: 100,
		isGoodCampTicketSet: false,
		expertEffect: "berry",
		event: "none",
		level: 0,
		evolved: false,
		maxSkillLevel: false,
		pityProc: true,
		totalFlags: [true, true, true],
		addHelpingBonusEffect: true,
		tapFrequencyAwake: 180,
		tapFrequencyAsleep: NoTap,
		recipeBonus: 25,
		recipeLevel: 30,
		helperBoostLevel: 6,
		helperBoostSpecies: 4,
		berryBurstTeam: {
			auto: true,
			species: 3,
			members: [
				{ type: "electric", level: 50 },
				{ type: "water", level: 50 },
				{ type: "bug", level: 50 },
				{ type: "psychic", level: 50 },
			],
		},
		customEventBonus: {
			target: {},
			effects: {
				berry: 0,
				skillTrigger: 1,
				skillLevel: 0,
				ingredient: 0,
				dreamShard: 1,
				ingredientMagnet: 1,
				ingredientDraw: 1,
				skillIngredient: 1,
				berryBurst: 1,
				dish: 1,
				energyFromDish: 0,
				carryLimitAdd: 0,
				carryLimitMul: 1,
				fixedAreas: [],
				fixedBerries: [],
			},
		},
		mew: {
			ing: 20,
			skill1: 8,
			skill2: 4,
			skill3: 3.2,
			success: 30,
		},
		latiTwins: false,
	};
	return { ...defaultParameters, ...param };
}

/**
 * Save StrengthParameter to localStorage.
 * @param parameter The StrengthParameter to save.
 */
export function saveStrengthParameter(parameter: StrengthParameter) {
	localStorage.setItem(
		"PstStrenghParam",
		serializeStrengthParameter(parameter),
	);
}

/**
 * Serialize StrengthParameter to a JSON string.
 * @param parameter The StrengthParameter to serialize.
 * @returns The JSON string.
 */
export function serializeStrengthParameter(
	parameter: StrengthParameter,
): string {
	return JSON.stringify(parameter);
}

/**
 * Load StrengthParameter fron localStorage.
 * @returns Loaded parameter.
 */
export function loadStrengthParameter(): StrengthParameter {
	const ret: StrengthParameter = createStrengthParameter({});

	const settings = localStorage.getItem("PstStrenghParam");
	if (settings === null) {
		return ret;
	}
	const json = JSON.parse(settings);
	if (typeof json !== "object" || json === null) {
		return ret;
	}
	return deserializeStrengthParameter(json);
}

/**
 * Deserializes a StrengthParameter from JSON.
 * @param json The JSON object to deserialize.
 * @returns The deserialized StrengthParameter.
 */
// biome-ignore lint/suspicious/noExplicitAny: json is untyped external data, validated field by field below
export function deserializeStrengthParameter(json: any): StrengthParameter {
	const ret: StrengthParameter = createStrengthParameter({});
	if (
		typeof json.period === "number" &&
		[1, 3, 8, 16, 24, 168, whistlePeriod, -10, -30, -100].includes(json.period)
	) {
		ret.period = json.period;
	}
	if (
		typeof json.fieldBonus === "number" &&
		Math.floor(json.fieldBonus) === json.fieldBonus &&
		json.fieldBonus >= 0 &&
		json.fieldBonus <= 100
	) {
		ret.fieldBonus = Math.floor(json.fieldBonus);
	}
	if (
		typeof json.fieldIndex === "number" &&
		Math.floor(json.fieldIndex) === json.fieldIndex &&
		json.fieldIndex >= allFavoriteFieldIndex &&
		json.fieldIndex < fields.length
	) {
		ret.fieldIndex = json.fieldIndex;
	}
	if (
		Array.isArray(json.favoriteType) &&
		json.favoriteType.length === 3 &&
		json.favoriteType.every((x: PokemonType) => PokemonTypes.includes(x))
	) {
		ret.favoriteType = json.favoriteType;
	}
	if (
		typeof json.helpBonusCount === "number" &&
		Math.floor(json.helpBonusCount) === json.helpBonusCount &&
		json.helpBonusCount >= 0 &&
		json.helpBonusCount <= 4
	) {
		ret.helpBonusCount = json.helpBonusCount;
	}
	if (typeof json.isGoodCampTicketSet === "boolean") {
		ret.isGoodCampTicketSet = json.isGoodCampTicketSet;
	}
	if (
		typeof json.expertEffect === "string" &&
		ExpertEffectsList.includes(json.expertEffect)
	) {
		ret.expertEffect = json.expertEffect;
	}

	if (
		typeof json.level === "number" &&
		[0, 10, 25, 30, 50, 55, 60, 70, 75, 80, 100].includes(json.level)
	) {
		ret.level = json.level;
	}
	if (typeof json.evolved === "boolean") {
		ret.evolved = json.evolved;
	}
	if (typeof json.maxSkillLevel === "boolean") {
		ret.maxSkillLevel = json.maxSkillLevel;
	}
	if (typeof json.pityProc === "boolean") {
		ret.pityProc = json.pityProc;
	}
	if (
		Array.isArray(json.totalFlags) &&
		json.totalFlags.length === 3 &&
		json.totalFlags.every((x: unknown) => typeof x === "boolean")
	) {
		ret.totalFlags = json.totalFlags;
	}
	if (typeof json.addHelpingBonusEffect === "boolean") {
		ret.addHelpingBonusEffect = json.addHelpingBonusEffect;
	} else {
		ret.addHelpingBonusEffect = true;
	}

	if (
		typeof json.e4eEnergy === "number" &&
		[5, 7, 9, 11, 15, 18].includes(json.e4eEnergy)
	) {
		ret.e4eEnergy = json.e4eEnergy;
	}
	if (
		typeof json.e4eCount === "number" &&
		json.e4eCount >= 0 &&
		json.e4eCount <= 10
	) {
		ret.e4eCount = json.e4eCount;
	}
	if (
		typeof json.recoveryBonusCount === "number" &&
		json.recoveryBonusCount >= 0 &&
		json.recoveryBonusCount <= 5
	) {
		ret.recoveryBonusCount = Math.min(json.recoveryBonusCount, 4) as
			| 0
			| 1
			| 2
			| 3
			| 4;
	}
	if (typeof json.isEnergyAlwaysFull === "boolean") {
		ret.isEnergyAlwaysFull = json.isEnergyAlwaysFull;
	}
	if (
		typeof json.sleepScore === "number" &&
		0 <= json.sleepScore &&
		json.sleepScore <= 100
	) {
		ret.sleepScore = json.sleepScore;
	}
	// Migrate tapFrequencyAwake (with backward compatibility)
	if (isValidTapFrequency(json.tapFrequencyAwake)) {
		ret.tapFrequencyAwake = json.tapFrequencyAwake;
	} else if (json.tapFrequency === "none") {
		ret.tapFrequencyAwake = NoTap;
	} else {
		ret.tapFrequencyAwake = 180; // Default to 3h
	}
	// Migrate tapFrequencyAsleep (with backward compatibility)
	if (isValidTapFrequency(json.tapFrequencyAsleep)) {
		ret.tapFrequencyAsleep = json.tapFrequencyAsleep;
	} else if (json.tapFrequencyAsleep === "always") {
		ret.tapFrequencyAsleep = AlwaysTap;
	} else if (json.tapFrequencyAsleep === "none") {
		ret.tapFrequencyAsleep = NoTap;
	} else {
		ret.tapFrequencyAsleep = NoTap;
	}
	if (
		typeof json.recipeBonus === "number" &&
		[0, 6, 11, 17, 19, 20, 25, 35, 48, 61, 78].includes(json.recipeBonus)
	) {
		if (json.recipeBonus === 6 || json.recipeBonus === 11) {
			json.recipeBonus = 19;
		}
		if (json.recipeBonus === 17) {
			json.recipeBonus = 21;
		}
		ret.recipeBonus = json.recipeBonus;
	}
	if (
		typeof json.recipeLevel === "number" &&
		1 <= json.recipeLevel &&
		json.recipeLevel <= 65
	) {
		ret.recipeLevel = json.recipeLevel;
	}
	if (
		typeof json.helperBoostLevel === "number" &&
		json.helperBoostLevel > 0 &&
		json.helperBoostLevel <= getMaxSkillLevel("Helper Boost")
	) {
		ret.helperBoostLevel = json.helperBoostLevel;
	}
	if (
		typeof json.helperBoostSpecies === "number" &&
		json.helperBoostSpecies > 0 &&
		json.helperBoostSpecies <= 6
	) {
		ret.helperBoostSpecies = json.helperBoostSpecies;
	}
	if (
		typeof json.recipeLevel === "number" &&
		[1, 10, 20, 30, 40, 50, 55, 60, 65].includes(json.recipeLevel)
	) {
		ret.recipeLevel = json.recipeLevel;
	}

	if (typeof json.berryBurstTeam === "object") {
		if (typeof json.berryBurstTeam.auto === "boolean") {
			ret.berryBurstTeam.auto = json.berryBurstTeam.auto;
		}
		if (typeof json.berryBurstTeam.species === "number") {
			ret.berryBurstTeam.species = json.berryBurstTeam.species;
		}
		if (Array.isArray(json.berryBurstTeam.members)) {
			for (let i = 0; i < 4; i++) {
				if (typeof json.berryBurstTeam.members[i] !== "object") {
					continue;
				}
				if (PokemonTypes.includes(json.berryBurstTeam.members[i].type)) {
					ret.berryBurstTeam.members[i].type =
						json.berryBurstTeam.members[i].type;
				}
				if (
					json.berryBurstTeam.members[i].level > 0 &&
					json.berryBurstTeam.members[i].level <= 100
				) {
					ret.berryBurstTeam.members[i].level =
						json.berryBurstTeam.members[i].level;
				}
			}
		}
	}

	const eventNames = events.bonus.map((x) => x.name);
	if (
		typeof json.event === "string" &&
		["none", "custom", ...eventNames].includes(json.event)
	) {
		ret.event = json.event;
	}

	if (typeof json.customEventBonus === "object") {
		ret.customEventBonus = loadHelpEventBonus(json.customEventBonus);
	}

	if (typeof json.mew === "object" && json.mew !== null) {
		if (
			typeof json.mew.ing === "number" &&
			json.mew.ing >= 0 &&
			json.mew.ing <= 100
		) {
			ret.mew.ing = json.mew.ing;
		}
		if (
			typeof json.mew.skill1 === "number" &&
			json.mew.skill1 >= 0 &&
			json.mew.skill1 <= 100
		) {
			ret.mew.skill1 = json.mew.skill1;
		}
		if (
			typeof json.mew.skill2 === "number" &&
			json.mew.skill2 >= 0 &&
			json.mew.skill2 <= 100
		) {
			ret.mew.skill2 = json.mew.skill2;
		}
		if (
			typeof json.mew.skill3 === "number" &&
			json.mew.skill3 >= 0 &&
			json.mew.skill3 <= 100
		) {
			ret.mew.skill3 = json.mew.skill3;
		}
		if (
			typeof json.mew.success === "number" &&
			json.mew.success >= 0 &&
			json.mew.success <= 100
		) {
			ret.mew.success = json.mew.success;
		}
	}

	if (typeof json.latiTwins === "boolean") {
		ret.latiTwins = json.latiTwins;
	}

	return ret;
}
