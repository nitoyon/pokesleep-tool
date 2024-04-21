import { PokemonData } from '../data/pokemons';
import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

interface RatingCalculateResult {
    berryScore: number;
    berryMax: number;
    berryMin: number;
    berryCur: number;
    berryRatio: number;
    ingScore: number;
    ingMax: number;
    ingMin: number;
    ingCur: number;
    ingRatio: number;
    skillScore: number;
    skillMax: number;
    skillMin: number;
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

        const berryMinRp = new PokemonRp(this.iv);
        berryMinRp.subSkills = new SubSkillList([
            new SubSkill("Ingredient Finder M"),
            new SubSkill("Ingredient Finder S"),
            null, null, null]);
        berryMinRp.nature = new Nature("Modest");

        const ingMaxRp = new PokemonRp(this.iv);
        ingMaxRp.subSkills = new SubSkillList([
            new SubSkill("Ingredient Finder M"),
            new SubSkill("Ingredient Finder S"),
            new SubSkill("Helping Speed M"),
            new SubSkill("Helping Speed S"),
            new SubSkill("Helping Bonus")])
        ingMaxRp.nature = new Nature("Quiet");

        const ingMinRp = new PokemonRp(this.iv);
        ingMinRp.subSkills = new SubSkillList();
        ingMinRp.nature = new Nature("Impish");

        const skillMaxRp = new PokemonRp(this.iv);
        skillMaxRp.subSkills = new SubSkillList([
            new SubSkill("Skill Trigger M"),
            new SubSkill("Skill Trigger S"),
            new SubSkill("Helping Speed M"),
            new SubSkill("Helping Speed S"),
            new SubSkill("Helping Bonus")])
        skillMaxRp.nature = new Nature("Sassy");

        const skillMinRp = new PokemonRp(this.iv);
        skillMinRp.subSkills = new SubSkillList();
        skillMinRp.nature = new Nature("Lax");

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
        const berryMin = berryCalc(berryMinRp);
        const berryCur = berryCalc(this.rp);
        const berryScore = (berryCur - berryMin) / (berryMax - berryMin) * 100;
        const berryRatio = this.rp.berryRatio;

        const ingCalc = (rp: PokemonRp) => (3600 / rp.frequencyWithHelpingBonus(0)) * rp.ingredientRatio;
        const ingMax = ingCalc(ingMaxRp);
        const ingMin = ingCalc(ingMinRp);
        const ingCur = ingCalc(this.rp);
        const ingScore = (ingCur - ingMin) / (ingMax - ingMin) * 100;
        const ingRatio = this.rp.ingredientRatio;

        const skillCalc = (rp: PokemonRp) => (3600 / rp.frequencyWithHelpingBonus(0)) * rp.skillRatio;
        const skillMax = skillCalc(skillMaxRp);
        const skillMin = skillCalc(skillMinRp);
        const skillCur = skillCalc(this.rp);
        const skillScore = (skillCur - skillMin) / (skillMax - skillMin) * 100;
        const skillRatio = this.rp.skillRatio;
        return {
            berryScore, berryMax, berryMin, berryCur, berryRatio,
            ingScore, ingMax, ingMin, ingCur, ingRatio,
            skillScore, skillMax, skillMin, skillCur, skillRatio,
        };
    }
}

export default PokemonRating;
