import React from "react";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { serializeStrengthParameter } from "../../../util/StrengthParameter";
import type { TeamStrengthResult } from "../../../util/Team";
import { createEmptyTeamStrengthResult } from "../../../util/Team";
import type { TeamMemberSlot } from "../../../util/Team/Team";
import type { TeamMemberInput } from "../../../util/Team/Types";
import {
	deserializeMemberResult,
	serializeMemberInput,
	type TeamSimulationRequest,
	type TeamSimulationResponse,
} from "../../../util/Team/WorkerProtocol";

/**
 * Run team strength simulation (Monte Carlo, ~3000 iterations) in a
 * background Web Worker so the heavy computation never blocks the main
 * thread. Results from a stale request (superseded by a newer one before
 * it replied) are discarded.
 * @param members Array of up to 5 team members; undefined entries are empty slots.
 * @param parameter Strength calculation parameters shared by all members.
 * @returns The latest available result, and whether a newer one is being computed.
 */
export function useTeamSimulation(
	members: (TeamMemberSlot | undefined)[],
	parameter: StrengthParameter,
): { result: TeamStrengthResult; loading: boolean; error: string | null } {
	const [result, setResult] = React.useState<TeamStrengthResult>(() =>
		createEmptyTeamStrengthResult(members.map(toMemberInput)),
	);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const workerPromiseRef = React.useRef<Promise<Worker> | null>(null);
	const latestRequestIdRef = React.useRef(0);

	// Loaded via dynamic import because it's the only ESM (.mts) file in an
	// otherwise CommonJS-typechecked codebase; see its own file comment.
	const getWorker = React.useCallback((): Promise<Worker> => {
		if (workerPromiseRef.current === null) {
			workerPromiseRef.current = import(
				"../../../util/Team/createTeamSimulationWorker.mjs"
			).then((m) => m.createTeamSimulationWorker());
		}
		return workerPromiseRef.current;
	}, []);

	React.useEffect(() => {
		let cancelled = false;
		const requestId = ++latestRequestIdRef.current;
		setLoading(true);
		setError(null);

		const request: TeamSimulationRequest = {
			requestId,
			members: members.map((m) => {
				const input = toMemberInput(m);
				return input ? serializeMemberInput(input) : null;
			}),
			param: JSON.parse(serializeStrengthParameter(parameter)),
		};

		const handleMessage = (event: MessageEvent<TeamSimulationResponse>) => {
			if (event.data.requestId !== latestRequestIdRef.current) {
				return;
			}
			if (event.data.error !== undefined) {
				setError(event.data.error);
				setLoading(false);
				return;
			}
			setResult({
				members: event.data.members.map((m) =>
					m ? deserializeMemberResult(m) : undefined,
				),
			});
			setLoading(false);
		};

		const handleError = (event: ErrorEvent) => {
			if (requestId !== latestRequestIdRef.current) {
				return;
			}
			setError(event.message);
			setLoading(false);
		};

		let worker: Worker | undefined;
		getWorker().then((w) => {
			if (cancelled) {
				return;
			}
			worker = w;
			w.addEventListener("message", handleMessage);
			w.addEventListener("error", handleError);
			w.postMessage(request);
		});

		return () => {
			cancelled = true;
			worker?.removeEventListener("message", handleMessage);
			worker?.removeEventListener("error", handleError);
		};
	}, [members, parameter, getWorker]);

	React.useEffect(() => {
		return () => {
			workerPromiseRef.current?.then((w) => w.terminate());
			workerPromiseRef.current = null;
		};
	}, []);

	return { result, loading, error };
}

function toMemberInput(
	slot: TeamMemberSlot | undefined,
): TeamMemberInput | undefined {
	return slot
		? { iv: slot.item.iv, sneakySnacking: slot.sneakySnacking }
		: undefined;
}
