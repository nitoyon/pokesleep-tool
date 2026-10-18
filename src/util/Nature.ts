type NoCorrectionNatureType =
	| "Bashful"
	| "Hardy"
	| "Docile"
	| "Quirky"
	| "Serious";
type EnergyRecoveryUpNatureType = "Bold" | "Impish" | "Lax" | "Relaxed";
type ExpGainsUpNatureType = "Timid" | "Hasty" | "Jolly" | "Naive";
type SpeedOfHelpUpNatureType = "Lonely" | "Adamant" | "Naughty" | "Brave";
type MainSkillChanceUpNatureType = "Calm" | "Gentle" | "Careful" | "Sassy";
type IngredientFindingUpNatureType = "Modest" | "Mild" | "Rash" | "Quiet";
type EnergyRecoveryDownNatureType = "Hasty" | "Lonely" | "Gentle" | "Mild";
type ExpGainsDownNatureType = "Relaxed" | "Brave" | "Sassy" | "Quiet";
type SpeedOfHelpDownNatureType = "Bold" | "Timid" | "Calm" | "Modest";
type MainSkillChanceDownNatureType = "Lax" | "Naive" | "Naughty" | "Rash";
type IngredientFindingDownNatureType =
	| "Impish"
	| "Jolly"
	| "Adamant"
	| "Careful";
export type NatureType =
	| NoCorrectionNatureType
	| EnergyRecoveryUpNatureType
	| ExpGainsUpNatureType
	| SpeedOfHelpUpNatureType
	| MainSkillChanceUpNatureType
	| IngredientFindingUpNatureType;

export type NatureEffect =
	| "No effect"
	| "Energy recovery"
	| "EXP gains"
	| "Main skill chance"
	| "Speed of help"
	| "Ingredient finding";

export type PlusMinusOneOrZero = -1 | 0 | 1;

/**
 * Represents the nature of pokemon.
 *
 * This class is immutable.
 */
class Nature {
	private readonly value: NatureType;

	/**
	 * Whether a Neutralizing Mint has been used.
	 *
	 * When true, all the up/down effects of the nature are disabled.
	 * Always false for neutral natures.
	 */
	readonly mint: boolean;

	private static allNatureNames: NatureType[] = [
		"Bashful",
		"Hardy",
		"Docile",
		"Quirky",
		"Serious",
		"Bold",
		"Impish",
		"Lax",
		"Relaxed",
		"Timid",
		"Hasty",
		"Jolly",
		"Naive",
		"Lonely",
		"Adamant",
		"Naughty",
		"Brave",
		"Calm",
		"Gentle",
		"Careful",
		"Sassy",
		"Modest",
		"Mild",
		"Rash",
		"Quiet",
	];

	private static allNaturesCache: Nature[] = [];

	private static neautralNatures: NoCorrectionNatureType[] = [
		"Bashful",
		"Hardy",
		"Docile",
		"Quirky",
		"Serious",
	];

	private static energyRecoveryUpNatures: EnergyRecoveryUpNatureType[] = [
		"Bold",
		"Impish",
		"Lax",
		"Relaxed",
	];
	private static expGainsUpNatures: ExpGainsUpNatureType[] = [
		"Timid",
		"Hasty",
		"Jolly",
		"Naive",
	];
	private static speedOfHelpUpNatures: SpeedOfHelpUpNatureType[] = [
		"Lonely",
		"Adamant",
		"Naughty",
		"Brave",
	];
	private static mainSkillChanceUpNatures: MainSkillChanceUpNatureType[] = [
		"Calm",
		"Gentle",
		"Careful",
		"Sassy",
	];
	private static ingredientFindingUpNatures: IngredientFindingUpNatureType[] = [
		"Modest",
		"Mild",
		"Rash",
		"Quiet",
	];

	private static energyRecoveryDownNatures: EnergyRecoveryDownNatureType[] = [
		"Hasty",
		"Lonely",
		"Gentle",
		"Mild",
	];
	private static expGainsDownNatures: ExpGainsDownNatureType[] = [
		"Relaxed",
		"Brave",
		"Sassy",
		"Quiet",
	];
	private static speedOfHelpDownNatures: SpeedOfHelpDownNatureType[] = [
		"Bold",
		"Timid",
		"Calm",
		"Modest",
	];
	private static mainSkillChanceDownNatures: MainSkillChanceDownNatureType[] = [
		"Lax",
		"Naive",
		"Naughty",
		"Rash",
	];
	private static ingredientFindingDownNatures: IngredientFindingDownNatureType[] =
		["Impish", "Jolly", "Adamant", "Careful"];

	private static ampedNatures: NatureType[] = [
		"Hardy",
		"Docile",
		"Quirky",
		"Lax",
		"Impish",
		"Hasty",
		"Naive",
		"Jolly",
		"Brave",
		"Naughty",
		"Adamant",
		"Sassy",
		"Rash",
	];
	private static lowKeyNatures: NatureType[] = [
		"Bashful",
		"Serious",
		"Relaxed",
		"Bold",
		"Timid",
		"Lonely",
		"Gentle",
		"Calm",
		"Careful",
		"Mild",
		"Quiet",
		"Modest",
	];

