import { PokemonBoxItem } from "../PokemonBox";
import PokemonIv from "../PokemonIv";
import { deserializeStrengthParameter } from "../StrengthParameter";
import { simulateTeam } from "./Simulate";
import {
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

		const boxItems = members.map((serializedIv) =>
			serializedIv === null
				? undefined
				: new PokemonBoxItem(PokemonIv.deserialize(serializedIv)),
		);
		const parameter = deserializeStrengthParameter(param);
		const result = simulateTeam(boxItems, parameter);

		const response: TeamSimulationResponse = {
			requestId,
			total: serializeMemberResult(result.total),
			members: result.members.map((m) =>
				m ? serializeMemberResult(m) : undefined,
			),
		};
		self.postMessage(response);
	},
);
