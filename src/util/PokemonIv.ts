import Nature from './Nature';
import pokemons, { getDecendants, IngredientName,
    PokemonData, toxelId, toxtricityId } from '../data/pokemons';
import { IngredientType, IngredientTypes } from './PokemonRp';
import { getMaxSkillLevel } from './MainSkill';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';
import { clamp } from './NumberUtil';

/**
 * Represents Indivisual Values (IV) of the Pokemon.
 */
class PokemonIv {
    pokemonName: string;
    pokemon: PokemonData;
    level: number;
    skillLevel: number;
    ingredient: IngredientType;
    subSkills: SubSkillList;
    nature: Nature;
    ribbon: 0|1|2|3|4;
    mythIng1: IngredientName;
    mythIng2: IngredientName;
    mythIng3: IngredientName;

    /** Initialize new instance. */
    constructor(pokemonName: string) {
        this.pokemonName = pokemonName;
        const pokemon = pokemons.find(x => x.name === pokemonName);
        if (pokemon === undefined) {
            throw new Error(`Unknown name: ${pokemonName}`);
        }
        this.pokemon = pokemon;

        // set default value
        this.level = 30;
        this.skillLevel = Math.max(pokemon.evolutionCount + 1, 1);
        this.ingredient = pokemon.ing3 !== undefined ? "ABC" : "ABB";
        this.subSkills = new SubSkillList();
        this.nature = new Nature(pokemonName === "Toxtricity (Amped)" ?
            "Hardy" : "Serious");
        this.ribbon = 0;
        this.mythIng1 = this.mythIng2 = this.mythIng3 = "unknown";

        // Darkrai
        if (this.isMythical) {
            this.mythIng1 = "sausage";
        }
    }

    /** Returns true if the Pokémon is mythical. */
    get isMythical(): boolean {
        return this.pokemon.mythIng !== undefined;
    }

    /** Get active sub-skills list. */
    get activeSubSkills(): SubSkill[] {
        return this.subSkills.getActiveSubSkills(this.level);
    }

    /**
     * Creates a deep copy of this instance.
     * @param pokemonName Pokemon's name.
     * @returns A cloned instance.
     */
    clone(pokemonName?: string): PokemonIv {
        const ret = new PokemonIv(pokemonName ?? this.pokemonName);
        ret.level = this.level;

        ret.skillLevel = this.skillLevel;
        if (this.pokemon.id !== ret.pokemon.id) {
            const diff = Math.max(0, ret.pokemon.evolutionCount) -
                Math.max(0, this.pokemon.evolutionCount);
            ret.skillLevel += diff;
        }

        ret.ingredient = this.ingredient;
        ret.subSkills = this.subSkills.clone();
        ret.nature = this.nature;
        ret.ribbon = this.ribbon;
        ret.mythIng1 = this.mythIng1;
        ret.mythIng2 = this.mythIng2;
        ret.mythIng3 = this.mythIng3;
        ret.normalize();
        return ret;
    }

    /**
     * Creates a new PokemonIv instance with a changed level.
     * @param level The new level for the PokemonIv.
     * @return A new PokemonIv instance with the specified level.
     */
    changeLevel(level: number): PokemonIv {
        const ret = this.clone();
        ret.level = level;

        const beforeSkillLevelUp = this.activeSubSkills
            .reduce((p, c) => p + c.skillLevelUp, 0);
        const afterSkillLevelUp = ret.activeSubSkills
            .reduce((p, c) => p + c.skillLevelUp, 0);
        ret.skillLevel += afterSkillLevelUp - beforeSkillLevelUp;
        ret.normalize();
        return ret;
    }

    /**
     * Creates a new PokemonIv instance with a changed sub-skills.
     * @param subSkills The new sub-skills for the PokemonIv.
     * @return A new PokemonIv instance with the specified sub-skills.
     */
    changeSubSkills(subSkills: SubSkillList): PokemonIv {
        const ret = this.clone();
        ret.subSkills = subSkills;

        const beforeSkillLevelUp = this.activeSubSkills
            .reduce((p, c) => p + c.skillLevelUp, 0);
        const afterSkillLevelUp = ret.activeSubSkills
            .reduce((p, c) => p + c.skillLevelUp, 0);
        ret.skillLevel += afterSkillLevelUp - beforeSkillLevelUp;
        ret.normalize();
        return ret;
    }

