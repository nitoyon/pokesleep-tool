import {IngredientName, PokemonData, PokemonType} from '../data/pokemons';
import PokemonIv from './PokemonIv';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

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
};

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

export interface RpCalculateResult {
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
 */
class PokemonRp {
    /** Name of the pokemon (English). */
    private _pokemonName: string;
    private _pokemon: PokemonData;
    /** Current level of the pokemon. */
    level: number;
    /** Current skill level of the pokemon. */
    skillLevel: number;
    ingredient: IngredientType;

    /** Sub skill list. */
    subSkills: SubSkillList;

    /** Nature of the pokemon */
    nature: Nature|null;

    get pokemonName(): string {
        return this._pokemonName;
    }

    get pokemon(): PokemonData {
        return this._pokemon;
    }

    constructor(pokemonIv: PokemonIv) {
        this._pokemonName = pokemonIv.pokemonName;
        this._pokemon = pokemonIv.pokemon;

        this.level = pokemonIv.level;
        this.skillLevel = pokemonIv.skillLevel;
        this.ingredient = pokemonIv.ingredient;
        this.subSkills = pokemonIv.subSkills;
        this.nature = pokemonIv.nature;
    }

    calculate(): RpCalculateResult {
        const frequency = this.frequency;
        const bonus = this.bonus;
        const ingredientRp = this.ingredientRp;
        const berryRp = this.berryRp;
        const skillRp = this.skillRp;
        const rp = Math.round((ingredientRp + berryRp + skillRp) * bonus);

        return {
            rp, frequency,
            ingredientRp: trunc(ingredientRp * bonus, 1),
            berryRp: trunc(berryRp * bonus, 1),
            skillRp: trunc(skillRp * bonus, 1),
        };
    }

    get Rp(): number {
        return Math.round(
            (this.ingredientRp + this.berryRp + this.skillRp) *
            this.bonus);
    }

    get activeSubSkills(): SubSkill[] {
        return this.subSkills.getActiveSubSkills(this.level);
    }

    get helpCountPer5Hour(): number {
        return 5 * trunc(3600 / this.frequency, 2);
    }

    get frequency(): number {
        return this._pokemon.frequency * // Base frequency
            trunc(
                // Level Factor
                (501 - this.level) / 500 *
                // Nature Factor
                (this.nature?.speedOfHelpFactor ?? 1) *
                // Sub-Skill Factor
                (1 - this.activeSubSkills.reduce((p, c) => p + c.helpingSpeed, 0) * 0.07)
            , 4);
    }

    frequencyWithHelpingBonus(count: number): number {
        const helpingSpeed = this.activeSubSkills
            .reduce((p, c) => p + c.helpingSpeed, 0) * 0.07;
        if (this.hasHelpingBonusInActiveSubSkills) {
            count++;
        }
        const subSkillFactor = Math.min(helpingSpeed + 0.05 * count, 0.35);

        return this._pokemon.frequency * // Base frequency
            trunc(
                // Level Factor
                (501 - this.level) / 500 *
                // Nature Factor
                (this.nature?.speedOfHelpFactor ?? 1) *
                // Sub-Skill Factor
                (1 - subSkillFactor)
            , 4);
    }

    get hasHelpingBonusInActiveSubSkills(): boolean {
        return this.activeSubSkills.some(x => x.name === "Helping Bonus");
    }

    get bonus(): number {
        const energy = 1 + ((this.nature?.energyRecoveryFactor ?? 0) * 0.08);
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
        return trunc(energy * (1 + subSkillBonus), 2);
    }

    get ingredientRp(): number {
        return trunc(
            this.helpCountPer5Hour * this.ingredientRatio *
            this.ingredientEnergy * this.ingredientG,
            2);
    }

    get ingredientRatio(): number {
        return trunc(
            this._pokemon.ingRatio / 100 *
            // Nature Factor
            (this.nature?.ingredientFindingFactor ?? 1) *
            // Sub-Skill Factor
            (1 + this.activeSubSkills.reduce((p, c) => p + c.ingredientFinder, 0) * 0.18),
            4);
    }

