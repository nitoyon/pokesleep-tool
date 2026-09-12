import React from "react";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { serializeStrengthParameter } from "../../../util/StrengthParameter";
import type { TeamStrengthResult } from "../../../util/Team";
import { createEmptyTeamStrengthResult } from "../../../util/Team";
import {
	deserializeMemberResult,
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
	members: (PokemonBoxItem | undefined)[],
	parameter: StrengthParameter,
): { result: TeamStrengthResult; loading: boolean } {
	const [result, setResult] = React.useState<TeamStrengthResult>(() =>
		createEmptyTeamStrengthResult(members),
	);
	const [loading, setLoading] = React.useState(true);
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

		const request: TeamSimulationRequest = {
			requestId,
			members: members.map((m) => (m ? m.iv.serialize() : null)),
			param: JSON.parse(serializeStrengthParameter(parameter)),
		};

		const handleMessage = (event: MessageEvent<TeamSimulationResponse>) => {
			if (event.data.requestId !== latestRequestIdRef.current) {
				return;
			}
			setResult({
				total: deserializeMemberResult(event.data.total),
				members: event.data.members.map((m) =>
					m ? deserializeMemberResult(m) : undefined,
				),
			});
			setLoading(false);
		};

		let worker: Worker | undefined;
		getWorker().then((w) => {
			if (cancelled) {
				return;
			}
			worker = w;
			w.addEventListener("message", handleMessage);
			w.postMessage(request);
		});

		return () => {
			cancelled = true;
			worker?.removeEventListener("message", handleMessage);
		};
	}, [members, parameter, getWorker]);

	React.useEffect(() => {
		return () => {
			workerPromiseRef.current?.then((w) => w.terminate());
			workerPromiseRef.current = null;
		};
	}, []);

	return { result, loading };
}