    /**
     * Get IngredientName[] which the Pokemon can gather
     * @param unlockedOnly Unlocked ingredients only or not.
     * @returns Ingredients.
     */
    getIngredients(unlockedOnly: boolean): IngredientName[] {
        if (this.isMythical) {
            const mythRet = [this.mythIng1];
            if (!unlockedOnly || this.level >= 30) {
                if (this.mythIng2 !== "unknown" && mythRet[0] !== this.mythIng2) {
                    mythRet.push(this.mythIng2);
                }
            }
            if (!unlockedOnly || this.level >= 60) {
                if (this.mythIng3 !== "unknown" && mythRet.includes(this.mythIng3)) {
                    mythRet.push(this.mythIng3);
                }
            }
            return mythRet;
        }

        const ret: IngredientName[] = [this.pokemon.ing1.name];

        if (!unlockedOnly || this.level >= 30) {
            if (this.ingredient.charAt(1) === 'B') {
                ret.push(this.pokemon.ing2.name);
            }
        }

        if (!unlockedOnly || this.level >= 60) {
            const ing3 = this.ingredient.charAt(2) === 'A' ? this.pokemon.ing1 :
                this.ingredient.charAt(2) === 'B' ?
                this.pokemon.ing2 : this.pokemon.ing3;
            if (ing3 !== undefined && !ret.includes(ing3.name)) {
                ret.push(ing3.name);
            }
        }
        return ret;
    }

    /**
     * Normalize current state.
     */
    normalize() {
        const maxSkillLevel = getMaxSkillLevel(this.pokemon.skill);
        this.skillLevel = clamp(1, this.skillLevel, maxSkillLevel);

        if (this.ingredient.endsWith('C') && this.pokemon.ing3 === undefined) {
            this.ingredient = this.ingredient.replace('C', 'A') as IngredientType;
        }

        if (this.isMythical && this.mythIng1 === "unknown") {
            this.mythIng1 = "sausage";
        }

        if (this.pokemon.id === toxtricityId) {
            if (this.pokemon.form === "Amped" &&
                this.nature.isLowKey
            ) {
                this.nature = Nature.allNatures
                    .filter(x => x.isAmped)
                    .filter(x => x.upEffect === this.nature.upEffect)[0] ??
                    new Nature("Hardy");
            }
            else if (this.pokemon.form === "Low Key" &&
                this.nature.isAmped
            ) {
                this.nature = Nature.allNatures
                    .filter(x => x.isLowKey)
                    .filter(x => x.upEffect === this.nature.upEffect)[0] ??
                    new Nature("Serious");
            }
        }
    }

    /**
     * Check whether given IV is equal to this IV.
     * @param iv IV to be compared.
     * @returns Whether two IV is equal or not.
     */
    isEqual(iv: PokemonIv): boolean {
        const isEqual = this.pokemonName === iv.pokemonName &&
            this.level === iv.level &&
            this.skillLevel === iv.skillLevel &&
            this.subSkills.isEqual(iv.subSkills) &&
            this.nature.name === iv.nature.name &&
            this.ribbon === iv.ribbon;

        if (this.isMythical) {
            return (isEqual &&
                this.mythIng1 === iv.mythIng1 &&
                this.mythIng2 === iv.mythIng2 &&
                this.mythIng3 === iv.mythIng3);
        } else {
            return (isEqual && this.ingredient === iv.ingredient);
        }
    }

    /**
     * Get descendants of this Pokémon.
     * @returns Descendants of this Pokémon.
     */
    get decendants(): PokemonData[] {
        return this.getDecendants(false);
    }

