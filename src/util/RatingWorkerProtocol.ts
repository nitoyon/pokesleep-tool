import type { RatingResult } from "./PokemonRating";

/**
 * Request sent from the main thread to the rating worker.
 */
export interface RatingRequest {
	/** Monotonically increasing id; used by the main thread to discard stale responses. */
	requestId: number;
	/** Serialized PokemonIv (see PokemonIv.serialize). */
	iv: string;
	/** JSON string produced by serializeStrengthParameter. */
	param: string;
}

/**
 * Response sent from the rating worker back to the main thread.
 */
export interface RatingResponse {
	requestId: number;
	/** Undefined when the worker failed to calculate the rating. */
	result?: RatingResult;
	/** Present when the worker failed to calculate the rating. */
	error?: string;
}
