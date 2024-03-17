import fields, { FieldData, SleepType } from '../data/fields';
import pokemons, { PokemonDataHash, SleepStyle } from '../data/pokemons';
import Rank from './Rank';
import { getPokemonCount } from './PokemonCount';

const SPO_COEFFICIENT = 38000;

/**
 * Options for searching style.
 */
export interface StyleSearchOption {
    /** Specifies the research area. */
    field: number | FieldArg;
    /** Current strength. */
    strength: number;
    /** The ID of the Pokemon. `null` if not specified. */
    pokemonId: number;
    /** Detail option */
    detail: "none" | "includeEvolutionaryLine" | "showRarity";
    /** The value to display on Y-axis */
    value: "count" | "candy";
}

/**
 * Factory method for StyleCalculator.
 * @param opt Options for searching style.
 * @returns StyleCalculator instance to be created.
 */
export function createCalculator(opt: StyleSearchOption): StyleCalculator {
    const {field, strength, pokemonId, detail, value} = opt;
    if (!(pokemonId in pokemons)) { throw new Error(`Invalid pokemon ID ${pokemonId} given`); }
    const sleepType = pokemons[pokemonId].type;

    // Calculate valueCount
    let valueCount = 1;
    let valueLabel = [];
    let getValueIndex: (style: SleepStyleInField) => number | null;
    if (detail === "none") {
        valueCount = 1;
        valueLabel = [pokemons[pokemonId].name];
        getValueIndex = (style: SleepStyleInField) =>
            style.pokemonId === pokemonId ? 0 : null;
    }
    else if (detail === "showRarity") {
        valueCount = 4;
        valueLabel = ["☆1", "☆2", "☆3", "☆4"];
        getValueIndex = (style: SleepStyleInField) => {
            if (style.pokemonId !== pokemonId) {
                return null;
            }
            return style.rarity - 1;
        }
    }
    else if (detail === "includeEvolutionaryLine") {
        // count up the number of pokemon in the evolutionary line
        const ancestor = pokemons[pokemonId].ancestor;
        if (ancestor === null) { throw new Error(`Pokeon ${pokemonId} doesn't evolve`) }
        const targetPokemonIds = Object.keys(pokemons)
            .filter(id => pokemons[id].ancestor === ancestor)
            .map(id => parseInt(id, 10));
        valueCount = targetPokemonIds.length;
        valueLabel = targetPokemonIds.map(id => pokemons[id].name);
        getValueIndex = (style:SleepStyleInField) => {
            const index = targetPokemonIds.indexOf(style.pokemonId);
            return index === -1 ? null : index;
        };
    }
    else {
        throw new Error(`Invalid detail ${detail}`);
    }

    // Initialize getMergeKey
    let getMergeKey: (s: SleepStyleInField) => string | null;
    let getValue: (style: SleepStyleInField, prevValue: number, valueIndex: number) => number;
    switch (value) {
        case "count":
            getMergeKey = (s: SleepStyleInField) => getValueIndex(s) === null ?
                null : `${s.spo}:${s.isAtopBerry}`;
            getValue = (style: SleepStyleInField, prevValue: number, valueIndex: number) => {
                return prevValue + (getValueIndex(style) === valueIndex ? 1 : 0);
            };
            break;
        case "candy":
            getMergeKey = (s: SleepStyleInField) => getValueIndex(s) === null ?
                null : `${s.spo}:${s.isAtopBerry}:${s.candy}`;
            getValue = (style: SleepStyleInField, prevValue: number, valueIndex: number) => {
                return prevValue + (getValueIndex(style) === valueIndex ? style.candy : 0);
            };
            break;
        default:
            throw new Error(`Invalid value: ${value} given`);
    }

    const arg: StyleCalculatorContructorArg = {
        field, strength, sleepType, valueCount, valueLabel,
        getValueIndex, getMergeKey, getValue,
    };
    return new StyleCalculator(arg);
}

