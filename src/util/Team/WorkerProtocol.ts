import PokemonIv from "../PokemonIv";
import type { TeamMemberInput, TeamMemberStrengthResult } from "./Types";

/**
 * Request sent from the main thread to the team simulation worker.
 */
export interface TeamSimulationRequest {
	/** Monotonically increasing id; used by the main thread to discard stale responses. */
	requestId: number;
	/** Member per team slot; null for an empty slot. */
	members: (SerializedMemberInput | null)[];
	/** Parsed JSON produced by serializeStrengthParameter. */
	param: unknown;
}

/**
 * Response sent from the team simulation worker back to the main thread.
 */
export interface TeamSimulationResponse {
	requestId: number;
	members: (SerializedMemberResult | undefined)[];
	/** Present when the worker failed to compute the simulation. */
	error?: string;
}

/**
 * {@link TeamMemberInput} with its PokemonIv instance replaced by its
 * serialized string form (see PokemonIv.serialize).
 */
export type SerializedMemberInput = Omit<TeamMemberInput, "iv"> & {
	iv: string;
};

/** Convert a simulation input member into its postMessage-safe form. */
export function serializeMemberInput(
	input: TeamMemberInput,
): SerializedMemberInput {
	return { ...input, iv: input.iv.serialize() };
}

/** Reconstruct a simulation input member received from the main thread. */
export function deserializeMemberInput(
	input: SerializedMemberInput,
): TeamMemberInput {
	return { ...input, iv: PokemonIv.deserialize(input.iv) };
}

/**
 * {@link TeamMemberStrengthResult} with its PokemonIv instance replaced by
 * its serialized string form, since class instances don't survive
 * postMessage with their prototype intact.
 */
export type SerializedMemberResult = Omit<TeamMemberStrengthResult, "iv"> & {
	iv: string;
};

/** Convert a simulation result member into its postMessage-safe form. */
export function serializeMemberResult(
	result: TeamMemberStrengthResult,
): SerializedMemberResult {
	return { ...result, iv: result.iv.serialize() };
}

/** Reconstruct a simulation result member received from the worker. */
export function deserializeMemberResult(
	result: SerializedMemberResult,
): TeamMemberStrengthResult {
	return { ...result, iv: PokemonIv.deserialize(result.iv) };
}
