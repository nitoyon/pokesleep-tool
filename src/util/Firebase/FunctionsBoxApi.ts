import {
	connectFunctionsEmulator,
	type Functions,
	getFunctions,
	httpsCallable,
} from "firebase/functions";
import { getFirebaseApp } from "./App";
import type { BoxApi, RemoteBoxEntry, RemoteBoxItems } from "./BoxApi";

// This module pulls in the Firebase SDK. Load it with dynamic import()
// so that the SDK is not included in the initial bundle.

/** Region where the functions are deployed. */
const region = "asia-northeast1";

let functions: Functions | null = null;

function getFirebaseFunctions(): Functions {
	if (functions === null) {
		functions = getFunctions(getFirebaseApp(), region);
		// The production functions only accept requests from the
		// production origin, so use the emulator on the dev server.
		if (isLocalhost()) {
			connectFunctionsEmulator(functions, "127.0.0.1", 5001);
		}
	}
	return functions;
}

function isLocalhost(): boolean {
	const host = location.hostname;
	return host === "localhost" || host === "127.0.0.1";
}

/**
 * Call a callable function.
 * @param name Function name.
 * @param data Request data.
 * @returns Response data.
 */
async function call<Req, Res>(name: string, data: Req): Promise<Res> {
	const fn = httpsCallable<Req, Res>(getFirebaseFunctions(), name);
	return (await fn(data)).data;
}

/**
 * BoxApi implemented with Firebase Functions.
 *
 * The signed-in user is identified by the ID token that the Firebase SDK
 * attaches to each request.
 */
export class FunctionsBoxApi implements BoxApi {
	async getBoxItems(): Promise<RemoteBoxItems> {
		return await call<null, RemoteBoxItems>("getBoxItems", null);
	}

	async addBoxItems(data: string[]): Promise<string[]> {
		const res = await call<{ items: string[] }, { ids: string[] }>(
			"addBoxItems",
			{ items: data },
		);
		return res.ids;
	}

	async updateBoxItems(entries: RemoteBoxEntry[]): Promise<void> {
		await call<{ items: RemoteBoxEntry[] }, void>("updateBoxItems", {
			items: entries,
		});
	}

	async deleteBoxItems(ids: string[]): Promise<void> {
		await call<{ ids: string[] }, void>("deleteBoxItems", { ids });
	}
}
