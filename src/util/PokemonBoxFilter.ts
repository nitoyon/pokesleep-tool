import { PokemonBoxItem } from './PokemonBox';
import { PokemonSpecialty, IngredientName, PokemonType } from '../data/pokemons';
import { MainSkillName, matchMainSkillName } from './MainSkill';
import { SubSkillType } from './SubSkill';
import { NatureEffect } from './Nature';
import i18next from 'i18next';

/**
 * Pokmeon box filter configuration.
 */
interface IBoxFilterConfig {
    /** Name */
    name: string;
    /** Filter type */
    filterTypes: PokemonType[];
    /** Filter specialty */
    filterSpecialty: PokemonSpecialty[];
    /** Filter ingredient */
    ingredientName?: IngredientName;
    /** Include only Pokemon with the ingredientName unlocked */
    ingredientUnlockedOnly: boolean;
    /** Filter main skill */
    mainSkillNames: MainSkillName[];
    /** Filter sub skills */
    subSkillNames: SubSkillType[];
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillUnlockedOnly: boolean;
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillAnd: boolean;
    /** Include only Pokemon with a neutral nature */
    neutralNature: boolean;
    /** Nature effect that is increased (set to 'No effect' if unspecified) */
    upNature: NatureEffect;
    /** Nature effect that is decreased (set to 'No effect' if unspecified) */
    downNature: NatureEffect;
}

/**
 * Pokmeon box filter configuration class.
 */
export default class BoxFilterConfig implements IBoxFilterConfig {
    /** Name */
    name: string;
    /** Filter type */
    filterTypes: PokemonType[];
    /** Filter specialty */
    filterSpecialty: PokemonSpecialty[];
    /** Filter ingredient */
    ingredientName?: IngredientName;
    /** Include only Pokemon with the ingredientName unlocked */
    ingredientUnlockedOnly: boolean;
    /** Filter main skill */
    mainSkillNames: MainSkillName[];
    /** Filter sub skills */
    subSkillNames: SubSkillType[];
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillUnlockedOnly: boolean;
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillAnd: boolean;
    /** Include only Pokemon with a neutral nature */
    neutralNature: boolean;
    /** Nature effect that is increased (set to 'No effect' if unspecified) */
    upNature: NatureEffect;
    /** Nature effect that is decreased (set to 'No effect' if unspecified) */
    downNature: NatureEffect;

    /** Initialize the instance */
    constructor(values: Partial<IBoxFilterConfig>) {
        this.name = values.name ?? "";
        this.filterTypes = values.filterTypes ?? [];
        this.filterSpecialty = values.filterSpecialty ?? [];
        this.ingredientName = values.ingredientName;
        this.ingredientUnlockedOnly = values.ingredientUnlockedOnly ?? false;
        this.mainSkillNames = values.mainSkillNames ?? [];
        this.subSkillNames = values.subSkillNames ?? [];
        this.subSkillUnlockedOnly = values.subSkillUnlockedOnly ?? true;
        this.subSkillAnd = values.subSkillAnd ?? true;
        this.neutralNature = values.neutralNature ?? false;
        this.upNature = values.upNature ?? "No effect";
        this.downNature = values.downNature ?? "No effect";
    }

    /**
     * Filter the given box item based on the current filter config.
     * @param items An array of box items to be filtered.
     * @param t The `i18next.t` function for translations.
     * @returns An array of filtered box items.
     */
    filter(items: PokemonBoxItem[], t: typeof i18next.t): PokemonBoxItem[] {
        return items.filter(item => this.matches(item, t));
    }

    /**
     * Check if a single box item matches the current filter config.
     * @param item A box item to test against the filter.
     * @param t The `i18next.t` function for translations.
     * @returns True if the item matches all filter criteria, false otherwise.
     */
    matches(item: PokemonBoxItem, t: typeof i18next.t): boolean {
        if (this.name !== "") {
            const name = this.name.toLowerCase();
            if (item.nickname.toLowerCase().indexOf(this.name) === -1 &&
                t(`pokemons.${item.iv.pokemonName}`).toLowerCase().indexOf(name) === -1) {
                return false;
            }
        }
        if (this.ingredientName !== undefined) {
            const ing: IngredientName = this.ingredientName;
            const unlocked = this.ingredientUnlockedOnly;
            if (!item.iv.getIngredients(unlocked).includes(ing)) {
                return false;
            }
        }
        if (this.filterTypes.length !== 0) {
            if (!this.filterTypes.includes(item.iv.pokemon.type)) {
                return false;
            }
        }
        if (this.filterSpecialty.length > 0) {
            if (item.iv.pokemon.specialty !== "All" &&
                !this.filterSpecialty.includes(item.iv.pokemon.specialty)) {
                return false;
            }
        }
        if (this.mainSkillNames.length !== 0) {
            if (!this.mainSkillNames.some(n => matchMainSkillName(item.iv.pokemon, n))) {
                return false;
            }
        }
        if (this.subSkillNames.length !== 0) {
            const subSkills = item.iv.subSkills
                .getActiveSubSkills(this.subSkillUnlockedOnly ? item.iv.level : 100)
                .map(x => x.name);
            if (this.subSkillAnd) {
                if (!this.subSkillNames.every(skill => subSkills.includes(skill))) {
                    return false;
                }
            }
            else {
                if (!this.subSkillNames.some(skill => subSkills.includes(skill))) {
                    return false;
                }
            }
        }
        if (this.neutralNature) {
            if (!item.iv.nature.isNeautral) {
                return false;
            }
        }
        if (this.upNature !== "No effect") {
            if (item.iv.nature.upEffect !== this.upNature) {
                return false;
            }
        }
        if (this.downNature !== "No effect") {
            if (item.iv.nature.downEffect !== this.downNature) {
                return false;
            }
        }
        return true;
    }

    /** Get the default tab index */
    get defaultTabIndex(): number {
        if (this.filterTypes.length > 0 ||
            this.filterSpecialty.length > 0
        ) {
            return 0;
        }

        if (this.ingredientName !== undefined) {
            return 1;
        }

        if (this.mainSkillNames.length > 0) {
            return 2;
        }

        if (this.subSkillNames.length > 0) {
            return 3;
        }

        if (this.neutralNature ||
            this.upNature !== "No effect" ||
            this.downNature !== "No effect"
        ) {
            return 4;
        }

        return 0;
    }

    /** Check whether the instance is empty */
    get isEmpty(): boolean {
        return this.name === "" &&
            this.filterTypes.length === 0 &&
            this.filterSpecialty.length === 0 &&
            this.ingredientName === undefined &&
            this.mainSkillNames.length === 0 &&
            this.subSkillNames.length === 0 &&
            this.neutralNature === false &&
            this.upNature === "No effect" &&
            this.downNature === "No effect";
    }
}
