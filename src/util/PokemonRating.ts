import Energy, { type EnergyResult, whistlePeriod } from "./Energy";
import {
	calculateBaseFreqAndBonus,
	calculateHelpCount,
	calculateOverallSkillRate,
	calculateSkillCountFromPlan,
	createHelpCountPlan,
	createHelpCountSimulation,
	type HelpCountPlan,
	type HelpCountSimulation,
} from "./HelpCount";
import Nature from "./Nature";
import type PokemonIv from "./PokemonIv";
import PokemonStrength, {
	type BonusEffectsWithReason,
	type StrengthParameter,
} from "./PokemonStrength";
import SubSkill, { type SubSkillType } from "./SubSkill";
import SubSkillList from "./SubSkillList";

/** Rating of a single metric (berry, ingredient or skill). */
export interface RatingValue {
	/** Expected amount in the period (berries, ingredients or skill count). */
	value: number;
	/**
	 * Percentage of all individuals whose amount is greater than or equal to
	 * this individual's amount (0 < topPercent <= 100).
	 */
	topPercent: number;
}

/** Result of {@link PokemonRating.calculate}. */
export interface RatingResult {
	berry: RatingValue;
	ingredient: RatingValue;
	skill: RatingValue;
	/** Berry rate per help */
	berryRate: number;
	/** Ingredient rate per help */
	ingRate: number;
	/** Skill rate per help */
	skillRate: number;
}

/** Amount of berries, ingredients and skills for an individual. */
interface Amount {
	berry: number;
	ingredient: number;
	skill: number;
}

/**
 * Sub-skills that affect the amount of berries, ingredients or skills.
 *
 * Other sub-skills (EXP bonus, Dream Shard bonus, Skill Level Up) don't
 * change the amount, so individuals that differ only in them are
 * grouped together.
 */
const relevantSubSkillNames: SubSkillType[] = [
	"Helping Speed M",
	"Helping Speed S",
	"Helping Bonus",
	"Berry Finding S",
	"Ingredient Finder M",
	"Ingredient Finder S",
	"Skill Trigger M",
	"Skill Trigger S",
	"Inventory Up L",
	"Inventory Up M",
	"Inventory Up S",
	"Energy Recovery Bonus",
];

/** Number of sub-skill slots unlocked at the given level. */
export function getActiveSubSkillSlotCount(level: number): number {
	return [10, 25, 50, 70, 80].filter((x) => level >= x).length;
}

function combination(n: number, k: number): number {
	if (k < 0 || k > n) {
		return 0;
	}
	let ret = 1;
	for (let i = 0; i < k; i++) {
		ret = (ret * (n - i)) / (i + 1);
	}
	return ret;
}

/**
 * Effects of the active sub-skills that change the amount.
 */
interface SubSkillFeature {
	/** Sum of helping speed (0-3) */
	helpingSpeed: number;
	/** Has Helping Bonus (0 or 1) */
	helpingBonus: number;
	/** Has Berry Finding S (0 or 1) */
	berryFinding: number;
	/** Sum of ingredient finder (0-3) */
	ingredientFinder: number;
	/** Sum of skill trigger (0-3) */
	skillTrigger: number;
	/** Sum of inventory up (0-6) */
	inventory: number;
	/** Has Energy Recovery Bonus (0 or 1) */
	energyRecovery: number;
}

function getSubSkillFeature(skills: SubSkill[]): SubSkillFeature {
	const has = (name: SubSkillType) =>
		skills.some((x) => x.name === name) ? 1 : 0;
	return {
		helpingSpeed: skills.reduce((p, c) => p + c.helpingSpeed, 0),
		helpingBonus: has("Helping Bonus"),
		berryFinding: has("Berry Finding S"),
		ingredientFinder: skills.reduce((p, c) => p + c.ingredientFinder, 0),
		skillTrigger: skills.reduce((p, c) => p + c.skillTrigger, 0),
		inventory: skills.reduce((p, c) => p + c.inventory, 0),
		energyRecovery: has("Energy Recovery Bonus"),
	};
}

/** A group of sub-skill combinations that yield the same amount. */
export interface SubSkillGroup extends SubSkillFeature {
	/** Representative sub-skills of this group */
	subSkills: SubSkillList;
	/** Probability of this group */
	weight: number;
}

