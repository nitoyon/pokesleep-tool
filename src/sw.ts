export type {};

declare const self: ServiceWorkerGlobalScope;

const HTML_CACHE = "html-cache-v1";
const ASSET_CACHE = "asset-cache-v1";

// Matches hashed assets like index-C9OPrGSh.js or ui-DCMMyUYy.css
const HASHED_ASSET = /\/([^/]+)-[A-Za-z0-9]{8}\.(js|css)$/;

self.addEventListener("install", (_event) => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) {
		return;
	}

	const pathname = url.pathname;
	const m = pathname.match(HASHED_ASSET);

	if (m) {
		const base = m[1];
		const ext = m[2];
		event.respondWith(cacheFirst(event.request, base, ext));
	} else if (event.request.mode === "navigate") {
		event.respondWith(networkFirst(event.request));
	}
});

async function cacheFirst(
	request: Request,
	base: string,
	ext: string,
): Promise<Response> {
	// Find cache
	const cache = await caches.open(ASSET_CACHE);
	const hit = await cache.match(request);
	if (hit) {
		return hit;
	}

	// Read from network
	const response = await fetch(request);
	if (!response.ok) {
		return response;
	}

	// Delete old existing cache
	const oldPattern = new RegExp(`/${base}-[A-Za-z0-9_-]{8,}\\.${ext}$`);
	for (const key of await cache.keys()) {
		if (key.url !== request.url && oldPattern.test(new URL(key.url).pathname)) {
			cache.delete(key);
		}
	}

	// Write to cache
	cache.put(request, response.clone());

	return response;
}

async function networkFirst(request: Request): Promise<Response> {
	try {
		const response = await fetch(request);
		const cache = await caches.open(HTML_CACHE);
		cache.put(request, response.clone());
		return response;
	} catch {
		const cached = await caches.match(request);
		return cached ?? new Response("Offline", { status: 503 });
	}
}