interface StyleCalculatorContructorArg {
    /** Research area. */
    field: number|FieldArg;
    /** The current strength. */
    strength: number;
    /** Sleep style to search */
    sleepType: SleepType,
    /** The number of the series to be calculated */
    valueCount: number;
    /** Label for the value series. */
    valueLabel: string[];
    /**
     * Function to get the value index.
     *
     * Style calculator can calculate multiple value simultaneously.
     * Value index is used to determine the index of the value.
     *
     * @param style The style to get the value index.
     * @returns The index number (0 to valueCount - 1) when the style
     *          is the target, or null otherwise.
     */
    getValueIndex: (style: SleepStyleInField) => number|null;
    /**
     * Function to get the merge key for SleepStyleInField.
     *
     * We want to merge SleepStyleInField to MergedSleepStyle to
     * make the calculation faster. The merge key should be same value if
     * each SleepStyleInField returns the same value during calculation.
     *
     * (ex) Value is the number of the pokemon:
     * merge key: "<SPO>:<ATOP-BERRY>".
     *
     * (ex) Value is the number of the candy:
     * merge key: "<SPO>:<ATOP-BERRY>:<CANDY-COUNT>".
     *
     * @param style The style to get merge key for.
     * @returns When a string, the merge key. When `null`, this style shouldn't
     *          merge because it is the target one.
     */
    getMergeKey: (style: SleepStyleInField) => string|null;
    /**
     * Function to get the next value from the current style, previous value,
     * and value index.
     *
     * Assume N to be the number of the pokemon to be rolled,
     * and V_N to be the value for N, V_{N - 1} can be calculated from
     * V_N and style using following statement.
     *
     * V_{N-1} = getValue(style, V_N, valueIndex)
     *
     * @param style The style for which the value is calculated.
     * @param prevValue The previous value.
     * @param valueIndex The index of the current value.
     * @returns The calculated value.
     */
    getValue: (style: SleepStyleInField, prevValue: number, valueIndex: number) => number;
}

/**
 * Argument to specify the research area.
 *
 * This argument is used only in unit test.
 */
interface FieldArg {
    /** Field data. */
    fieldData: FieldData;
    /** Pokemon list. */
    pokemons: PokemonDataHash;    
}

/**
 * Sleep style calculator class.
 */
export default class StyleCalculator {
    /** Geven research area. */
    field: FieldData;

    /** Given pokemon list */
    pokemons: PokemonDataHash;
    
    /** THe current strength. */
    strength: number;

    /** The number of the series to be calculated */
    valueCount: number;

    /** Label for the value series. */
    valueLabel: string[];

    /** All styles related to the field and sleep type */
    mergedStyles: MergedSleepStyle[];

    /**
     * Function to get the next value from the current style, previous value,
     * and value index.
     *
     * See `StyleCalculatorContructorArg.getValue()` for more detail.
     */
    getValue: (style: SleepStyleInField, prevValue: number, valueIndex: number) => number;

    /**
     * Memo for probability and found count.
     *
     * First key: The number of pokemon we can encounter in this session (1~8)
     * Second key: Encounterd Atop-belly style (0: not encountered, 1: encountered)
     * Third key: Left SPO
     * Value: number[]. (length = valueCount)
     */
    memo: number[][][][];

    /**
     * Initialize this instance.
     * @param param0 argument.
     */
    constructor({field, strength, sleepType, valueCount, valueLabel,
        getMergeKey, getValue}: StyleCalculatorContructorArg) {
        // Set given parameters
        if (typeof(field) == "number") {
            this.field = fields[field];
            this.pokemons = pokemons;
        } else {
            this.field = field.fieldData;
            this.pokemons = field.pokemons;
        }
        this.strength = strength;
        this.valueCount = valueCount;
        this.valueLabel = valueLabel;
        this.getValue = getValue;

        // initialize memo
        this.memo = [
            [[], []], // 0
            [[], []], // 1
            [[], []], // 2
            [[], []], // 3
            [[], []], // 4
            [[], []], // 5
            [[], []], // 6
            [[], []], // 7
            [[], []], // 8
        ];

        // Enumerate all styles which can rolled for this field, sleepType and strength
        const allStyles: SleepStyleInField[] = [];
        const fieldIndex = this.field.index;
        const rank = new Rank(strength, this.field.ranks);
        for (const id of Object.keys(this.pokemons)) {
            const pokemon = this.pokemons[id];
            // Skip if sleep type is not equal
            if (pokemon.type !== sleepType) { continue; }
            // Skip if pokemon doesn't appear in this field
            if (!(fieldIndex in pokemon.field)) { continue; }
            for (const styleIdAndRank of pokemon.field[fieldIndex]) {
                // Skip if current strehgth is not enough for this sleep style
                if (styleIdAndRank.rank > rank.index) { continue; }
                const style = pokemon.style[styleIdAndRank.id];
                allStyles.push({pokemonId: parseInt(id, 10), ...style});
            }
        }

        // merge sleep styles by SPO & isAtopBerryStudied & isTarget
        let styles: MergedSleepStyle[] = [];
        let dict: { [key: string]: MergedSleepStyle} = {};
        for (const s of allStyles) {
            // When the style is the target, we shouldn't merge
            const key = getMergeKey(s);
            if (key === null) {
                styles.push({styleCount: 1, ...s});
                continue;
            }

            // Merge non-target styles if SPO & isAtopBerry is equal
            if (key in dict) {
                dict[key].styleCount++;
                // gid should be the min value
                if (dict[key].gid > s.gid) {
                    dict[key].gid = s.gid;
                }
                continue;
            }
            dict[key] = {styleCount: 1, ...s};
            styles.push(dict[key]);
        }
        this.mergedStyles = styles;
    }
    
