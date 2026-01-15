import {IngredientName, PokemonData, PokemonType} from '../data/pokemons';
import PokemonIv from './PokemonIv';
import SubSkill from './SubSkill';

export const maxLevel = 65;

export const ingredientStrength: {[ing in IngredientName]: number} = {
    "leek": 185,
    "mushroom": 167,
    "egg": 115,
    "potato": 124,
    "apple": 90,
    "herb": 130,
    "sausage": 103,
    "milk": 98,
    "honey": 101,
    "oil": 121,
    "ginger": 109,
    "tomato": 110,
    "cacao": 151,
    "tail": 342,
    "soy": 100,
    "corn": 140,
    "coffee": 153,
    "pumpkin": 250,
    "avocado": 162,
    "unknown": 0,
    "unknown1": 0,
    "unknown2": 0,
    "unknown3": 0,
};

/**
 * Average ingredient strength excluding unknown ingredients.
 */
export const averageIngredientStrength: number = (() => {
    const ingredients = Object.entries(ingredientStrength)
        .filter(([name]) => !name.startsWith('unknown'));

    const total = ingredients.reduce((sum, [, strength]) => sum + strength, 0);
    return total / ingredients.length;
})();

const berryStrength: {[type in PokemonType]: number} = {
    "normal": 28,
    "fire": 27,
    "water": 31,
    "electric": 25,
    "grass": 30,
    "ice": 32,
    "fighting": 27,
    "poison": 32,
    "ground": 29,
    "flying": 24,
    "psychic": 26,
    "bug": 24,
    "rock": 30,
    "ghost": 26,
    "dragon": 35,
    "dark": 31,
    "steel": 33,
    "fairy": 26,
};

export type IngredientType = "AAA" | "AAB" | "AAC" |
    "ABA" | "ABB" | "ABC";

export const IngredientTypes: IngredientType[] = ["AAA", "AAB", "AAC", "ABA", "ABB", "ABC"];

export interface RpStrengthResult {
    rp: number;
    berryRp: number;
    ingredientRp: number;
    skillRp: number;
    frequency: number;
}

/**
 * RP calculator.
 *
 * (ref) https://pks.raenonx.cc/en/docs/view/help/rp-model
 *
 * This class is immutable. Once created, instances cannot be modified.
 * This immutability depends on PokemonIv also being immutable.
 */
class PokemonRp {
    readonly iv: PokemonIv;

    private readonly cache: Map<string, number> = new Map();

    get pokemonName(): string {
        return this.iv.pokemonName;
    }

    get pokemon(): PokemonData {
        return this.iv.pokemon;
    }

    get isMythical(): boolean {
        return this.iv.pokemon.mythIng !== undefined;;
    }

    constructor(pokemonIv: PokemonIv) {
        this.iv = pokemonIv;
    }

    private getOrCache(
        key: string,
        compute: () => number
    ): number {
        const cached = this.cache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const value = compute();
        this.cache.set(key, value);
        return value;
    }

    calculate(): RpStrengthResult {
        const frequency = this.frequency;
        const bonus = this.bonus;
        const ingredientRp = this.ingredientRp;
        const berryRp = this.berryRp;
        const skillRp = this.skillRp;
        const rp = this.Rp;

        return {
            rp, frequency,
            ingredientRp: trunc(ingredientRp * bonus, 1),
            berryRp: trunc(berryRp * bonus, 1),
            skillRp: trunc(skillRp * bonus, 1),
        };
    }

    get Rp(): number {
        return this.getOrCache('Rp', () => {
            // Handling floating-point errors (* 100 and / 100)
            return Math.round((
                multiplyBy100(this.ingredientRp) +
                multiplyBy100(this.berryRp) +
                multiplyBy100(this.skillRp)
            ) * multiplyBy100(this.bonus) / 10000);
        });
    }

    get activeSubSkills(): SubSkill[] {
        return this.iv.activeSubSkills;
    }

    get helpCountPer5Hour(): number {
        return this.getOrCache('helpCountPer5Hour', () => {
            const frequency = this.frequency;
            if (frequency === 0) {
                return 0;
            }
            return 5 * trunc(3600 / frequency, 2);
        });
    }