/**
 * Enumerate groups of active sub-skills at the given level.
 *
 * All sub-skill combinations (5 distinct sub-skills out of 17) are assumed
 * to be equally likely. Since only the unlocked `k` slots matter, the set of
 * active sub-skills is uniformly distributed over the k-subsets of all
 * sub-skills. A subset is identified by the relevant sub-skills it
 * contains; the rest are filled with irrelevant sub-skills.
 *
 * @param level The level of the Pokémon.
 * @returns Groups of sub-skills and their probability (sum is 1).
 */
export function enumerateSubSkillGroups(level: number): SubSkillGroup[] {
	const all = SubSkill.allSubSkillNames;
	const relevant = relevantSubSkillNames.map((x) => new SubSkill(x));
	const irrelevantCount = all.length - relevant.length;
	const k = getActiveSubSkillSlotCount(level);
	const total = combination(all.length, k);

	// Group by the feature (ex: Inventory Up S + M is the same as L)
	const groups = new Map<string, SubSkillGroup>();
	for (let mask = 0; mask < 1 << relevant.length; mask++) {
		const skills = relevant.filter((_, i) => (mask & (1 << i)) !== 0);
		const weight = combination(irrelevantCount, k - skills.length) / total;
		if (weight === 0) {
			continue;
		}

		const feature = getSubSkillFeature(skills);
		const key = Object.values(feature).join(",");
		const group = groups.get(key);
		if (group !== undefined) {
			group.weight += weight;
			continue;
		}
		const [lv10, lv25, lv50, lv70, lv80] = skills;
		groups.set(key, {
			...feature,
			subSkills: new SubSkillList({ lv10, lv25, lv50, lv70, lv80 }),
			weight,
		});
	}
	return [...groups.values()];
}

/** Effects of the nature that change the amount (0: down, 1: none, 2: up) */
interface NatureFeature {
	speed: number;
	ingredient: number;
	skill: number;
	energy: number;
}

function getNatureFeature(nature: Nature): NatureFeature {
	const toIndex = (factor: number, upIsLarger: boolean) =>
		factor === 1 ? 1 : factor > 1 === upIsLarger ? 2 : 0;
	return {
		// speed of help factor is smaller when the speed is up
		speed: toIndex(nature.speedOfHelpFactor, false),
		ingredient: toIndex(nature.ingredientFindingFactor, true),
		skill: toIndex(nature.mainSkillChanceFactor, true),
		energy: toIndex(nature.energyRecoveryFactor, true),
	};
}

/** A group of natures that yield the same amount. */
export interface NatureGroup extends NatureFeature {
	/** Representative nature of this group */
	nature: Nature;
	/** Probability of this group */
	weight: number;
}

/**
 * Enumerate groups of natures.
 *
 * Natures that have the same effect on speed, ingredient, skill and
 * energy recovery are grouped together (EXP gains doesn't matter).
 *
 * @returns Groups of natures and their probability (sum is 1).
 */
export function enumerateNatureGroups(): NatureGroup[] {
	const natures = Nature.allNatures;
	const groups = new Map<string, NatureGroup>();
	for (const nature of natures) {
		const feature = getNatureFeature(nature);
		const key = Object.values(feature).join(",");
		const group = groups.get(key);
		if (group !== undefined) {
			group.weight += 1 / natures.length;
		} else {
			groups.set(key, { ...feature, nature, weight: 1 / natures.length });
		}
	}
	return [...groups.values()];
}

/** Number of distinct simulation codes (see AmountCalculator.simCode) */
const simCodeCount = 7 * 4 * 3 * 2;
/** Number of distinct skill rate codes (see AmountCalculator.skillCode) */
const skillCodeCount = 4 * 3;

/** PokemonIv or a function that returns PokemonIv (created lazily). */
type IvSource = PokemonIv | (() => PokemonIv);

function resolve(iv: IvSource): PokemonIv {
	return typeof iv === "function" ? iv() : iv;
}

/**
 * Calculates the amount for many individuals of the same Pokémon.
 *
 * The calculation is split into the parts below, and each part is shared
 * between individuals that have the same effects:
 *
 * - Energy: Energy Recovery Bonus and nature (energy)
 * - Help count plan: helping speed, Helping Bonus, nature (speed) and energy
 * - Inventory simulation: inventory, ingredient finder, Berry Finding S
 *   and nature (ingredient)
 * - Skill rate: skill trigger and nature (skill)
 */
