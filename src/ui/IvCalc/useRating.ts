import React from "react";
import type PokemonIv from "../../util/PokemonIv";
import type { RatingResult } from "../../util/PokemonRating";
import type { StrengthParameter } from "../../util/PokemonStrength";
import type {
	RatingRequest,
	RatingResponse,
} from "../../util/RatingWorkerProtocol";
import { serializeStrengthParameter } from "../../util/StrengthParameter";

/**
 * Shared worker. It's kept alive while the app is running so that the
 * distribution cached in the worker can be reused after the tab is changed.
 */
let workerPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
	// Loaded via dynamic import because it's an ESM (.mts) file in an
	// otherwise CommonJS-typechecked codebase; see its own file comment.
	if (workerPromise === null) {
		workerPromise = import("../../util/createRatingWorker.mjs").then((m) =>
			m.createRatingWorker(),
		);
	}
	return workerPromise;
}

/** Monotonically increasing request ID shared by all hooks. */
let lastRequestId = 0;

/**
 * Calculate the rating in a background Web Worker so that the heavy
 * computation never blocks the main thread. Results from a stale request
 * (superseded by a newer one before it replied) are discarded.
 * @param pokemonIv The Pokémon to be rated.
 * @param parameter Strength calculation parameters.
 * @returns The latest available result (undefined until the first result
 *   arrives), and whether a newer one is being computed.
 */
export function useRating(
	pokemonIv: PokemonIv,
	parameter: StrengthParameter,
): {
	result: RatingResult | undefined;
	loading: boolean;
	error: string | null;
} {
	const [result, setResult] = React.useState<RatingResult | undefined>(
		undefined,
	);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const latestRequestIdRef = React.useRef(0);

	// Serialize the parameter only when it's changed
	const paramJson = React.useMemo(
		() => serializeStrengthParameter(parameter),
		[parameter],
	);

	React.useEffect(() => {
		let cancelled = false;
		const requestId = ++lastRequestId;
		latestRequestIdRef.current = requestId;
		setLoading(true);
		setError(null);

		const request: RatingRequest = {
			requestId,
			iv: pokemonIv.serialize(),
			param: paramJson,
		};

		const handleMessage = (event: MessageEvent<RatingResponse>) => {
			if (event.data.requestId !== latestRequestIdRef.current) {
				return;
			}
			if (event.data.error !== undefined) {
				setError(event.data.error);
			} else if (event.data.result !== undefined) {
				setResult(event.data.result);
			}
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
	}, [pokemonIv, paramJson]);

	return { result, loading, error };
}
