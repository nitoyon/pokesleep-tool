import { isExpertField } from '../../../data/fields';
import PokemonIv from '../../../util/PokemonIv';
import PokemonStrength, { StrengthParameter } from '../../../util/PokemonStrength';
import { IvAction } from '../IvState';

/** Configuration for frequency info dialog display and calculation */
export type FrequencyInfoState = {
    /** Helping bonus level (0-5) */
    helpingBonus: number;
    /** Good camp ticket enabled */
    campTicket: boolean;
    /** Berry bonus from event */
    berryBonus: 0|1;
    /** Ingredient bonus from event */
    ingBonus: 0|1;
    /** Expert mode enabled */
    expertMode: boolean;
    /** Expert berry selection (0=main, 1=sub, 2=others) */
    expertBerry: number;
    /** Expert ingredient bonus effect */
    expertIngBonus: number;
    /** Display value type */
    displayValue: "frequency"|"count"|"full";
    /** Distribution mode for chart */
    distributionMode: "pmf"|"cdf";
    /** Energy (5: 81-150, 4: 61-80, 3: 41-60, 2: 1-40, 0: 0) */
    energy: 1|2|3|4|5;
    /** Highlighted interval (80%, 90%, 95%, 99%) */
    highlighted: number;
};

export function createDefaultState(): FrequencyInfoState {
    return {
        helpingBonus: 0,
        campTicket: false,
        berryBonus: 0,
        ingBonus: 0,
        expertMode: false,
        expertBerry: 2,
        expertIngBonus: 0,
        displayValue: "frequency",
        energy: 5,
        distributionMode: "pmf",
        highlighted: 90,
    };
}

export function createFrequencyState(iv: PokemonIv,
    parameter: StrengthParameter,
    defaultState: FrequencyInfoState
): FrequencyInfoState {
    const effect = new PokemonStrength(iv, parameter).bonusEffects;
    const expertMode = isExpertField(parameter.fieldIndex);
    const expertBerry = !expertMode ? defaultState.expertBerry :
        parameter.favoriteType[0] === iv.pokemon.type ? 0 :
        parameter.favoriteType.includes(iv.pokemon.type) ? 1 : 2;
    return({
        ...defaultState,
        helpingBonus: parameter.helpBonusCount +
            (iv.hasHelpingBonusInActiveSubSkills ? 1 : 0),
        campTicket: parameter.isGoodCampTicketSet,
        berryBonus: effect.berry,
        ingBonus: effect.ingredient,
        expertMode, expertBerry,
        expertIngBonus: parameter.expertEffect === 'ing' ? 1 : 0,
    })
}

export function applyStateToParameter(parameter: StrengthParameter,
    prev: FrequencyInfoState, current: FrequencyInfoState,
    dispatch: (action: IvAction) => void
) {
    // Sync isGoodCampTicketSet to parameter
    if (prev.campTicket !== current.campTicket) {
        dispatch({type: 'changeParameter', payload: { parameter: {
            ...parameter,
            isGoodCampTicketSet: current.campTicket,
        }}})
    }
}

export default FrequencyInfoState;