    get ingredientEnergy(): number {
        const ing1 = this.ingredient1;
        const e1 = ingredientStrength[ing1.name] * ing1.count;
        if (this.level < 30) {
            return e1;
        }

        const ing2 = this.ingredient2;
        const e2 = ingredientStrength[ing2.name] * ing2.count;
        if (this.level < 60) {
            return Math.floor((e1 + e2) / 2);
        }

        const ing3 = this.ingredient3;
        const e3 = ingredientStrength[ing3.name] * ing3.count;
        return Math.floor((e1 + e2 + e3) / 3);
    }

    get ingredient1() {
        return {
            name: this._pokemon.ing1.name,
            count: this._pokemon.ing1.c1,
        };
    }

    get ingredient2() {
        const ing2 = this.ingredient.charAt(1) === 'A' ?
            this._pokemon.ing1 : this._pokemon.ing2;
        return { name: ing2.name, count: ing2.c2 };
    }

    get ingredient3() {
        const ing3 = this.ingredient.charAt(2) === 'A' ? this._pokemon.ing1 :
            this.ingredient.charAt(2) === 'B' ?
            this._pokemon.ing2 : this._pokemon.ing3;
        if (ing3 === undefined) { throw new Error("this pokemon doesn't have 3rd ing"); }
        return { name: ing3.name, count: ing3.c3 };
    }

    get ingredientG(): number {
        const table = [1.000,1.003,1.007,1.011,1.016,1.021,1.027,1.033,1.039,1.046,1.053,
            1.061,1.069,1.077,1.085,1.094,1.104,1.114,1.124,1.134,1.145,1.156,
            1.168,1.180,1.192,1.205,1.218,1.231,1.245,1.259,1.274,1.288,1.303,
            1.319,1.335,1.351,1.368,1.385,1.402,1.420,1.439,1.457,1.477,1.496,
            1.517,1.537,1.558,1.580,1.602,1.625,1.648,1.671,1.696,1.720,1.745];
        if (this.level - 1 < table.length) {
            return table[this.level - 1];
        }
        // assumption: RP collection's 'Ingr Growth' sheet
        return 0.000000398 * Math.pow(this.level, 3) +
            0.000159 * Math.pow(this.level, 2) +
            0.00367 * this.level - 0.00609 + 1;
    }

    get berryRp(): number {
        return trunc(
            this.helpCountPer5Hour * this.berryRatio *
            this.berryStrength * this.berryCount,
            2);
    }
    
    get berryRatio(): number {
        return 1 - this.ingredientRatio;
    }

    get berryCount(): number {
        return (this._pokemon.speciality === "Berries" ? 2 : 1) +
            (this.activeSubSkills.some(s => s.isBFS) ? 1 : 0);
    }

    get berryStrength(): number {
        const b0 = berryStrength[this._pokemon.type]; 
        return Math.max(
            b0 + this.level - 1,
            Math.round(Math.pow(1.025, this.level - 1) * b0)
        );
    }

    get skillRp(): number {
        return trunc(
            this.helpCountPer5Hour * this.skillRatio * this.skillValue,
            2);
    }

    get skillRatio(): number {
        return trunc(
            this._pokemon.skillRatio / 100 *
            (this.nature?.mainSkillChanceFactor ?? 1) *
            (1 + this.activeSubSkills.reduce((p, c) => p + c.skillTrigger, 0) * 0.18),
            4);
    }

    get skillValue(): number {
        if (this._pokemon.skill === "Charge Strength S" ||
            this._pokemon.skill === "Charge Strength S (Random)" ||
            this._pokemon.skill === "Charge Energy S") {
            return [400, 569, 785, 1083, 1496, 2066, 2656][this.skillLevel - 1];
        }
        if (this._pokemon.skill === "Energy for Everyone S") {
            return [1120, 1593, 2197, 3033, 4187, 5785][this.skillLevel - 1];
        }
        if (this._pokemon.skill === "Helper Boost") {
            return [2800, 3902, 5273, 6975, 9317, 12438][this.skillLevel - 1];
        }
        return [880, 1251, 1726, 2383, 3290, 4546, 5843][this.skillLevel - 1];
    }
}

function trunc(v: number, n: number) {
    return parseFloat(v.toFixed(n));
}

export default PokemonRp;
