import { PokemonData } from '../data/pokemons';
import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

interface RatingStrengthResult {
    berryScore: number;
    berryMax: number;
    berryCur: number;
    berryRate: number;
    ingScore: number;
    ingMax: number;
    ingCur: number;
    ingRate: number;
    skillScore: number;
    skillMax: number;
    skillCur: number;
    skillRate: number;
}

/**
 * Rating calculator.
 */
class PokemonRating {
    private pokemon: PokemonData;
    private iv: PokemonIv;
    private rp: PokemonRp;

    constructor(pokemonIv: PokemonIv) {
        this.pokemon = pokemonIv.pokemon;
        this.iv = pokemonIv;
        this.rp = new PokemonRp(pokemonIv);
    }

    calculate(): RatingStrengthResult {
        if (this.pokemon.frequency === 0) {
            return {
                berryScore: 0, berryMax: 0, berryCur: 0, berryRate: 0,
                ingScore: 0, ingMax: 0, ingCur: 0, ingRate: 0,
                skillScore: 0, skillMax: 0, skillCur: 0, skillRate: 0,
            };
        }

        const berryMaxRp = new PokemonRp(this.iv.clone({
            subSkills: new SubSkillList({
                lv10: new SubSkill("Berry Finding S"),
                lv25: new SubSkill("Helping Bonus"),
                lv50: new SubSkill("Helping Speed M"),
                lv75: new SubSkill("Helping Speed S"),
            }),
            nature: new Nature("Adamant"),
        }));

        const ingMaxRp = new PokemonRp(this.iv.clone({
            subSkills: new SubSkillList({
                lv10: new SubSkill("Ingredient Finder M"),
                lv25: new SubSkill("Ingredient Finder S"),
                lv50: new SubSkill("Helping Speed M"),
                lv75: new SubSkill("Helping Speed S"),
                lv100: new SubSkill("Helping Bonus"),
            }),
            nature: new Nature("Quiet"),
        }));

        const skillMaxRp = new PokemonRp(this.iv.clone({
            subSkills: new SubSkillList({
                lv10: new SubSkill("Skill Trigger M"),
                lv25: new SubSkill("Skill Trigger S"),
                lv50: new SubSkill("Helping Speed M"),
                lv75: new SubSkill("Helping Speed S"),
                lv100: new SubSkill("Helping Bonus"),
            }),
            nature: new Nature("Sassy"),
        }));

        const berryCalc = (rp: PokemonRp) => {
            let ret = (3600 / rp.iv.frequencyWithHelpingBonus(0)) *
                rp.berryRate * rp.berryCount;
            if (rp.hasHelpingBonusInActiveSubSkills) {
                // Helping bonus add more energy (6 more berries * 5% bonus)
                // 6 more = 2 berry * 2 pokemon + 1 berry * 2 pokemon
                ret += ret / rp.berryCount * 6 * 0.0526;
            }
            return ret;
        }
        const berryMax = berryCalc(berryMaxRp);
        const berryCur = berryCalc(this.rp);
        const berryScore = berryCur / berryMax * 100;
        const berryRate = this.rp.berryRate;

        const ingCalc = (rp: PokemonRp) => (3600 / rp.iv.frequencyWithHelpingBonus(0)) * rp.iv.ingredientRate;
        const ingMax = ingCalc(ingMaxRp);
        const ingCur = ingCalc(this.rp);
        const ingScore = ingCur / ingMax * 100;
        const ingRate = this.rp.iv.ingredientRate;

        const skillCalc = (rp: PokemonRp) => (3600 / rp.iv.frequencyWithHelpingBonus(0)) * rp.iv.skillRate;
        const skillMax = skillCalc(skillMaxRp);
        const skillCur = skillCalc(this.rp);
        const skillScore = skillCur / skillMax * 100;
        const skillRate = this.rp.iv.skillRate;
        return {
            berryScore, berryMax, berryCur, berryRate,
            ingScore, ingMax, ingCur, ingRate,
            skillScore, skillMax, skillCur, skillRate,
        };
    }
}

export default PokemonRating;