    /**
     * Get all descendants of this Pokémon, including non-final evolutions.
     * @returns All descendants of this Pokémon.
     */
    get allDecendants(): PokemonData[] {
        return this.getDecendants(true);
    }

    /**
     * Internal method to descendants and allDecendants property.
     * @param {boolean} [includeNonFinal] - Whether to include non-final evolutions.
     * @return Descendants of this Pokémon.
     */
    private getDecendants(includeNonFinal: boolean): PokemonData[] {
        const ret = getDecendants(this.pokemon, includeNonFinal);

        // if the Pokémon is Toxel, filter by form
        if (this.pokemon.ancestor === toxelId) {
            return ret
                .filter(x => x.id === toxelId ||
                    (x.form === "Amped" && this.nature.isAmped) ||
                    (x.form === "Low Key" && this.nature.isLowKey));
        }

        return ret;
    }

    /**
     * Check whether the pokemon has an active sub-skill 'Helping Bonus'.
     */
    get hasHelpingBonusInActiveSubSkills(): boolean {
        return this.subSkills
            .getActiveSubSkills(this.level)
            .some(x => x.name === "Helping Bonus");
    }

    /**
     * Check whether the pokemon has an active sub-skill 'Energy Recovery Bonus'.
     */
    get hasEnergyRecoveryBonusInActiveSubSkills(): boolean {
        return this.subSkills
            .getActiveSubSkills(this.level)
            .some(x => x.name === "Energy Recovery Bonus");
    }

    /**
     * Check whether the pokemon has an active sub-skill 'Sleep EXP Bonus'.
     */
    get hasSleepExpBonusInActiveSubSkills(): boolean {
        return this.subSkills
            .getActiveSubSkills(this.level)
            .some(x => x.name === "Sleep EXP Bonus");
    }

    /**
     * Get carry limit for this level (assuming evolution count is max).
     */
    get carryLimit(): number {
        return this.pokemon.carryLimit +
            5 * Math.max(0, this.pokemon.evolutionCount) +
            this.ribbonCarryLimit +
            this.subSkills.getActiveSubSkills(this.level).reduce((p, c) => p + c.inventory, 0) * 6;
    }

    /**
     * Get carry limit added by the Good-Night Ribbon.
     */
    get ribbonCarryLimit(): number {
        switch (this.ribbon) {
            case 1: return 1;
            case 2: return 3;
            case 3: return 6;
            case 4: return 8;
            default: return 0;
        }
    }

    /**
     * Get form number.
     */
    get form(): number {
        const m = this.pokemonName.match(/\(([^)]+)\)$/);
        if (m === null) {
            return 0;
        }

