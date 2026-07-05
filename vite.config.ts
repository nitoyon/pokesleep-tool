import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, build as esbuild, type Plugin } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
	base: "/pokesleep-tool/",
	define: {
		__READONLY_MODE__: JSON.stringify(
			process.env.VITE_READONLY_MODE === "true",
		),
	},
	plugins: [react(), serviceWorkerPlugin()],
	build: {
		rollupOptions: {
			input: {
				reserchEn: path.resolve(__dirname, "index.html"),
				reserchJa: path.resolve(__dirname, "index.ja.html"),
				reserchKo: path.resolve(__dirname, "index.ko.html"),
				reserchZhCn: path.resolve(__dirname, "index.zh-cn.html"),
				reserchZhTw: path.resolve(__dirname, "index.zh-tw.html"),
				ivEn: path.resolve(__dirname, "iv/index.html"),
				ivJa: path.resolve(__dirname, "iv/index.ja.html"),
				ivKo: path.resolve(__dirname, "iv/index.ko.html"),
				ivZhCn: path.resolve(__dirname, "iv/index.zh-cn.html"),
				ivZhTw: path.resolve(__dirname, "iv/index.zh-tw.html"),
			},
			output: {
				manualChunks(id) {
					// Third-party libraries
					if (id.includes("node_modules")) {
						if (id.includes("@mui") || id.includes("@emotion")) {
							return "mui";
						}
						if (
							id.includes("react") ||
							id.includes("scheduler") ||
							id.includes("i18next") ||
							id.includes("react-i18next")
						) {
							return "react";
						}
						return "vendor";
					}

					if (id.includes("pokemon.json")) {
						return "pokemon";
					}
					if (id.includes("field.json")) {
						return "field";
					}
					if (id.includes("event.json")) {
						return "event";
					}
					if (id.includes("news.json")) {
						return "news";
					}
					if (
						id.includes("/src/i18n.ts") ||
						id.includes("/src/i18n/en.ts") ||
						id.includes("/src/i18n/en/")
					) {
						return "i18n";
					}
					if (id.includes("PokemonIconData.ts")) {
						return "pokemon-icon";
					}
					if (id.includes("ui/Resources")) {
						return "svg-icon";
					}
					// Catch-all for any other data files
					if (id.includes("/src/data")) {
						return "data";
					}

					// Utility modules
					if (id.includes("/src/util/")) {
						return "util";
					}

					// Common UI components (Dialog, common, etc.)
					if (id.includes("/src/ui/")) {
						return "ui";
					}

					return undefined;
				},
			},
		},
	},
	server: {
		open: true,
	},
	test: {
		globals: true,
		environment: "jsdom",
		exclude: [...configDefaults.exclude],
	},
});

function serviceWorkerPlugin(): Plugin {
	const buildSw = (outDir: string) =>
		esbuild({
			configFile: false,
			publicDir: false,
			build: {
				lib: {
					entry: path.resolve(__dirname, "src/sw.ts"),
					formats: ["iife"],
					name: "sw",
					fileName: () => "sw.js",
				},
				outDir,
				emptyOutDir: false,
				minify: true,
			},
		});

	return {
		name: "sw-plugin",
		async configureServer(server) {
			await buildSw("public");
			server.watcher.add(path.resolve(__dirname, "src/sw.ts"));
			server.watcher.on("change", async (file) => {
				if (file.endsWith("sw.ts")) {
					await buildSw("public");
				}
			});
		},
		async writeBundle(options) {
			await buildSw(options.dir ?? "dist");
		},
	};
}
