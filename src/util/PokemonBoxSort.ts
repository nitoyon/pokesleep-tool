import { PokemonBoxItem } from './PokemonBox';
import PokemonRp from './PokemonRp';
import PokemonStrength, { StrengthParameter, whistlePeriod } from './PokemonStrength';
import { IngredientName, IngredientNames } from '../data/pokemons';
import { MainSkillName, MainSkillNames, matchMainSkillName } from './MainSkill';
import i18next from 'i18next';

/**
 * Sort the given Pokemon box items in descending order.
 * @param filtered The array of Pokémon box items to be sorted.
 * @param sort Sort type.
 * @param ingredient Ingredient name.
 * @param mainSkill Main skill name.
 * @param parameter Strength parameter.
 * @param t The translation function from i18next.
 * @returns A tuple containing:
 *   - An array of filtered and sorted Pokémon box items.
 *   - An error string, if any error occurs; otherwise, an empty string.
 */
export function sortPokemonItems(filtered: PokemonBoxItem[],
    sort: BoxSortType,
    ingredient: IngredientSortType,
    mainSkill: MainSkillName,
    parameter: StrengthParameter,
    t: typeof i18next.t
): [PokemonBoxItem[], string] {
    if (filtered.length === 0) {
        return [[], t('no pokemon found')];
    }

    // Create a shallow copy of `filtered` because Array.sort mutates it
    filtered = [...filtered];

    if (sort === "level") {
        return [filtered.sort((a, b) =>
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.idForm !== a.iv.idForm ? b.iv.idForm - a.iv.idForm :
            b.id - a.id), ''];
    }
    else if (sort === "name") {
        return [filtered.sort((a, b) =>
            b.filledNickname(t) > a.filledNickname(t) ? 1 :
            b.filledNickname(t) < a.filledNickname(t) ? -1 :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.idForm !== a.iv.idForm ? b.iv.idForm - a.iv.idForm :
            b.id - a.id), ''];
    }
    else if (sort === "pokedexno") {
        return [filtered.sort((a, b) =>
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.idForm !== a.iv.idForm ? b.iv.idForm - a.iv.idForm :
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.id - a.id), ''];
    }
    else if (sort === "rp") {
        const rpCache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            rpCache[item.id] = new PokemonRp(item.iv).Rp;
        });
        return [filtered.sort((a, b) =>
            rpCache[b.id] !== rpCache[a.id] ? rpCache[b.id] - rpCache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.id - a.id), ''];
    }
    else if (sort === "total strength") {
        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            cache[item.id] = strength.calculate().totalStrength;
        });
        return [filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id), ''];
    }
    else if (sort === "berry") {
        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            cache[item.id] = strength.calculate().berryTotalStrength;
        });
        return [filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id), ''];
    }
    else if (sort === "ingredient") {
        if (parameter.tapFrequency === 'none') {
            return [[], t('no ingredient')];
        }

        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            const res = strength.calculate().ingredients;
            if (ingredient === "unknown") {
                // total ingredient count
                cache[item.id] = res.reduce((p, c) => p + c.count, 0);
            }
            else {
                // specified ingredient count
                cache[item.id] = res
                    .find(x => x.name === ingredient)?.count ?? 0;
            }
        });
        const ret = filtered
            .filter(x => cache[x.id] > 0)
            .sort((a, b) =>
                cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
                b.id - a.id);
        return [ret, ret.length > 0 ? '' : t('no pokemon found')]
    }
    else if (sort === "skill count") {
        if (parameter.tapFrequency === 'none' ||
            parameter.period <= whistlePeriod) {
            return [[], t('no skill')];
        }

        const cache: {[id: string]: number} = {};
        filtered = filtered
            .filter(x => matchMainSkillName(x.iv.pokemon.skill, mainSkill));
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, {
                ...parameter, maxSkillLevel: true,
            });
            cache[item.id] = strength.calculate().skillCount;
        });
        const ret = filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.id - a.id);
        return [ret, ret.length > 0 ? '' : t('no pokemon found')]
    }
    return [filtered, ''];
}

/** Represents the field by which the box items are sorted.  */
export type BoxSortType = "level"|"name"|"pokedexno"|"rp"|"total strength"|"berry"|"ingredient"|"skill count";

/** Represents the ingredient filter type. */
export type IngredientSortType = IngredientName|"strength"|"count";

/**
 * Pokemon box sort configuration.
 */
export interface BoxSortConfig {
    /** Sort type. */
    sort: BoxSortType;
    /** Ingredient name when `sort` is `"ingredient"`. */
    ingredient: IngredientSortType;
    /** Main skill name when `sort` is `"skill count"`. */
    mainSkill: MainSkillName;
    /** Descending (true) or ascending (false). */
    descending: boolean;
    /** Box items when last warning was shown. */
    warnItems: number;
    /** Date when last warning was shown. */
    warnDate: string;
}

/**
 * Load box sort config from localStorage.
 * @returns config.
 */
export function loadBoxSortConfig(): BoxSortConfig {
    const ret: BoxSortConfig = {
        sort: "level",
        ingredient: "strength",
        mainSkill: "Energy for Everyone S",
        descending: true,
        warnItems: 0,
        warnDate: '',
    };

    const settings = localStorage.getItem('PstPokemonBoxParam');
    if (settings === null) {
        return ret;
    }

    let json;
    try {
        json = JSON.parse(settings);
    } catch {
        return ret;
    }

    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.sort) === "string" &&
        ["level", "name", "pokedexno", "rp", "berry", "total strength", "ingredient", "skill count"].includes(json.sort)) {
        ret.sort = json.sort;
    }
    if (typeof(json.ingredient) === "string") {
        if (json.ingredient === "strength" || json.ingredient === "count" ||
            IngredientNames.includes(json.ingredient)
        ) {
            ret.ingredient = json.ingredient;
        }
    }
    if (typeof(json.mainSkill) === "string" &&
        MainSkillNames.includes(json.mainSkill)) {
        ret.mainSkill = json.mainSkill;
    }
    if (typeof(json.descending) === "boolean") {
        ret.descending = json.descending;
    }
    if (typeof(json.warnItems) === "number") {
        ret.warnItems = json.warnItems;
    }
    if (typeof(json.warnDate) === "string" &&
        json.warnDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        ret.warnDate = json.warnDate;
    }
    return ret;
}