class AmountCalculator {
	private readonly param: StrengthParameter;
	private readonly bonus: BonusEffectsWithReason;
	private readonly isWhistle: boolean;

	private readonly energies = new Map<number, EnergyResult>();
	/** Plan ID for each plan code (plans with the same content share an ID) */
	private readonly planIds = new Map<number, number>();
	/** Plans indexed by plan ID (null if the base frequency is 0) */
	private readonly plans: (HelpCountPlan | null)[] = [];
	/** Plan ID for each plan content */
	private readonly planKeyToId = new Map<string, number>();
	private readonly simulations = new Map<number, HelpCountSimulation>();
	private readonly skillRates = new Map<number, number>();
	private readonly berryIngs = new Map<number, [number, number]>();
	private readonly skills = new Map<number, number>();

	constructor(
		param: StrengthParameter,
		bonus: BonusEffectsWithReason,
		isWhistle: boolean,
	) {
		this.param = param;
		this.bonus = bonus;
		this.isWhistle = isWhistle;
	}

	/** Code that determines the energy (0-5). */
	private static energyCode(s: SubSkillFeature, n: NatureFeature): number {
		return s.energyRecovery * 3 + n.energy;
	}

	/** Code that determines the help count plan (0-143). */
	private static planCode(s: SubSkillFeature, n: NatureFeature): number {
		return (
			((s.helpingSpeed * 2 + s.helpingBonus) * 3 + n.speed) * 6 +
			AmountCalculator.energyCode(s, n)
		);
	}

	/** Code that determines the inventory simulation (0-167). */
	private static simCode(s: SubSkillFeature, n: NatureFeature): number {
		return (
			((s.inventory * 4 + s.ingredientFinder) * 3 + n.ingredient) * 2 +
			s.berryFinding
		);
	}

	/** Code that determines the skill rate (0-11). */
	private static skillCode(s: SubSkillFeature, n: NatureFeature): number {
		return s.skillTrigger * 3 + n.skill;
	}

	/** Key that determines the berry and ingredient amount. */
	private berryIngKey(
		s: SubSkillFeature,
		n: NatureFeature,
		iv: IvSource,
	): number {
		return (
			this.getPlanId(s, n, iv) * simCodeCount + AmountCalculator.simCode(s, n)
		);
	}

	/** Key that determines the skill amount. */
	private skillKey(s: SubSkillFeature, n: NatureFeature, iv: IvSource): number {
		return (
			this.berryIngKey(s, n, iv) * skillCodeCount +
			AmountCalculator.skillCode(s, n)
		);
	}

	/**
	 * Calculate the berry and ingredient amount.
	 * @param s Sub-skill feature.
	 * @param n Nature feature.
	 * @param iv PokemonIv that has the given features.
	 * @returns [berry, ingredient]
	 */
	berryIngredient(
		s: SubSkillFeature,
		n: NatureFeature,
		iv: IvSource,
	): [number, number] {
		// Create PokemonIv only once
		let resolved: PokemonIv | undefined;
		const lazyIv = () => {
			resolved ??= resolve(iv);
			return resolved;
		};

		const key = this.berryIngKey(s, n, lazyIv);
		const cached = this.berryIngs.get(key);
		if (cached !== undefined) {
			return cached;
		}

		const ivForCalc = lazyIv();
		const result = calculateHelpCount(
			ivForCalc,
			this.param,
			this.getEnergy(s, n, ivForCalc),
			this.bonus,
			this.isWhistle,
			this.getSimulation(s, n, ivForCalc),
			this.plans[this.getPlanId(s, n, ivForCalc)] ?? undefined,
		);
		const ret: [number, number] = [
			result.berryCount + result.bigBerryCount,
			result.ingredients.reduce((p, c) => p + c.count, 0),
		];
		this.berryIngs.set(key, ret);
		return ret;
	}