    get frequency(): number {
        return this.getOrCache('frequency', () => {
            // 0.1 diff when base frequency is 2600 and level 10.
            const uglyHack = (this.iv.level === 10 && this.iv.pokemon.frequency === 2600 ? 0.1 : 0);

            return this.iv.pokemon.frequency * // Base frequency
                trunc(
                    // Level Factor
                    (501 - this.iv.level) / 500 *
                    // Nature Factor
                    (this.iv.nature?.speedOfHelpFactor ?? 1) *
                    // Good-Night Ribbon Factor
                    this.iv.speedOfRibbonFactor *
                    // Sub-Skill Factor
                    (1 - this.activeSubSkills.reduce((p, c) => p + c.helpingSpeed, 0) * 0.07)
                , 4) -
                // ugly hack to fix 2553.2 -> 2553.1
                uglyHack;
        });
    }

    get hasHelpingBonusInActiveSubSkills(): boolean {
        return this.activeSubSkills.some(x => x.name === "Helping Bonus");
    }

    get bonus(): number {
        return this.getOrCache('bonus', () => {
            return trunc(this.energyBonus * this.subSkillBonus, 2);
        });
    }

    get energyBonus(): number {
        return this.getOrCache('energyBonus', () => {
            if (this.iv.nature?.isEnergyRecoveryUp) {
                return 1.08;
            }
            if (this.iv.nature?.isEnergyRecoveryDown) {
                return 0.92;
            }
            return 1;
        });
    }

    get subSkillBonus(): number {
        return this.getOrCache('subSkillBonus', () => {
            let subSkillBonus = 0;
            for (const subSkill of this.activeSubSkills) {
                switch (subSkill.inventory) {
                    case 3: subSkillBonus += 0.181; break;
                    case 2: subSkillBonus += 0.139; break;
                    case 1: subSkillBonus += 0.071; break;
                }
                if (subSkill.isBonus) {
                    subSkillBonus += 0.221;
                }
            }
            return 1 + subSkillBonus;
        });
    }

    get ingredientRp(): number {
        return this.getOrCache('ingredientRp', () => {
            return trunc(
                this.helpCountPer5Hour * this.iv.ingredientRate *
                this.ingredientEnergy * this.ingredientG,
                2);
        });
    }

    get ingredientEnergy(): number {
        return this.getOrCache('ingredientEnergy', () => {
            const ing1 = this.iv.ingredient1;
            const e1 = ingredientStrength[ing1.name] * ing1.count;
            let count = 1;
            if (this.iv.level < 30) {
                return e1;
            }

            const ing2 = this.iv.ingredient2;
            const e2 = ingredientStrength[ing2.name] * ing2.count;
            if (e2 > 0) {
                count++;
            }
            if (this.iv.level < 60) {
                return Math.floor((e1 + e2) / count);
            }

            const ing3 = this.iv.ingredient3;
            const e3 = ingredientStrength[ing3.name] * ing3.count;
            if (e3 > 0) {
                count++;
            }
            return Math.floor((e1 + e2 + e3) / count);
        });
    }

    get ingredientG(): number {
        return this.getOrCache('ingredientG', () => {
            const table = [1.000,1.003,1.007,1.011,1.016,1.021,1.027,1.033,1.039,1.046,1.053,
                1.061,1.069,1.077,1.085,1.094,1.104,1.114,1.124,1.134,1.145,1.156,
                1.168,1.180,1.192,1.205,1.218,1.231,1.245,1.259,1.274,1.288,1.303,
                1.319,1.335,1.351,1.368,1.385,1.402,1.420,1.439,1.457,1.477,1.496,
                1.517,1.537,1.558,1.580,1.602,1.625,1.648,1.671,1.696,1.720,1.745,
                1.771,1.798,1.824,1.852,1.880,1.927,1.975,2.024,2.075,2.127,
                // Expected values by ChatGPT
                2.180, 2.234, 2.289, 2.345, 2.402, 2.460, 2.519, 2.579, 2.640, 2.702,
                2.765, 2.829, 2.894, 2.960, 3.027, 3.095, 3.164, 3.234, 3.305, 3.377,
                3.450, 3.524, 3.599, 3.675, 3.752, 3.830, 3.909, 3.989, 4.070, 4.152,
                4.235, 4.319, 4.404, 4.490, 4.577
            ];
            if (this.iv.level - 1 < table.length) {
                return table[this.iv.level - 1];
            }
            // assumption: RP collection's 'Ingr Growth' sheet
            return 0.000000398 * Math.pow(this.iv.level, 3) +
                0.000159 * Math.pow(this.iv.level, 2) +
                0.00367 * this.iv.level - 0.00609 + 1;
        });
    }