        switch (m[1]) {
            case 'Halloween':
                return 1;
            case 'Holiday':
                return 2;
            case 'Alola':
                return 3;
            case 'Paldea':
                return 4;
            case 'Amped':
                return 5;
            case 'Low Key':
                return 6;
            case 'Small':
                return 7;
            case 'Medium':
                return 8;
            case 'Large':
                return 9;
            case 'Jumbo':
                return 10;
        }
        return 0;
    }

    /**
     * Convert form number to string.
     * @param form    form number
     * @return        form name
     */
    public static formToString(form: number): string {
        switch (form) {
            case 1: return 'Halloween';
            case 2: return 'Holiday';
            case 3: return 'Alola';
            case 4: return 'Paldea';
            case 5: return 'Amped';
            case 6: return 'Low Key';
            case 7: return 'Small';
            case 8: return 'Medium';
            case 9: return 'Large';
            case 10: return 'Jumbo';
            default: return '';
        }
    }

    /**
     * ID & form
     */
    get idForm(): number {
        return this.pokemon.id + (this.form << 12);
    }

    /**
     * Get pokemon ID from idForm.
     * @param idForm idForm number.
     * @returns Pokemon ID.
     */
    static getIdByIdForm(idForm: number): number {
        return idForm & 0xfff;
    }

    /**
     * Get form ID from idForm.
     * @param idForm idForm number.
     * @returns form ID.
     */
    static getFormByIdForm(idForm: number): number {
        return idForm >> 12;
    }

    /**
     * Serialize IV data to printable string.
     *
     * Format
     * ------
     *
     * First, serialize IV data to following bit array (72bit or 90bit).
     *
     * * 4bit  : Version (1)
     * * 12bit : Pokedex ID
     *
     * * 6bit  : Form (0: normal, 1: Halloween, 2: Holiday, 3: Alola,
     *           4: Paldea, 5: Amped, 6: Low-Key, 7: Small, 8: Medium,
     *           9: Large, 10: Jumbo)
     * * 7bit  : level
     * * 3bit  : Ingredient (0: AAA, 1: AAB, 2: ABA, 3: ABB, 4: ABC)
     *
     * * 2bit  : reserved
     * * 4bit  : Skill level (0: Lv1, 1: Lv2, ..., 7: Lv8)
     * * 5bit  : Nature index, index of Nature.allNatureNames (0-24)
     * * 5bit  : Sub-skill Lv10 (index of SubSkill.subSkillNames (0-16), unknown: 31)
     *
     * * 5bit  : Sub-skill Lv25
     * * 5bit  : Sub-skill Lv50
     * * 5bit  : Sub-skill Lv75
     * * 1bit  : reserved
     *
     * * 5bit  : Sub-skill Lv100
     * * 3bit  : Ribbon (0: none, 1: 200hrs~, 2: 500hrs~, 3: 1000hrs~, 4: 2000hrs~)
     * * 8bit  : reserved
     *
     * * 10bit : Ingredient for mythical pokemon
     *           (0: unknown, 1: apple, 2: herb, 3: sausage, 4: milk,
     *            5: honey, 6, soy, 7: corn, 8: coffee)
     *           1st ingredient: value % 9
     *           2nd ingredient: Math.floor(value / 9)
     *           3rd ingredient: Math.floor(value / 81)
     *
     * Second, convert bit array using BASE64, and replace '/' to '-',
     * and remove trailing 'AA=='
     */
    serialize(): string {
        const array16 = new Uint16Array(6);
        array16[0] = 1 + (this.pokemon.id << 4);
        array16[1] = this.form +
            (this.level << 6) +
            (IngredientTypes.indexOf(this.ingredient) << 13);

        array16[2] =
            ((this.skillLevel - 1) << 2) +
            (Nature.allNatures.findIndex(x => x.name === this.nature.name) << 6) +
            ((this.subSkills.lv10 === null ? 31 : this.subSkills.lv10.index) << 11);
        array16[3] = (this.subSkills.lv25 === null ? 31 : this.subSkills.lv25.index) +
            ((this.subSkills.lv50 === null ? 31 : this.subSkills.lv50.index) << 5) +
            ((this.subSkills.lv75 === null ? 31 : this.subSkills.lv75.index) << 10);
        array16[4] = (this.subSkills.lv100 === null ? 31 : this.subSkills.lv100.index) +
            (this.ribbon << 5);

        if (this.pokemon.mythIng !== undefined) {
            const ing1 = this.pokemon.mythIng.findIndex(x => x.name === this.mythIng1) + 1;
            const ing2 = this.pokemon.mythIng.findIndex(x => x.name === this.mythIng2) + 1;
            const ing3 = this.pokemon.mythIng.findIndex(x => x.name === this.mythIng3) + 1;
            const n = this.pokemon.mythIng.length + 1; // 1 is unknown
            array16[5] = ing1 + ing2 * n + ing3 * n * n;
        }

        const array8 = new Uint8Array(array16.buffer);
        let bin = "";
        for (let i = 0; i < array8.length; i++) {
            bin += String.fromCharCode(array8[i]);
        }
        return btoa(bin)
            .replace(/\//g, '-')
            // strip tailing "AAAA" if not mythical pokemon
            .substring(0, this.isMythical ? 16 : 12);
    }

    /**
     * Deserialize serialized string.
     * @param value Serialized string.
     * @returns PokemonIv object.
     */
    static deserialize(value: string): PokemonIv {
        // validate, and convert to BASE64 string
        if (value.length === 12) {
            value = value.replace(/-/g, '/') + "AAAA";
        } else if (value.length === 16) {
            value = value.replace(/-/g, '/');
        } else {
            throw new Error(`Invalid length ${value.length}`);
        }

        // decode BASE64 to Uint16Array
        const bin = atob(value);
        const array8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
            array8[i] = bin.charCodeAt(i);
        }
        const array16 = new Uint16Array(array8.buffer);

        // validate version
        if ((array16[0] & 0xf) !== 1) {
            throw new Error('Invalid version');
        }

        // get Pokedex ID
        const id = array16[0] >> 4;
        let pokemon = pokemons.find(x => x.id === id);
        if (pokemon === undefined) {
            throw new Error(`Pokemon id ${id} not found`);
        }

        // get form
        const form = array16[1] & 0x3f;
        if (form !== 0) {
            const formStr = PokemonIv.formToString(form);
            const newName = `${pokemon.name.replace(/ \(.+/, '')} (${formStr})`;
            pokemon = pokemons.find(x => x.name === newName);
            if (pokemon === undefined) {
                throw new Error(`Invalid form specified (${form})`);
            }
        }
        const ret = new PokemonIv(pokemon.name);

        // level
        ret.level = (array16[1] >> 6) & 0x7f;
        if (ret.level === 0 || ret.level > 100) {
            throw new Error(`Invalid level (${ret.level})`);
        }

        // ingredient type
        const ing = (array16[1] >> 13) & 0x7;
        if (ing > 5) {
            throw new Error(`Invalid ing value (${ing})`);
        }
        ret.ingredient = IngredientTypes[ing];

        // skill level
        ret.skillLevel = ((array16[2] >> 2) & 0x7) + 1;
        if (ret.skillLevel > getMaxSkillLevel(pokemon.skill)) {
            throw new Error(`Too large skill level ${ret.skillLevel} for ${pokemon.name}`);
        }

        // nature
        const natureIndex = (array16[2] >> 6) & 31;
        if (natureIndex >= Nature.allNatures.length) {
            throw new Error(`Too large nature ${natureIndex}`);
        }
        ret.nature = Nature.allNatures[natureIndex];

        // sub skill
        const allSubSkills = SubSkill.allSubSkills;
        const getSubSkill = (index: number, lv: number) => {
            if (index === 31) { return null; }
            if (index >= allSubSkills.length) {
                throw new Error(`Too large subskill for level ${lv}: ${index}`);
            }
            return allSubSkills[index];
        };
        ret.subSkills.lv10 = getSubSkill((array16[2] >> 11) & 31, 10);
        ret.subSkills.lv25 = getSubSkill((array16[3] >> 0) & 31, 25);
        ret.subSkills.lv50 = getSubSkill((array16[3] >> 5) & 31, 50);
        ret.subSkills.lv75 = getSubSkill((array16[3] >> 10) & 31, 75);
        ret.subSkills.lv100 = getSubSkill((array16[4] >> 0) & 31, 100);

        // ribbon
        ret.ribbon = ((array16[4] >> 5) & 7) as 0|1|2|3|4;
        if (ret.ribbon >= 5) {
            throw new Error(`Invalid ribbon (${ret.ribbon})`);
        }

        // mythical ingredients
        if (ret.pokemon.mythIng !== undefined) {
            const n = ret.pokemon.mythIng.length + 1; // 1 is unknown
            const ing1 = (array16[5] % n) - 1;
            const ing2 = (Math.floor(array16[5] / n) % n) - 1;
            const ing3 = (Math.floor(array16[5] / n / n) % n) - 1;
            ret.mythIng1 = ing1 < 0 ? "sausage" : ret.pokemon.mythIng[ing1].name;
            ret.mythIng2 = ing2 < 0 ? "unknown" : ret.pokemon.mythIng[ing2].name;
            ret.mythIng3 = ing3 < 0 ? "unknown" : ret.pokemon.mythIng[ing3].name;
        }

        return ret;
    }
}

export default PokemonIv;