	/**
	 * Calculate the skill count.
	 * @param s Sub-skill feature.
	 * @param n Nature feature.
	 * @param iv PokemonIv that has the given features.
	 * @returns Skill count.
	 */
	skill(s: SubSkillFeature, n: NatureFeature, iv: IvSource): number {
		// Create PokemonIv only once
		let resolved: PokemonIv | undefined;
		const lazyIv = () => {
			resolved ??= resolve(iv);
			return resolved;
		};

		const key = this.skillKey(s, n, lazyIv);
		const cached = this.skills.get(key);
		if (cached !== undefined) {
			return cached;
		}

		const skillCode = AmountCalculator.skillCode(s, n);
		let skillRate = this.skillRates.get(skillCode);
		if (skillRate === undefined) {
			skillRate = calculateOverallSkillRate(lazyIv(), this.param, this.bonus);
			this.skillRates.set(skillCode, skillRate);
		}

		const plan = this.plans[this.getPlanId(s, n, lazyIv)];
		const ret =
			plan === null
				? 0
				: calculateSkillCountFromPlan(
						plan,
						this.getSimulation(s, n, lazyIv),
						skillRate,
					);
		this.skills.set(key, ret);
		return ret;
	}

	/**
	 * Release the inventory simulations to save memory.
	 * The amounts already calculated are kept.
	 */
	releaseSimulations() {
		this.simulations.clear();
	}

	/** Calculate the amount for the given individual. */
	amount(iv: PokemonIv): Amount {
		const s = getSubSkillFeature(iv.activeSubSkills);
		const n = getNatureFeature(iv.nature);
		const [berry, ingredient] = this.berryIngredient(s, n, iv);
		return { berry, ingredient, skill: this.skill(s, n, iv) };
	}

	private getEnergy(
		s: SubSkillFeature,
		n: NatureFeature,
		iv: IvSource,
	): EnergyResult {
		const code = AmountCalculator.energyCode(s, n);
		let ret = this.energies.get(code);
		if (ret === undefined) {
			ret = new Energy(resolve(iv)).calculate(this.param, this.bonus);
			this.energies.set(code, ret);
		}
		return ret;
	}

	/**
	 * Returns the plan ID. Plans that have the same content share the ID
	 * (ex: energy is the same when energy is always full).
	 */
	private getPlanId(
		s: SubSkillFeature,
		n: NatureFeature,
		iv: IvSource,
	): number {
		const code = AmountCalculator.planCode(s, n);
		let id = this.planIds.get(code);
		if (id !== undefined) {
			return id;
		}

		const resolved = resolve(iv);
		const { baseFreq } = calculateBaseFreqAndBonus(
			resolved,
			this.param,
			this.bonus,
			this.isWhistle,
		);
		const plan =
			baseFreq <= 0
				? null
				: createHelpCountPlan(
						this.param,
						baseFreq,
						this.getEnergy(s, n, resolved),
						this.isWhistle,
					);
		const planKey = JSON.stringify(plan);
		id = this.planKeyToId.get(planKey);
		if (id === undefined) {
			id = this.plans.length;
			this.plans.push(plan);
			this.planKeyToId.set(planKey, id);
		}
		this.planIds.set(code, id);
		return id;
	}

	private getSimulation(
		s: SubSkillFeature,
		n: NatureFeature,
		iv: IvSource,
	): HelpCountSimulation {
		const code = AmountCalculator.simCode(s, n);
		let ret = this.simulations.get(code);
		if (ret === undefined) {
			ret = createHelpCountSimulation(resolve(iv), this.param, this.bonus);
			this.simulations.set(code, ret);
		}
		return ret;
	}
}

/** Amount of individuals and their probability. */
interface Distribution {
	values: Float64Array;
	weights: Float64Array;
}

/** Distribution of the amount over all individuals. */
export interface RatingDistribution {
	berry: Distribution;
	ingredient: Distribution;
	skill: Distribution;
}

/**
 * Returns the percentage of individuals whose value is greater than or
 * equal to the given value.
 */
function getTopPercent(dist: Distribution, value: number): number {
	// Treat values with tiny floating point error as the same value
	const threshold = value - 1e-9 * Math.max(1, Math.abs(value));
	let sum = 0;
	for (let i = 0; i < dist.values.length; i++) {
		if (dist.values[i] >= threshold) {
			sum += dist.weights[i];
		}
	}
	return Math.min(100, sum * 100);
}

interface CacheEntry {
	calculator: AmountCalculator;
	distribution: RatingDistribution;
}