	constructor(nature: string, mint: boolean = false) {
		if (!Nature.allNatureNames.includes(nature as NatureType)) {
			throw new Error(`Invalid nature specified: ${nature}`);
		}
		this.value = nature as NatureType;
		// Neutralizing Mint cannot be used for neutral natures
		this.mint = mint && !this.isNeautral;
	}

	get name() {
		return this.value;
	}

	/**
	 * Returns a nature with the given mint flag.
	 * @param mint Whether a Neutralizing Mint has been used.
	 * @returns Nature instance (this if not changed).
	 */
	withMint(mint: boolean): Nature {
		const newMint = mint && !this.isNeautral;
		return newMint === this.mint ? this : new Nature(this.value, newMint);
	}

	/** Returns the nature without mint (original effects). */
	get original(): Nature {
		return this.withMint(false);
	}

	/** Returns whether a Neutralizing Mint can be used for this nature. */
	get canUseMint(): boolean {
		return !this.isNeautral;
	}

	/**
	 * Check whether given nature is equal to this nature.
	 * @param nature Nature to be compared.
	 * @returns true if name and mint flag are the same.
	 */
	isEqual(nature: Nature): boolean {
		return this.value === nature.value && this.mint === nature.mint;
	}

	/**
	 * Returns whether the effect in the given list is active.
	 * Always false when a mint has been used.
	 */
	private hasEffect(list: readonly string[]): boolean {
		return !this.mint && list.includes(this.value);
	}

	get energyRecoveryFactor(): number {
		return this.isEnergyRecoveryUp ? 1.2 : this.isEnergyRecoveryDown ? 0.88 : 1;
	}
	get speedOfHelpFactor(): number {
		return this.isSpeedOfHelpUp ? 0.9 : this.isSpeedOfHelpDown ? 1.075 : 1;
	}
	get mainSkillChanceFactor(): number {
		return this.isMainSkillChanceUp
			? 1.2
			: this.isMainSkillChanceDown
				? 0.8
				: 1;
	}
	get ingredientFindingFactor(): number {
		return this.isIngredientFindingUp
			? 1.2
			: this.isIngredientFindingDown
				? 0.8
				: 1;
	}
	get expGainsFactor(): PlusMinusOneOrZero {
		return this.isExpGainsUp ? 1 : this.isExpGainsDown ? -1 : 0;
	}

	get expGainsRate(): number {
		return this.isExpGainsUp ? 1.18 : this.isExpGainsDown ? 0.82 : 1;
	}

	get upEffect(): NatureEffect {
		if (this.isEnergyRecoveryUp) {
			return "Energy recovery";
		}
		if (this.isExpGainsUp) {
			return "EXP gains";
		}
		if (this.isIngredientFindingUp) {
			return "Ingredient finding";
		}
		if (this.isMainSkillChanceUp) {
			return "Main skill chance";
		}
		if (this.isSpeedOfHelpUp) {
			return "Speed of help";
		}
		return "No effect";
	}

	get downEffect(): NatureEffect {
		if (this.isEnergyRecoveryDown) {
			return "Energy recovery";
		}
		if (this.isExpGainsDown) {
			return "EXP gains";
		}
		if (this.isIngredientFindingDown) {
			return "Ingredient finding";
		}
		if (this.isMainSkillChanceDown) {
			return "Main skill chance";
		}
		if (this.isSpeedOfHelpDown) {
			return "Speed of help";
		}
		return "No effect";
	}

	/** Whether the nature is a neutral nature (regardless of mint). */
	get isNeautral() {
		return (Nature.neautralNatures as NatureType[]).includes(this.value);
	}
	get isEnergyRecoveryUp() {
		return this.hasEffect(Nature.energyRecoveryUpNatures);
	}
	get isEnergyRecoveryDown() {
		return this.hasEffect(Nature.energyRecoveryDownNatures);
	}
	get isSpeedOfHelpUp() {
		return this.hasEffect(Nature.speedOfHelpUpNatures);
	}
	get isSpeedOfHelpDown() {
		return this.hasEffect(Nature.speedOfHelpDownNatures);
	}
	get isMainSkillChanceUp() {
		return this.hasEffect(Nature.mainSkillChanceUpNatures);
	}
	get isMainSkillChanceDown() {
		return this.hasEffect(Nature.mainSkillChanceDownNatures);
	}
	get isIngredientFindingUp() {
		return this.hasEffect(Nature.ingredientFindingUpNatures);
	}
	get isIngredientFindingDown() {
		return this.hasEffect(Nature.ingredientFindingDownNatures);
	}
	get isExpGainsUp() {
		return this.hasEffect(Nature.expGainsUpNatures);
	}
	get isExpGainsDown() {
		return this.hasEffect(Nature.expGainsDownNatures);
	}
	get isAmped() {
		return (Nature.ampedNatures as NatureType[]).includes(this.value);
	}
	get isLowKey() {
		return (Nature.lowKeyNatures as NatureType[]).includes(this.value);
	}

	static get allNatures(): Nature[] {
		if (Nature.allNaturesCache.length === 0) {
			Nature.allNaturesCache = Nature.allNatureNames.map((x) => new Nature(x));
		}
		return [...Nature.allNaturesCache];
	}
}

export default Nature;