    get berryRp(): number {
        return this.getOrCache('berryRp', () => {
            return trunc(
                this.helpCountPer5Hour * this.iv.berryRate *
                this.berryStrength * this.iv.berryCount,
                2);
        });
    }

    get berryStrength(): number {
        return this.getOrCache('berryStrength', () => {
            const b0 = berryStrength[this.iv.pokemon.type];
            return Math.max(
                b0 + this.iv.level - 1,
                Math.round(Math.pow(1.025, this.iv.level - 1) * b0)
            );
        });
    }

    get skillRp(): number {
        return this.getOrCache('skillRp', () => {
            return trunc(
                this.helpCountPer5Hour * this.iv.skillRate * this.skillValue,
                2);
        });
    }

    /**
     * Get skill value used in RP calculation.
     *
     * Actual value is implemented in `getSkillValue` function in
     * PokemonStrength.ts.
     */
    get skillValue(): number {
        return this.getOrCache('skillValue', () => {
            if (this.iv.pokemon.skill === "Charge Strength S" ||
                this.iv.pokemon.skill === "Charge Strength S (Random)" ||
                this.iv.pokemon.skill === "Charge Energy S") {
                return [400, 569, 785, 1083, 1496, 2066, 2656][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Charge Energy S (Moonlight)") {
                return [560, 797, 1099, 1516, 2094, 2892][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Charge Strength S (Stockpile)" ||
                this.iv.pokemon.skill === "Skill Copy (Transform)" ||
                this.iv.pokemon.skill === "Skill Copy (Mimic)"
            ) {
                return [600, 853, 1177, 1625, 2243, 3099, 3984][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Energy for Everyone S") {
                return [1120, 1593, 2197, 3033, 4187, 5785][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Helper Boost") {
                return [2800, 3902, 5273, 6975, 9317, 12438][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Berry Burst (Disguise)" ||
                this.iv.pokemon.skill === "Berry Burst" ||
                this.iv.pokemon.skill === "Energy for Everyone S (Lunar Blessing)"
            ) {
                return [1400, 1991, 2747, 3791, 5234, 7232][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Charge Strength M (Bad Dreams)") {
                return [2400, 3313, 4643, 6441, 8864, 11878, 13140][this.iv.skillLevel - 1];
            }
            if (this.iv.pokemon.skill === "Energizing Cheer S") {
                return [766, 1089, 1502, 2074, 2863, 3956][this.iv.skillLevel - 1];
            }
            return [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303][this.iv.skillLevel - 1];
        });
    }
}

export function trunc(v: number, n: number) {
    const N = Math.pow(10, n);
    // fix round error
    // (ex) v=0.051, n=4, v*N -> 509.999999
    //      (v*N).toFixed(3) -> 510.000
    const d = parseFloat((v * N).toFixed(6));
    return Math.floor(d) / N;
}

/**
 * Multiplies a number by 100 with precision handling.
 *
 * In JavaScript, multiplying floating-point numbers can result in
 * imprecise values.
 * For example, 1.3 * 100 may return 129.99999999999997 instead of 130.
 * This function ensures a precise result by rounding to 6 decimal places.
 *
 * @param n - The number to be multiplied.
 * @returns The result of n multiplied by 100, rounded to 6 decimal places.
 */
function multiplyBy100(n: number): number {
    return parseFloat((n * 100).toFixed(6));
}

export default PokemonRp;
