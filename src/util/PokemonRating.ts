import { PokemonData } from '../data/pokemons';
import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

interface RatingCalculateResult {
    berryScore: number;
    berryMax: number;
    berryCur: number;
    berryRatio: number;
    ingScore: number;
    ingMax: number;
    ingCur: number;
    ingRatio: number;
    skillScore: number;
    skillMax: number;
    skillCur: number;
    skillRatio: number;
}

/**
 * Rating calculator.
 */
class PokemonRating {
    /** Name of the pokemon (English). */
    private pokemonName: string;
    private pokemon: PokemonData;
    private iv: PokemonIv;
    private rp: PokemonRp;

    constructor(pokemonIv: PokemonIv) {
        this.pokemonName = pokemonIv.pokemonName;
        this.pokemon = pokemonIv.pokemon;
        this.iv = pokemonIv;
        this.rp = new PokemonRp(pokemonIv);
    }

    calculate(): RatingCalculateResult {
        const berryMaxRp = new PokemonRp(this.iv);
        berryMaxRp.subSkills = new SubSkillList([
            new SubSkill("Berry Finding S"),
            new SubSkill("Helping Bonus"),
            new SubSkill("Helping Speed M"),
            new SubSkill("Helping Speed S"),
            null]);
        berryMaxRp.nature = new Nature("Adamant");

        const ingMaxRp = new PokemonRp(this.iv);
        ingMaxRp.subSkills = new SubSkillList([
            new SubSkill("Ingredient Finder M"),
            new SubSkill("Ingredient Finder S"),
            new SubSkill("Helping Speed M"),
            new SubSkill("Helping Speed S"),
            new SubSkill("Helping Bonus")])
        ingMaxRp.nature = new Nature("Quiet");

        const skillMaxRp = new PokemonRp(this.iv);
        skillMaxRp.subSkills = new SubSkillList([
            new SubSkill("Skill Trigger M"),
            new SubSkill("Skill Trigger S"),
            new SubSkill("Helping Speed M"),
            new SubSkill("Helping Speed S"),
            new SubSkill("Helping Bonus")])
        skillMaxRp.nature = new Nature("Sassy");

        const berryCalc = (rp: PokemonRp) => {
            let ret = (3600 / rp.frequencyWithHelpingBonus(0)) *
                rp.berryRatio * rp.berryCount;
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
        const berryRatio = this.rp.berryRatio;

        const ingCalc = (rp: PokemonRp) => (3600 / rp.frequencyWithHelpingBonus(0)) * rp.ingredientRatio;
        const ingMax = ingCalc(ingMaxRp);
        const ingCur = ingCalc(this.rp);
        const ingScore = ingCur / ingMax * 100;
        const ingRatio = this.rp.ingredientRatio;

        const skillCalc = (rp: PokemonRp) => (3600 / rp.frequencyWithHelpingBonus(0)) * rp.skillRatio;
        const skillMax = skillCalc(skillMaxRp);
        const skillCur = skillCalc(this.rp);
        const skillScore = skillCur / skillMax * 100;
        const skillRatio = this.rp.skillRatio;
        return {
            berryScore, berryMax, berryCur, berryRatio,
            ingScore, ingMax, ingCur, ingRatio,
            skillScore, skillMax, skillCur, skillRatio,
        };
    }
}

export default PokemonRating;