const distributionCache = new WeakMap<
	StrengthParameter,
	Map<string, CacheEntry>
>();

/** Maximum number of distributions cached per StrengthParameter. */
const maxCacheCount = 4;

/**
 * Rating calculator.
 *
 * Compares the amount of berries, ingredients and skills of the Pokémon
 * with all individuals (all combinations of sub-skills and natures) of the
 * same Pokémon, level and ingredients, using the given StrengthParameter.
 * All combinations are assumed to be equally likely.
 */
class PokemonRating {
	private readonly iv: PokemonIv;
	private readonly param: StrengthParameter;
	private readonly originalParam: StrengthParameter;
	private readonly bonus: BonusEffectsWithReason;

	constructor(pokemonIv: PokemonIv, param: StrengthParameter) {
		const strength = new PokemonStrength(pokemonIv, param);
		this.iv = strength.pokemonIv;
		this.param = strength.parameter;
		this.originalParam = param;
		this.bonus = strength.bonusEffects;
	}

	calculate(): RatingResult {
		const iv = this.iv;
		if (iv.pokemon.frequency === 0) {
			const zero = { value: 0, topPercent: 100 };
			return {
				berry: zero,
				ingredient: zero,
				skill: zero,
				berryRate: 0,
				ingRate: 0,
				skillRate: 0,
			};
		}

		const { calculator, distribution } = this.getCacheEntry();
		const amount = calculator.amount(iv);
		return {
			berry: {
				value: amount.berry,
				topPercent: getTopPercent(distribution.berry, amount.berry),
			},
			ingredient: {
				value: amount.ingredient,
				topPercent: getTopPercent(distribution.ingredient, amount.ingredient),
			},
			skill: {
				value: amount.skill,
				topPercent: getTopPercent(distribution.skill, amount.skill),
			},
			berryRate: iv.berryRate,
			ingRate: iv.ingredientRate,
			skillRate: iv.skillRate,
		};
	}

	private getCacheEntry(): CacheEntry {
		// Sub-skills and nature don't change the distribution
		const { subSkills: _s, nature: _n, ...props } = this.iv.toProps();
		const key = JSON.stringify(props);
		let cache = distributionCache.get(this.originalParam);
		if (cache === undefined) {
			cache = new Map();
			distributionCache.set(this.originalParam, cache);
		}
		const cached = cache.get(key);
		if (cached !== undefined) {
			return cached;
		}

		const calculator = this.createCalculator();
		const distribution = this.calculateDistribution(calculator);
		// All individuals are already calculated
		calculator.releaseSimulations();
		const entry = { calculator, distribution };
		if (cache.size >= maxCacheCount) {
			const firstKey = cache.keys().next().value;
			if (firstKey !== undefined) {
				cache.delete(firstKey);
			}
		}
		cache.set(key, entry);
		return entry;
	}

	private createCalculator(): AmountCalculator {
		return new AmountCalculator(
			this.param,
			this.bonus,
			this.originalParam.period === whistlePeriod,
		);
	}

	/**
	 * Calculate the distribution of the amount over all individuals.
	 * @param calculator Calculator to be used.
	 * @returns Distribution of the amount.
	 */
	calculateDistribution(
		calculator: AmountCalculator = this.createCalculator(),
	): RatingDistribution {
		const subSkillGroups = enumerateSubSkillGroups(this.iv.level);
		const natureGroups = enumerateNatureGroups();
		const count = subSkillGroups.length * natureGroups.length;
		const weights = new Float64Array(count);
		const berry = new Float64Array(count);
		const ingredient = new Float64Array(count);
		const skill = new Float64Array(count);
		let index = 0;
		for (const s of subSkillGroups) {
			for (const n of natureGroups) {
				// PokemonIv is created only when the amount is not cached
				const iv = () =>
					this.iv.clone({ subSkills: s.subSkills, nature: n.nature });
				const [b, i] = calculator.berryIngredient(s, n, iv);
				weights[index] = s.weight * n.weight;
				berry[index] = b;
				ingredient[index] = i;
				skill[index] = calculator.skill(s, n, iv);
				index++;
			}
		}
		return {
			berry: { values: berry, weights },
			ingredient: { values: ingredient, weights },
			skill: { values: skill, weights },
		};
	}
}

export default PokemonRating;
