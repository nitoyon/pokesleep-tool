import fields, { FieldData } from '../data/fields';
import pokemons, { PokemonDataHash, SleepStyle } from '../data/pokemons';
import Rank from './Rank';
import { getPokemonCount } from './PokemonCount';

const SPO_COEFFICIENT = 38000;

/**
 * Sleep style calculator class.
 */
export default class StyleCalculator {
    /** Geven research area. */
    field: FieldData;

    /** Given pokemon list */
    pokemons: PokemonDataHash;
    
    /** Finding pokemon. */
    pokemonId: number;

    /** Current strength. */
    strength: number;

    /** All styles related to the field and sleep type */
    mergedStyles: MergedSleepStyle[];

    /**
     * Memo for probability and found count.
     *
     * First key: The number of pokemon we can encounter in this session (1~8)
     * Second key: Encounterd Atop-belly style (0: not encountered, 1: encountered)
     * Third key: Left SPO
     */
    memo: ProbabilityPerFoundCount[][][];

    /**
     * Create calculator for a given research area.
     * @param fieldIndex Index of the research area.
     * @param pokemonId Pokemon ID to calculate.
     * @param strength Current strength.
     */
    constructor(fieldIndex: number, pokemonId: number, strength: number);

    /**
     * Create calculator for a given research area.
     * @param data Field & pokemon data.
     * @param pokemonId Pokemon ID to calculate.
     * @param strength Current strength.
     */
    constructor(data: {field: FieldData, pokemons: PokemonDataHash },
        pokemonId: number, strength: number);

    constructor(field_: number|{field: FieldData, pokemons: PokemonDataHash},
        pokemonId: number, strength: number) {
        // Set given parameters
        if (typeof(field_) == "number") {
            this.field = fields[field_];
            this.pokemons = pokemons;
        } else {
            this.field = field_.field;
            this.pokemons = field_.pokemons;
        }
        this.pokemonId = pokemonId;
        this.strength = strength;

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

        // determine sleep type
        if (!(pokemonId in this.pokemons)) {
            throw new Error(`Specified pokemon ID ${pokemonId} not found`);
        }
        const targetPokemon = this.pokemons[pokemonId];
        const sleepType = targetPokemon.type;

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
            const isTarget = (id === pokemonId.toString());
            for (const styleIdAndRank of pokemon.field[fieldIndex]) {
                // Skip if current strehgth is not enough for this sleep style
                if (styleIdAndRank.rank > rank.index) { continue; }
                const style = pokemon.style[styleIdAndRank.id];
                allStyles.push({isTarget, pokemonId, ...style});
            }
        }

        // find sleep type of the given pokemon
        if (!allStyles.some(x => x.isTarget)) {
            this.mergedStyles = [];
            return;
        }

        // merge sleep styles by SPO & isAtopBerryStudied & isTarget
        let styles: MergedSleepStyle[] = [];
        let dict: { [key: string]: MergedSleepStyle} = {};
        for (const s of allStyles) {
            // When the style is the target, we shouldn't merge
            if (s.isTarget) {
                styles.push({styleCount: 1, ...s});
                continue;
            }

            // Merge non-target styles if SPO & isAtopBerry is equal
            const key = `${s.spo}:${s.isAtopBerry}`;
            if (key in dict) {
                dict[key].styleCount++;
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
     * @return Calculate result object.
     */
    public calculate(score: number): CalculateResult {
        const power = this.strength * score;

        // get pokemon count we can encounter
        const count = getPokemonCount(this.field.powers, power);

        // calculate SPO
        let spo = Math.floor(power / SPO_COEFFICIENT);

        // find roll using memo
        return new CalculateResult(this.findRoll(count, false, spo));
    }

    /**
     * Recursively find a sleep style and calculate the probaility
     * per found count.
     *
     * @param leftCount The nuber of pokemon we can encounter.
     * @param atopBerryStudied Whether atop-berry has been found.
     * @param spo Left SPO.
     * @returns The probability per count of target pokemon found.
     *         (ex) {"0": 0.5, "1": 0.3, "2": 0.2} means that
     *         the number of target pokemon is
     *           - 0 with a probability of 0.5
     *           - 1 with a probability of 0.3
     *           - 2 with a probability of 0.2
     */
    private findRoll(leftCount: number, atopBerryStudied: boolean,
        spo: number): ProbabilityPerFoundCount {
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
        const ret: ProbabilityPerFoundCount = {};
        if (leftCount === 1) {
            // Sleep style can be determined automatically for last roll
            const style = this.rollLastStyle(styles)
            ret[Number(style.isTarget)] = 1;
        } else {
            // Calculate for each candidates
            for (const style of styles) {
                // get next probability per count recursively
                const next = this.findRoll(leftCount - 1,
                    atopBerryStudied || style.isAtopBerry,
                    spo - style.spo);

                // merge current style & next probability
                for (let nextFound of Object.keys(next).map(x => parseInt(x, 10))) {
                    const curFound = nextFound + Number(style.isTarget);
                    if (!(curFound in ret)) {
                        ret[curFound] = 0;
                    }
                    ret[curFound] += next[nextFound] * style.styleCount / total;
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
        const style = styles.find(x => x.spo === maxSpo);
        if (style === undefined) { throw Error('Never comes here'); }

        return style;
    }
}

/**
 * Represents result of StyleCalculator.calculate() method.
 */
class CalculateResult {
    data: ProbabilityPerFoundCount;
    
    constructor(data: ProbabilityPerFoundCount) {
        this.data = data;
    }

    /**
     * Get expected value.
     * @returns Expected value.
     */
    getExpectedValue() {
        return Object.keys(this.data)
            .map(x => parseInt(x, 10))
            .reduce((p, c) => p + this.data[c] * c, 0);
    }
}

interface SleepStyleInField extends SleepStyle {
    /** This sleep style is target or not */
    isTarget: boolean;
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

