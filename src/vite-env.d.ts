/// <reference types="vite/client" />

declare module "*.txt?raw" {
	const content: string;
	export default content;
}

/**
 * Readonly-mode flag injected at build time by Vite's `define`
 * (see vite.config.ts). `true` when built with VITE_READONLY_MODE=true.
 */
declare const __READONLY_MODE__: boolean;
