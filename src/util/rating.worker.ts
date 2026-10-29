import PokemonIv from "./PokemonIv";
import PokemonRating from "./PokemonRating";
import type { StrengthParameter } from "./PokemonStrength";
import type { RatingRequest, RatingResponse } from "./RatingWorkerProtocol";
import { deserializeStrengthParameter } from "./StrengthParameter";

// This file is type-checked against the "dom" lib (see tsconfig.worker.json)
// rather than "webworker", because it transitively imports modules that
// reference DOM-only globals (e.g. localStorage) unrelated to this worker's
// own logic. `self` is narrowed locally to the subset of the dedicated
// worker API this file actually uses.
declare const self: {
	postMessage(message: RatingResponse): void;
	addEventListener(
		type: "message",
		listener: (event: MessageEvent<RatingRequest>) => void,
	): void;
};

// PokemonRating caches the distribution per StrengthParameter object,
// so reuse the same object while the parameter is not changed.
let lastParamJson = "";
let lastParam: StrengthParameter | undefined;

function getParameter(json: string): StrengthParameter {
	if (lastParam === undefined || json !== lastParamJson) {
		lastParam = deserializeStrengthParameter(JSON.parse(json));
		lastParamJson = json;
	}
	return lastParam;
}

self.addEventListener("message", (event: MessageEvent<RatingRequest>) => {
	const { requestId, iv, param } = event.data;
	try {
		const result = new PokemonRating(
			PokemonIv.deserialize(iv),
			getParameter(param),
		).calculate();
		self.postMessage({ requestId, result });
	} catch (e) {
		self.postMessage({
			requestId,
			error: e instanceof Error ? e.message : String(e),
		});
	}
});