    /**
     * Calculate the probability of encountering the target Pokemon. 
     * @param score Sleep score.
     * @return The result values.
     */
    public calculate(score: number): number[] {
        const power = this.strength * score;

        // get pokemon count we can encounter
        const count = getPokemonCount(this.field.powers, power);

        // calculate SPO
        let spo = Math.floor(power / SPO_COEFFICIENT);

        // find roll using memo
        return this.findRoll(count, false, spo);
    }

    /**
     * Recursively find a sleep style and calculate the probaility
     * per found count.
     *
     * @param leftCount The nuber of pokemon we can encounter.
     * @param atopBerryStudied Whether atop-berry has been found.
     * @param spo Left SPO.
     * @returns The series of value (each element is the value of the valueIndex).
     */
    private findRoll(leftCount: number, atopBerryStudied: boolean,
        spo: number): number[] {
        // If memo exists, return memorized value
        if (spo in this.memo[leftCount][Number(atopBerryStudied)]) {
            return this.memo[leftCount][Number(atopBerryStudied)][spo];
        }

        // Enumerate sleep style candidates
        const styles: MergedSleepStyle[] = this.mergedStyles.filter(x =>
            x.spo <= spo &&
            !(atopBerryStudied && x.isAtopBerry));
        if (styles.length === 0) {
            styles.push(this.mergedStyles[0]);
        }

        // Count up the number of total candidates
        const total = styles.reduce((p, c, i) => p + c.styleCount, 0);

        // Select next sleep style from candidates        
        let ret: number[] = Array(this.valueCount);
        if (leftCount === 1) {
            // Sleep style can be determined automatically for last roll
            const style = this.rollLastStyle(styles)
            for (let i = 0; i < this.valueCount; i++) {
                ret[i] = this.getValue(style, 0, i);
            }
        } else {
            // Calculate for each candidates
            for (let i = 0; i < this.valueCount; i++) {
                ret[i] = 0;
            }
            
            for (const style of styles) {
                // get next value if we select this sleep style
                const valueForStyle = this.findRoll(leftCount - 1,
                    atopBerryStudied || style.isAtopBerry,
                    spo - style.spo);

                // Add this sleep style's value to the current value
                for (let i = 0; i < this.valueCount; i++) {
                    ret[i] += this.getValue(style, valueForStyle[i], i) *
                        style.styleCount / total;
                }
            }
        }

        // Memorize the current result
        this.memo[leftCount][Number(atopBerryStudied)][spo] = ret;
        return ret;
    }
    
    private rollLastStyle(styles: MergedSleepStyle[]): MergedSleepStyle {
        // For last pokemon, select max SPO pokemon (least ID)
        const maxSpo = Math.max(...styles.map(x => x.spo));

        let minGid = Number.POSITIVE_INFINITY;
        let ret: MergedSleepStyle|null = null;
        for (const style of styles) {
            if (style.spo !== maxSpo) { continue; }
            if (style.gid < minGid) {
                minGid = style.gid;
                ret = style;
            }
        }
        if (ret === null) { throw new Error('Never comes here'); }
        return ret;
    }
}

interface SleepStyleInField extends SleepStyle {
    /** Pokemon id */
    pokemonId: number;
}

/**
 * Merge multiple sleep style data by SPO & isAtopBerryStudied & isFound.
 */
interface MergedSleepStyle extends SleepStyleInField {
    /** The number of sleep styles merged */
    styleCount: number;
}

/**
 * Probability per count of target Ppokemon found.
 */
interface ProbabilityPerFoundCount {
    /**
     * found: The number of target Pokemon found.
     * value: probability of the occurance.
     */
   [found: number]: number;
}

