import { deserializeStrengthParameter } from "../StrengthParameter";
import { simulateTeam } from "./Simulate";
import {
	deserializeMemberInput,
	serializeMemberResult,
	type TeamSimulationRequest,
	type TeamSimulationResponse,
} from "./WorkerProtocol";

// This file is type-checked against the "dom" lib (see tsconfig.worker.json)
// rather than "webworker", because it transitively imports modules that
// reference DOM-only globals (e.g. localStorage) unrelated to this worker's
// own logic. `self` is narrowed locally to the subset of the dedicated
// worker API this file actually uses.
declare const self: {
	postMessage(message: TeamSimulationResponse): void;
	addEventListener(
		type: "message",
		listener: (event: MessageEvent<TeamSimulationRequest>) => void,
	): void;
};

self.addEventListener(
	"message",
	(event: MessageEvent<TeamSimulationRequest>) => {
		const { requestId, members, param } = event.data;

		try {
			const inputs = members.map((m) =>
				m === null ? undefined : deserializeMemberInput(m),
			);
			const parameter = deserializeStrengthParameter(param);
			const result = simulateTeam(inputs, parameter);

			const response: TeamSimulationResponse = {
				requestId,
				members: result.members.map((m) =>
					m ? serializeMemberResult(m) : undefined,
				),
			};
			self.postMessage(response);
		} catch (e) {
			const response: TeamSimulationResponse = {
				requestId,
				members: [],
				error: e instanceof Error ? e.message : String(e),
			};
			self.postMessage(response);
		}
	},
);
