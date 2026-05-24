interface RectElement {
	x: number;
	y: number;
	w: number;
	h: number;
	r?: number;
	color: number;
}

interface IconData {
	rects: RectElement[];
	normalPallet: string[];
	shinyPallet: string[];
}

const pokemonRectData: { [id: string]: IconData } = {
	// Bulbasaur
	"1": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.35, color: 0 },
			{ x: 0, y: 0.35, w: 1, h: 0.65, color: 1 },
		],
		normalPallet: ["#84c886", "#a3eece"],
		shinyPallet: ["#86d686", "#c6eea2"],
	},
	// Ivysaur
	"2": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.4, color: 0 },
			{ x: 0.35, y: 0.05, w: 0.3, h: 0.3, r: 0.3, color: 1 },
			{ x: 0, y: 0.4, w: 1, h: 0.6, color: 2 },
		],
		normalPallet: ["#58c77d", "#f5788d", "#82e4e6"],
		shinyPallet: ["#6ac65e", "#feee8e", "#c6ea9a"],
	},
	// Venusaur
	"3": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.3, color: 0 },
			{ x: 0, y: 0.3, w: 1, h: 0.6, color: 1 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 2 },
		],
		normalPallet: ["#fa6e8b", "#4bd079", "#63e8e7"],
		shinyPallet: ["#feea76", "#66d266", "#beea9a"],
	},
	// Charmander
	"4": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.5, w: 0.6, h: 0.8, r: 0.3, color: 1 },
		],
		normalPallet: ["#f49a5b", "#f2e7b5"],
		shinyPallet: ["#feea66", "#fefea6"],
	},
	// Charmeleon
	"5": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.55, w: 0.5, h: 0.7, r: 0.25, color: 1 },
		],
		normalPallet: ["#f37b67", "#e9cfb6"],
		shinyPallet: ["#feda72", "#fefeda"],
	},
	// Charizard
	"6": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.5, w: 0.5, h: 0.7, r: 0.25, color: 1 },
		],
		normalPallet: ["#e9aa70", "#fef8be"],
		shinyPallet: ["#8a8a8a", "#fefed2"],
	},
	// Squirtle
	"7": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.6, w: 0.6, h: 0.6, r: 0.2, color: 1 },
		],
		normalPallet: ["#89d4f0", "#eaddbf"],
		shinyPallet: ["#aef2f2", "#f2eeb2"],
	},
	// Wartortle
	"8": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.55, w: 0.6, h: 0.6, r: 0.2, color: 1 },
		],
		normalPallet: ["#a4bcfa", "#e4d3b5"],
		shinyPallet: ["#d2cafa", "#eec69e"],
	},
	// Blastoise
	"9": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.18, y: 0.5, w: 0.64, h: 0.6, r: 0.2, color: 1 },
		],
		normalPallet: ["#7fb5e1", "#e9ddc2"],
		shinyPallet: ["#c8bdea", "#fbf4db"],
	},
	// Caterpie
	"10": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.5, w: 0.5, h: 0.6, r: 0.1, color: 1 },
		],
		normalPallet: ["#93dc77", "#feec9e"],
		shinyPallet: ["#fef676", "#fefebe"],
	},
	// Metapod
	"11": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#b8d777"],
		shinyPallet: ["#feaa66"],
	},
	// Butterfree
	"12": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.4, y: 0, w: 0.2, h: 1, color: 1 },
		],
		normalPallet: ["#ebeef0", "#8d82c9"],
		shinyPallet: ["#fefefe", "#9686b2"],
	},
	// Rattata
	"19": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.55, color: 0 },
			{ x: 0, y: 0.55, w: 1, h: 0.45, color: 1 },
		],
		normalPallet: ["#ba90ce", "#eddcb6"],
		shinyPallet: ["#c6e292", "#feeaca"],
	},
	// Raticate
	"20": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.45, color: 0 },
			{ x: 0, y: 0.45, w: 1, h: 0.55, color: 1 },
		],
		normalPallet: ["#dca752", "#ebdda9"],
		shinyPallet: ["#f27a62", "#eaeaaa"],
	},
	// Ekans
	"23": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#c499ec"],
		shinyPallet: ["#c6d696"],
	},
	// Arbok
	"24": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.15, color: 1 },
		],
		normalPallet: ["#aba4ce", "#272833"],
		shinyPallet: ["#fee282", "#5a462a"],
	},
	// Pikachu
	"25": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.15, color: 0 },
			{ x: 0, y: 0.15, w: 1, h: 0.85, color: 1 },
		],
		normalPallet: ["#3d3532", "#ffe14f"],
		shinyPallet: ["#646566", "#f1d46d"],
	},
	// Pikachu (Halloween)
	"4121": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.15, color: 0 },
			{ x: 0, y: 0.15, w: 1, h: 0.85, color: 1 },
			{ x: 0.55, y: 0.8, w: 0.5, h: 0.1, r: 0.05, color: 2 },
			{ x: 0.65, y: 0.55, w: 0.3, h: 0.35, r: 0.15, color: 2 },
			{ x: 0.65, y: 0.75, w: 0.3, h: 0.05, color: 3 },
			{ x: 0.82, y: 0.72, w: 0.12, h: 0.12, r: 0.1, color: 4 },
		],
		normalPallet: ["#3d3532", "#ffe14f", "#5a5a60", "#eab253", "#f7ea74"],
		shinyPallet: ["#646566", "#f1d46d", "#5a5a62", "#feb242", "#fed656"],
	},
	// Pikachu (Holiday)
	"8217": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.15, color: 0 },
			{ x: 0, y: 0.15, w: 1, h: 0.85, color: 1 },
			{ x: 0.65, y: 0.6, w: 0.3, h: 0.3, r: 0.15, color: 2 },
			{ x: 0.59, y: 0.8, w: 0.42, h: 0.1, r: 0.05, color: 3 },
			{ x: 0.72, y: 0.48, w: 0.15, h: 0.15, r: 0.1, color: 3 },
		],
		normalPallet: ["#3d3532", "#ffe14f", "#cd5f59", "#fefcf3"],
		shinyPallet: ["#646566", "#f1d46d", "#fa5a56", "#fefefa"],
	},
	// Raichu
	"26": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.55, w: 0.6, h: 0.6, r: 0.1, color: 1 },
		],
		normalPallet: ["#f9cb60", "#fefefd"],
		shinyPallet: ["#feb27a", "#fefefe"],
	},
	// Sandshrew
	"27": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.5, w: 0.6, h: 0.8, r: 0.3, color: 1 },
		],
		normalPallet: ["#e6d559", "#f9edde"],
		shinyPallet: ["#c6f296", "#fefee2"],
	},
	// Sandslash
	"28": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.3, y: 0.55, w: 0.4, h: 0.8, r: 0.3, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#e6d55b", "#f9edde", "#af8242"],
		shinyPallet: ["#f2e29a", "#fefade", "#da4a56"],
	},
	// Clefairy
	"35": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.15, color: 0 },
			{ x: 0, y: 0.15, w: 1, h: 0.85, color: 1 },
		],
		normalPallet: ["#674328", "#ffd9e0"],
		shinyPallet: ["#9ae25a", "#fefaf2"],
	},
	// Clefable
	"36": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.1, color: 0 },
			{ x: 0, y: 0.1, w: 1, h: 0.9, color: 1 },
		],
		normalPallet: ["#714e2d", "#f7d7d6"],
		shinyPallet: ["#feced6", "#fef6ea"],
	},
	// Vulpix
	"37": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#f5a478", "#ffa76c", "#e48860"],
		shinyPallet: ["#feca7e", "#feca7e", "#fe9e56"],
	},
	// Vulpix (Alola)
	"12325": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#ffffff", "#f1fdff"],
		shinyPallet: ["#fefefe", "#fefefe"],
	},
	// Ninetales
	"38": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#ffffce"],
		shinyPallet: ["#faf6fa"],
	},
	// Ninetales (Alola)
	"12326": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#fbffff", "#dcfefe"],
		shinyPallet: ["#fefefe", "#d6d6fe"],
	},
	// Jigglypuff
	"39": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#fce3ea"],
		shinyPallet: ["#fee6fe"],
	},
	// Wigglytuff
	"40": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.7, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.6, r: 0.4, color: 1 },
		],
		normalPallet: ["#fce3ea", "#f9f9fa"],
		shinyPallet: ["#feb6ea", "#fefefe"],
	},
	// Diglett
	"50": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.6, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
			{ x: 0.4, y: 0.35, w: 0.2, h: 0.1, r: 0.05, color: 2 },
		],
		normalPallet: ["#dea790", "#d7d8d9", "#fed8fb"],
		shinyPallet: ["#eabe8e", "#aab6ba", "#bec6c6"],
	},
	// Dugtrio
	"51": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.7, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 1 },
			{ x: 0.12, y: 0.45, w: 0.2, h: 0.1, r: 0.05, color: 2 },
			{ x: 0.4, y: 0.2, w: 0.2, h: 0.1, r: 0.05, color: 2 },
			{ x: 0.68, y: 0.45, w: 0.2, h: 0.1, r: 0.05, color: 2 },
		],
		normalPallet: ["#dea790", "#d7d8d9", "#fed8fb"],
		shinyPallet: ["#eabe8e", "#aab6ba", "#9ec2fe"],
	},
	// Meowth
	"52": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.35, y: 0.1, w: 0.3, h: 0.35, r: 0.15, color: 1 },
		],
		normalPallet: ["#f9f1d2", "#fff090"],
		shinyPallet: ["#feeebe", "#fee68a"],
	},
	// Persian
	"53": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.45, y: 0.1, w: 0.1, h: 0.1, r: 0.05, color: 1 },
		],
		normalPallet: ["#f4eabf", "#c54957"],
		shinyPallet: ["#fefeda", "#feeaae"],
	},
	// Psyduck
	"54": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.3, y: 0.4, w: 0.4, h: 0.2, color: 1 },
			{ x: 0.3, y: 0.4, w: 0.4, h: 0.4, r: 0.2, color: 1 },
		],
		normalPallet: ["#ffd962", "#fdefa8"],
		shinyPallet: ["#aefaf6", "#f2fefe"],
	},
	// Golduck
	"55": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.35, y: 0.4, w: 0.3, h: 0.2, color: 1 },
			{ x: 0.35, y: 0.4, w: 0.3, h: 0.35, r: 0.15, color: 1 },
		],
		normalPallet: ["#80b5db", "#f6ecad"],
		shinyPallet: ["#72beee", "#fec2c2"],
	},
	// Mankey
	"56": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.95, color: 0 },
			{ x: 0, y: 0.95, w: 1, h: 0.05, color: 1 },
			{ x: 0.4, y: 0.45, w: 0.2, h: 0.14, r: 0.07, color: 2 },
		],
		normalPallet: ["#f6f0e8", "#bf9a7c", "#edd3db"],
		shinyPallet: ["#eefece", "#c6aa7a", "#baeaa2"],
	},
	// Primeape
	"57": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.95, color: 0 },
			{ x: 0, y: 0.95, w: 1, h: 0.05, color: 1 },
			{ x: 0.35, y: 0.45, w: 0.3, h: 0.2, r: 0.1, color: 2 },
		],
		normalPallet: ["#f8f1ea", "#c29c7c", "#e9bfc9"],
		shinyPallet: ["#feeec6", "#aea65a", "#feeec6"],
	},
	// Growlithe
	"58": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.4, w: 0.4, h: 0.6, color: 1 },
			{ x: 0.4, y: 0, w: 0.6, h: 0.4, color: 2 },
		],
		normalPallet: ["#f8a94a", "#f9e3bc", "#72685d"],
		shinyPallet: ["#fede56", "#fee69e", "#fede56"],
	},
	// Arcanine
	"59": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.5, h: 1, color: 1 },
			{ x: 0.5, y: 0, w: 0.5, h: 0.4, color: 2 },
		],
		normalPallet: ["#f8a94a", "#f9e3bc", "#72685d"],
		shinyPallet: ["#fee64e", "#fefed2", "#fee64e"],
	},
	// Bellsprout
	"69": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.6, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
		],
		normalPallet: ["#fbff52", "#6bd473"],
		shinyPallet: ["#fefe76", "#fef26a"],
	},
	// Weepinbell
	"70": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.9, color: 0 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 1 },
		],
		normalPallet: ["#fbff52", "#f1b7ac"],
		shinyPallet: ["#fafe86", "#fed2fe"],
	},
	// Victreebel
	"71": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.2, color: 0 },
			{ x: 0, y: 0.2, w: 1, h: 0.1, color: 1 },
			{ x: 0, y: 0.3, w: 1, h: 0.7, color: 2 },
		],
		normalPallet: ["#94ca7c", "#e6b8b1", "#fcfc75"],
		shinyPallet: ["#decaa6", "#aacafe", "#eefe96"],
	},
	// Geodude
	"74": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#bfc0b5"],
		shinyPallet: ["#feda6a"],
	},
	// Graveler
	"75": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 1 },
		],
		normalPallet: ["#c9c9bf", "#b5b5a8"],
		shinyPallet: ["#d6a24a", "#ca8a3e"],
	},
	// Golem
	"76": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 0.7, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#adb1a8", "#c7ad9e"],
		shinyPallet: ["#be9662", "#f2caa2"],
	},
	// Slowpoke
	"79": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.5, r: 0.3, color: 1 },
		],
		normalPallet: ["#f7c0d5", "#fbf4d7"],
		shinyPallet: ["#fee6f6", "#fee6f6"],
	},
	// Slowbro
	"80": {
		rects: [
			{ x: 0, y: 0, w: 0.6, h: 0.6, color: 0 },
			{ x: 0, y: 0.6, w: 0.6, h: 0.4, color: 1 },
			{ x: 0.6, y: 0, w: 0.4, h: 1, color: 2 },
		],
		normalPallet: ["#f7c0d5", "#fbf4d7", "#bed6e2"],
		shinyPallet: ["#dacafe", "#fefef2", "#ead28a"],
	},
	// Magnemite
	"81": {
		rects: [
			{ x: 0, y: 0, w: 0.85, h: 1, color: 0 },
			{ x: 0.85, y: 0, w: 0.15, h: 0.5, color: 1 },
			{ x: 0.85, y: 0.5, w: 0.15, h: 0.5, color: 2 },
		],
		normalPallet: ["#bad4d7", "#7dbeee", "#e46658"],
		shinyPallet: ["#feeebe", "#dfe0e2", "#5e5e5a"],
	},
	// Magneton
	"82": {
		rects: [
			{ x: 0, y: 0, w: 0.85, h: 1, color: 0 },
			{ x: 0.85, y: 0, w: 0.15, h: 0.5, color: 1 },
			{ x: 0.85, y: 0.5, w: 0.15, h: 0.5, color: 2 },
			{ x: 0, y: 0, w: 0.15, h: 0.5, color: 1 },
			{ x: 0, y: 0.5, w: 0.15, h: 0.5, color: 2 },
		],
		normalPallet: ["#bad4d7", "#7dbeee", "#e46658"],
		shinyPallet: ["#f1e3c7", "#898989", "#6a6a6a"],
	},
	// Farfetch'd
	"83": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.22, y: 0.3, w: 0.35, h: 0.2, r: 0.2, color: 1 },
			{ x: 0.1, y: 0.6, w: 0.6, h: 0.8, r: 0.3, color: 2 },
			{ x: 0.85, y: 0, w: 0.2, h: 0.35, color: 3 },
			{ x: 0.85, y: 0.35, w: 0.2, h: 0.15, color: 4 },
			{ x: 0.85, y: 0.5, w: 0.2, h: 0.7, color: 5 },
		],
		normalPallet: [
			"#bea399",
			"#f7e984",
			"#fdfdd0",
			"#4b742f",
			"#afdc63",
			"#ffffff",
		],
		shinyPallet: [
			"#eea6a6",
			"#fede6e",
			"#fefef6",
			"#9ebe76",
			"#9ebe76",
			"#fefefe",
		],
	},
	// Doduo
	"84": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#d6a070", "#f5e3d1"],
		shinyPallet: ["#b6ea82", "#fefaba"],
	},
	// Dodrio
	"85": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#ca9667", "#fce7ca", "#515151"],
		shinyPallet: ["#b6ea82", "#fefab6", "#666a6a"],
	},
	// Gastly
	"92": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.1, w: 0.8, h: 0.8, r: 0.4, color: 1 },
		],
		normalPallet: ["#846e92", "#3e3c44"],
		shinyPallet: ["#5e8296", "#763a92"],
	},
	// Haunter
	"93": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.4, w: 0.5, h: 0.15, r: 0.07, color: 1 },
		],
		normalPallet: ["#9389cb", "#f78d8d"],
		shinyPallet: ["#a2a2ce", "#a2a2ce"],
	},
	// Gengar
	"94": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.4, w: 0.5, h: 0.15, r: 0.07, color: 1 },
		],
		normalPallet: ["#7d75ab", "#e2e6ea"],
		shinyPallet: ["#8e8ea2", "#eef2fa"],
	},
	// Onix
	"95": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#b5b3b6"],
		shinyPallet: ["#c2ce76"],
	},
	// Cubone
	"104": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.5, color: 1 },
			{ x: 0.1, y: 0.6, w: 0.8, h: 0.8, r: 0.2, color: 2 },
		],
		normalPallet: ["#ddba7f", "#f2f2f2", "#f2ebd0"],
		shinyPallet: ["#9ec272", "#fefefe", "#fef6de"],
	},
	// Marowak
	"105": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.5, color: 1 },
			{ x: 0.2, y: 0.6, w: 0.6, h: 0.8, r: 0.2, color: 2 },
		],
		normalPallet: ["#debb80", "#f2f2f2", "#f2ebd0"],
		shinyPallet: ["#b2ea86", "#f6f2ee", "#fafaca"],
	},
	// Chansey
	"113": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.3, color: 1 },
			{ x: 0.3, y: 0.54, w: 0.4, h: 0.16, r: 0.08, color: 2 },
			{ x: 0.3, y: 0.65, w: 0.4, h: 0.1, color: 2 },
			{ x: 0.3, y: 0.7, w: 0.4, h: 0.1, color: 3 },
			{ x: 0.3, y: 0.75, w: 0.4, h: 0.16, r: 0.08, color: 3 },
		],
		normalPallet: ["#f9d9ef", "#e79fb8", "#ffffff", "#db89a2"],
		shinyPallet: ["#fef6de", "#aeeaaa", "#fefefa", "#aeeaaa"],
	},
	// Kangaskhan
	"115": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.4, w: 0.8, h: 0.8, r: 0.3, color: 1 },
			{ x: 0.35, y: 0.8, w: 0.3, h: 0.3, r: 0.5, color: 2 },
		],
		normalPallet: ["#be8f6a", "#f9e39a", "#958575"],
		shinyPallet: ["#cec2b6", "#fefeca", "#82864e"],
	},
	// Mr. Mime
	"122": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.5, color: 1 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 2 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 3 },
		],
		normalPallet: ["#ffe3e8", "#eff0f0", "#e88099", "#29718c"],
		shinyPallet: ["#feded6", "#feded6", "#baea82", "#2e7692"],
	},
	// Pinsir
	"127": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#cd9d8a", "#e0dadd"],
		shinyPallet: ["#babae2", "#fef6ae"],
	},
	// Ditto
	"132": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 1 },
			{ x: 0.28, y: 0.3, w: 0.06, h: 0.06, r: 0.03, color: 2 },
			{ x: 0.58, y: 0.3, w: 0.06, h: 0.06, r: 0.03, color: 2 },
			{ x: 0.18, y: 0.45, w: 0.6, h: 0.03, r: 0.03, color: 2 },
		],
		normalPallet: ["#c8bbf5", "#b6a6ea", "#494447"],
		shinyPallet: ["#82f2fe", "#6ed2f2", "#6ed2f2"],
	},
	// Eevee
	"133": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
		],
		normalPallet: ["#e9b860", "#f8eabf"],
		shinyPallet: ["#faeada", "#fefefe"],
	},
	// Eevee (Halloween)
	"4229": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
			{ x: 0.55, y: 0.8, w: 0.5, h: 0.1, r: 0.05, color: 2 },
			{ x: 0.65, y: 0.55, w: 0.3, h: 0.35, r: 0.15, color: 2 },
			{ x: 0.65, y: 0.75, w: 0.3, h: 0.05, color: 3 },
			{ x: 0.82, y: 0.72, w: 0.12, h: 0.12, r: 0.1, color: 4 },
		],
		normalPallet: ["#e9b860", "#f8eabf", "#5a5a60", "#eab253", "#f7ea74"],
		shinyPallet: ["#faeada", "#fefefe", "#5a5a60", "#eab253", "#f7ea74"],
	},
	// Eevee (Holiday)
	"8325": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
			{ x: 0.58, y: 0.79, w: 0.44, h: 0.12, r: 0.05, color: 4 },
			{ x: 0.65, y: 0.6, w: 0.3, h: 0.3, r: 0.15, color: 2 },
			{ x: 0.59, y: 0.8, w: 0.42, h: 0.1, r: 0.05, color: 3 },
			{ x: 0.72, y: 0.48, w: 0.15, h: 0.15, r: 0.1, color: 3 },
		],
		normalPallet: ["#e9b860", "#f8eabf", "#cd5f59", "#fefcf3", "#fefcf3"],
		shinyPallet: ["#faeada", "#fefefe", "#cd5f59", "#fefcf3", "#d0d0d0"],
	},
	// Vaporeon
	"134": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#93cae0", "#356c8e"],
		shinyPallet: ["#e292d2", "#964a9a"],
	},
	// Jolteon
	"135": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#fae365", "#fefaef"],
		shinyPallet: ["#eafe8a", "#fefefe"],
	},
	// Flareon
	"136": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#e7975e", "#fcf2a5"],
		shinyPallet: ["#fece5a", "#fefeaa"],
	},
	// Dratini
	"147": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.4, w: 0.5, h: 1, r: 0.1, color: 1 },
		],
		normalPallet: ["#b4c4e3", "#f8f9f8"],
		shinyPallet: ["#feb6ee", "#fefefe"],
	},
	// Dragonair
	"148": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.35, y: 0.5, w: 0.3, h: 1, r: 0.1, color: 1 },
		],
		normalPallet: ["#82b0dd", "#f7fbfb"],
		shinyPallet: ["#faa6de", "#fefefe"],
	},
	// Dragonite
	"149": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.55, w: 0.5, h: 1, r: 0.1, color: 1 },
		],
		normalPallet: ["#faba50", "#f7ecbf"],
		shinyPallet: ["#a2da9e", "#fefee2"],
	},
	// Mew
	"151": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 1 },
		],
		normalPallet: ["#faedf4", "#f4d6e6"],
		shinyPallet: ["#fef6fa", "#fed6e6"],
	},
	// Chikorita
	"152": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#d6e1ae", "#9cbb82"],
		shinyPallet: ["#fafa9a", "#f6b26e"],
	},
	// Bayleef
	"153": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#f3ee9a", "#9fb365"],
		shinyPallet: ["#fedeb6", "#eace66"],
	},
	// Meganium
	"154": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.23, w: 0.38, h: 0.38, r: 0.2, color: 1 },
			{ x: 0.52, y: 0.23, w: 0.38, h: 0.38, r: 0.2, color: 1 },
			{ x: 0.1, y: 0.41, w: 0.38, h: 0.38, r: 0.2, color: 1 },
			{ x: 0.52, y: 0.41, w: 0.38, h: 0.38, r: 0.2, color: 1 },
			{ x: 0.31, y: 0.53, w: 0.38, h: 0.38, r: 0.2, color: 1 },
			{ x: 0.14, y: 0.27, w: 0.3, h: 0.3, r: 0.2, color: 2 },
			{ x: 0.56, y: 0.27, w: 0.3, h: 0.3, r: 0.2, color: 2 },
			{ x: 0.14, y: 0.45, w: 0.3, h: 0.3, r: 0.2, color: 2 },
			{ x: 0.56, y: 0.45, w: 0.3, h: 0.3, r: 0.2, color: 2 },
			{ x: 0.35, y: 0.57, w: 0.3, h: 0.3, r: 0.2, color: 2 },
			{ x: 0.3, y: 0, w: 0.4, h: 0.62, r: 0.15, color: 0 },
		],
		normalPallet: ["#d8f1a6", "#fbfff8", "#d66f99"],
		shinyPallet: ["#f2f27e", "#fefafe", "#fe964a"],
	},
	// Cyndaquil
	"155": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.5, color: 1 },
		],
		normalPallet: ["#fceaa3", "#116e73"],
		shinyPallet: ["#fef6be", "#9e6e52"],
	},
	// Quilava
	"156": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#fceaa2", "#107377"],
		shinyPallet: ["#fefac2", "#a67252"],
	},
	// Typhlosion
	"157": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.6, h: 1, color: 1 },
		],
		normalPallet: ["#145a5f", "#fde56d"],
		shinyPallet: ["#926262", "#fefab2"],
	},
	// Totodile
	"158": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#70e9ea", "#eee29f"],
		shinyPallet: ["#a2fac2", "#fef6a2"],
	},
	// Croconaw
	"159": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#50cae5", "#fedc89", "#ee6c77"],
		shinyPallet: ["#62d2aa", "#fae29a", "#66beee"],
	},
	// Feraligatr
	"160": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#50cae5", "#fbdc91", "#e4565f"],
		shinyPallet: ["#8af6de", "#fefebe", "#6292ee"],
	},
	// Pichu
	"172": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#fcfb8c", "#373c3e"],
		shinyPallet: ["#fef672", "#5a5656"],
	},
	// Cleffa
	"173": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#ffdcd5", "#9a7b55"],
		shinyPallet: ["#feeaf6", "#82be82"],
	},
	// Igglybuff
	"174": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#fef2f2"],
		shinyPallet: ["#feeafe"],
	},
	// Togepi
	"175": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.5, color: 1 },
			{ x: 0, y: 0.9, w: 0.5, h: 0.1, color: 2 },
			{ x: 0.5, y: 0.9, w: 0.5, h: 0.1, color: 3 },
		],
		normalPallet: ["#f9f0c2", "#fffff2", "#83c5e8", "#df7753"],
		shinyPallet: ["#f8ead2", "#fffffb", "#c26b4e", "#a1bee7"],
	},
	// Togetic
	"176": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.9, w: 0.5, h: 0.1, color: 1 },
			{ x: 0.5, y: 0.9, w: 0.5, h: 0.1, color: 2 },
		],
		normalPallet: ["#f9f8f6", "#83c5e8", "#df7753"],
		shinyPallet: ["#fefefe", "#fefefe", "#fefefe"],
	},
	// Natu
	"177": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.4, y: -0.05, w: 0.2, h: 0.3, r: 0.3, color: 1 },
			{ x: 0.3, y: 0.48, w: 0.4, h: 0.2, r: 0.3, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0.97, w: 1, h: 0.1, color: 3 },
		],
		normalPallet: ["#c9ef64", "#d56a79", "#f6e86d", "#fbfbfb"],
		shinyPallet: ["#defa6e", "#feae52", "#fede5e", "#fefefe"],
	},
	// Xatu
	"178": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.4, y: 0.2, w: 0.2, h: 0.24, r: 0.3, color: 1 },
			{ x: 0, y: 0.8, w: 1, h: 0.05, color: 1 },
			{ x: 0, y: 0.88, w: 1, h: 0.05, color: 1 },
			{ x: 0, y: 0.95, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: 0, w: 0.25, h: 1, color: 3 },
			{ x: 0, y: 0, w: 0.12, h: 1, color: 2 },
			{ x: 0, y: 0, w: 0.06, h: 1, color: 4 },
			{ x: 0.75, y: 0, w: 0.25, h: 1, color: 3 },
			{ x: 0.88, y: 0, w: 0.12, h: 1, color: 2 },
			{ x: 0.94, y: 0, w: 0.06, h: 1, color: 4 },
		],
		normalPallet: ["#c9ef64", "#f6e86d", "#bd4551", "#ecf3f8", "#353a3b"],
		shinyPallet: ["#defa6e", "#fee666", "#feae4a", "#f6fefe", "#6a6e6e"],
	},
	// Mareep
	"179": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#fff4c2", "#76b1e2"],
		shinyPallet: ["#fee2fe", "#5e9ade"],
	},
	// Flaaffy
	"180": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.4, w: 1, h: 0.6, color: 1 },
		],
		normalPallet: ["#eff4ee", "#f2b1c7"],
		shinyPallet: ["#fefefa", "#fedae6"],
	},
	// Ampharos
	"181": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.5, w: 0.6, h: 0.7, r: 0.3, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#fbd354", "#fefffe", "#46463e"],
		shinyPallet: ["#febef2", "#fefefe", "#f292c6"],
	},
	// Sudowoodo
	"185": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#c1907a", "#8fc261"],
		shinyPallet: ["#b2be76", "#da6a6e"],
	},
	// Wooper
	"194": {
		rects: [
			{ x: 0.1, y: 0.15, w: 0.8, h: 0.6, r: 0.35, color: 0 },
			{ x: 0.3, y: 0.65, w: 0.4, h: 0.4, r: 0.2, color: 0 },
			{ x: 0.46, y: 0.78, w: 0.08, h: 0.04, r: 0.03, color: 1 },
			{ x: 0.43, y: 0.85, w: 0.14, h: 0.04, r: 0.03, color: 1 },
			{ x: 0.4, y: 0.92, w: 0.2, h: 0.04, r: 0.03, color: 1 },
		],
		normalPallet: ["#6cecff", "#0c5a8f"],
		shinyPallet: ["#feeaf2", "#fabec2"],
	},
	// Quagsire (Paldea)
	"16578": {
		rects: [
			{ x: 0.1, y: 0.15, w: 0.8, h: 0.6, r: 0.35, color: 0 },
			{ x: 0.3, y: 0.65, w: 0.4, h: 0.4, r: 0.2, color: 0 },
			{ x: 0.45, y: 0.78, w: 0.1, h: 0.04, r: 0.03, color: 1 },
			{ x: 0.43, y: 0.85, w: 0.14, h: 0.04, r: 0.03, color: 1 },
			{ x: 0.4, y: 0.92, w: 0.2, h: 0.04, r: 0.03, color: 1 },
			{ x: 0.48, y: 0.74, w: 0.04, h: 0.24, r: 0.03, color: 1 },
		],
		normalPallet: ["#897771", "#493d3a"],
		shinyPallet: ["#babaf6", "#524a66"],
	},
	// Quagsire
	"195": {
		rects: [
			{ x: 0.1, y: 0, w: 0.8, h: 1, r: 0.3, color: 0 },
			{ x: 0.05, y: 0.4, w: 0.9, h: 0.6, r: 0.2, color: 0 },
		],
		normalPallet: ["#95ecff"],
		shinyPallet: ["#fecefe"],
	},
	// Espeon
	"196": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.43, y: 0.2, w: 0.14, h: 0.14, r: 0.07, color: 1 },
		],
		normalPallet: ["#ebd9e8", "#d85861"],
		shinyPallet: ["#6ec66e", "#c97062"],
	},
	// Umbreon
	"197": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.1, w: 1, h: 0.1, color: 1 },
		],
		normalPallet: ["#5b6365", "#f2da66"],
		shinyPallet: ["#6e7a7a", "#82eafe"],
	},
	// Murkrow
	"198": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.3, w: 0.4, h: 0.2, r: 0.3, color: 1 },
			{ x: 0.85, y: 0.6, w: 0.2, h: 0.1, r: 0.05, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 3 },
			{ x: 0, y: 0.96, w: 1, h: 0.2, color: 4 },
		],
		normalPallet: ["#4f6389", "#f6ed8e", "#c64635", "#f6ec8b", "#fefefe"],
		shinyPallet: ["#d67ada", "#fee286", "#febe62", "#fee286", "#fee286"],
	},
	// Slowking
	"199": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 2 },
			{ x: 0, y: 0.3, w: 0.5, h: 0.1, color: 3 },
			{ x: 0.5, y: 0.3, w: 0.5, h: 0.1, color: 4 },
		],
		normalPallet: ["#f6c2d5", "#eff0f0", "#fbf4d6", "#fefdfd", "#d75e50"],
		shinyPallet: ["#feaada", "#eaeaea", "#fef6da", "#fefefe", "#628ee2"],
	},
	// Wobbuffet
	"202": {
		rects: [
			{ x: 0.7, y: 0.8, w: 0.3, h: 0.25, r: 0.2, color: 0 },
			{ x: 0.2, y: 0.05, w: 0.6, h: 1.2, r: 0.2, color: 1 },
			{ x: 0.87, y: 0.87, w: 0.08, h: 0.08, r: 0.04, color: 2 },
		],
		normalPallet: ["#484848", "#8ce0f8", "#ffffff"],
		shinyPallet: ["#484848", "#feaaf2", "#fcfcfc"],
	},
	// Steelix
	"208": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
		],
		normalPallet: ["#b6bccd", "#858da5"],
		shinyPallet: ["#faee92", "#decb7e"],
	},
	// Shuckle
	"213": {
		rects: [
			{ x: 0.35, y: 0, w: 0.3, h: 1, r: 0.15, color: 0 },
			{ x: 0.25, y: 0, w: 0.4, h: 0.4, r: 0.2, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.5, r: 0.4, color: 1 },
			{ x: 0.32, y: 0.4, w: 0.3, h: 0.2, r: 0.2, color: 0 },
			{ x: 0, y: 0.75, w: 1, h: 1, color: 1 },
			{ x: 0.75, y: 0.6, w: 0.13, h: 0.15, r: 0.1, color: 2 },
			{ x: 0, y: 0.83, w: 1, h: 0.2, color: 3 },
			{ x: 0, y: 0.92, w: 1, h: 0.2, color: 0 },
		],
		normalPallet: ["#ffe035", "#ed5554", "#f5e9ca", "#e7cda5"],
		shinyPallet: ["#fee652", "#4a9efe", "#f2fefe", "#c6e6ea"],
	},
	// Heracross
	"214": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#5f87ae"],
		shinyPallet: ["#f2aef2"],
	},
	// Sneasel
	"215": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.8, y: -0.2, w: 0.2, h: 0.45, r: 0.2, color: 1 },
			{ x: 0.42, y: 0.3, w: 0.16, h: 0.25, r: 0.1, color: 2 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 3 },
		],
		normalPallet: ["#67779d", "#d7656b", "#f4dd7b", "#ffffff"],
		shinyPallet: ["#feaade", "#fee682", "#fee682", "#fefefe"],
	},
	// Delibird
	"225": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.4, color: 1 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#ec5551", "#f6fdff", "#ffe882"],
		shinyPallet: ["#f692f6", "#fefefe", "#fefefe"],
	},
	// Houndour
	"228": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0.6, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#5f5b56", "#e4e0db", "#eb8b59"],
		shinyPallet: ["#4a82b2", "#fefefe", "#fefaaa"],
	},
	// Houndoom
	"229": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.5, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#575045", "#d7d0c6", "#eb8c53"],
		shinyPallet: ["#5a76b2", "#fefaee", "#feee9a"],
	},
	// Blissey
	"242": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.35, color: 1 },
			{ x: 0.3, y: 0.54, w: 0.4, h: 0.16, r: 0.1, color: 1 },
			{ x: 0.3, y: 0.65, w: 0.4, h: 0.14, color: 1 },
			{ x: 0.3, y: 0.74, w: 0.4, h: 0.1, color: 0 },
			{ x: 0.3, y: 0.75, w: 0.4, h: 0.16, r: 0.1, color: 0 },
		],
		normalPallet: ["#ffc9df", "#ffffff"],
		shinyPallet: ["#feeaea", "#fefefe"],
	},
	// Raikou
	"243": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0, w: 0.3, h: 1, color: 2 },
		],
		normalPallet: ["#fae04a", "#c4a4d9", "#dff0fa"],
		shinyPallet: ["#febe66", "#feee6a", "#eeeade"],
	},
	// Entei
	"244": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.5, h: 0.3, color: 1 },
			{ x: 0, y: 0, w: 0.5, h: 0.1, color: 2 },
			{ x: 0.5, y: 0, w: 0.7, h: 0.4, color: 3 },
		],
		normalPallet: ["#cda269", "#ea4c45", "#ffef56", "#f7fef8"],
		shinyPallet: ["#a27256", "#8e5e42", "#fee26e", "#f2f2ce"],
	},
	// Suicune
	"245": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.5, h: 0.3, color: 1 },
			{ x: 0.5, y: 0, w: 0.7, h: 0.5, color: 2 },
		],
		normalPallet: ["#63eaf9", "#0fcce3", "#9284d5"],
		shinyPallet: ["#a6e6e2", "#76d6da", "#3272ba"],
	},
	// Larvitar
	"246": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#a6c06d", "#ca4f6a"],
		shinyPallet: ["#9ec246", "#e686d6"],
	},
	// Pupitar
	"247": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#89a5d0"],
		shinyPallet: ["#ae8eda"],
	},
	// Tyranitar
	"248": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#c2dba1", "#788bb7"],
		shinyPallet: ["#eede9e", "#c28ebe"],
	},
	// Treecko
	"252": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.15, y: 0.5, w: 0.3, h: 0.4, r: 0.3, color: 1 },
			{ x: 0.6, y: 0, w: 0.4, h: 1, color: 2 },
		],
		normalPallet: ["#d3f18e", "#dc5c58", "#6fa473"],
		shinyPallet: ["#6af2ba", "#fadeb6", "#fa6e6a"],
	},
	// Grovyle
	"253": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.15, y: 0.4, w: 0.3, h: 0.45, r: 0.3, color: 1 },
			{ x: 0.8, y: 0, w: 0.3, h: 1, color: 2 },
		],
		normalPallet: ["#aaea92", "#df6b7a", "#6d9459"],
		shinyPallet: ["#6eeeb2", "#f6dec6", "#ea6e5a"],
	},
	// Sceptile
	"254": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: -0.1, y: 0.7, w: 0.4, h: 0.1, r: 0.05, color: 1 },
			{ x: 0.4, y: 0.7, w: 0.6, h: 0.1, r: 0.05, color: 2 },
			{ x: 0.5, y: 0.55, w: 0.1, h: 0.4, r: 0.05, color: 2 },
			{ x: 0.68, y: 0.55, w: 0.1, h: 0.4, r: 0.05, color: 2 },
			{ x: 0.85, y: 0.55, w: 0.1, h: 0.4, r: 0.05, color: 2 },
			{ x: 0.28, y: 0.5, w: 0.15, h: 0.15, r: 0.15, color: 3 },
			{ x: 0.24, y: 0.31, w: 0.15, h: 0.15, r: 0.15, color: 3 },
			{ x: 0.2, y: 0.12, w: 0.15, h: 0.15, r: 0.15, color: 3 },
		],
		normalPallet: ["#a7e68f", "#df6c7a", "#6c925a", "#f9e088"],
		shinyPallet: ["#b3edeb", "#f4dda4", "#6fa8aa", "#db807f"],
	},
	// Torchic
	"255": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0.25, y: 0.4, w: 0.5, h: 0.35, r: 0.3, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 3 },
		],
		normalPallet: ["#e9ae5c", "#f6e96e", "#faf29c", "#f0e17c"],
		shinyPallet: ["#feee6e", "#feb65a", "#f6ceb2", "#f6ceb2"],
	},
	// Combusken
	"256": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.55, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.85, w: 1, h: 0.2, color: 2 },
			{ x: 0, y: 0, w: 1, h: 0.15, color: 3 },
			{ x: 0, y: 0.95, w: 1, h: 0.05, color: 4 },
			{ x: 0.4, y: 0.3, w: 0.2, h: 0.08, r: 0.3, color: 5 },
		],
		normalPallet: [
			"#faf587",
			"#e6a363",
			"#bcb5b0",
			"#e4a264",
			"#ffffff",
			"#e5a363",
		],
		shinyPallet: [
			"#fef6be",
			"#da4662",
			"#d2beae",
			"#da4662",
			"#fefaf2",
			"#da4662",
		],
	},
	// Blaziken
	"257": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.4, color: 1 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#fcf7cd", "#dd6762", "#f4e370"],
		shinyPallet: ["#fafaf6", "#da4a42", "#fed656"],
	},
	// Mudkip
	"258": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: -0.1, y: 0.3, w: 0.25, h: 0.3, r: 0.05, color: 1 },
			{ x: 0.8, y: 0.3, w: 0.25, h: 0.3, r: 0.05, color: 1 },
			{ x: 0.2, y: 0.6, w: 0.6, h: 0.6, r: 0.3, color: 2 },
		],
		normalPallet: ["#86cff3", "#e7a565", "#c0e4f4"],
		shinyPallet: ["#e4b0f6", "#fece6a", "#fefee2"],
	},
	// Marshtomp
	"259": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.66, w: 1, h: 0.6, color: 1 },
			{ x: 0, y: 0.1, w: 0.15, h: 1, color: 2 },
			{ x: 0.85, y: 0.1, w: 0.15, h: 1, color: 2 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 3 },
		],
		normalPallet: ["#a0f0f2", "#d8fafa", "#e9b05c", "#647986"],
		shinyPallet: ["#fedefe", "#fedefe", "#feee6e", "#8e6e9a"],
	},
	// Swampert
	"260": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.55, w: 0.6, h: 0.8, r: 0.3, color: 1 },
			{ x: 0, y: 0, w: 0.15, h: 0.35, r: 0.1, color: 2 },
			{ x: 0.85, y: 0, w: 0.15, h: 0.35, r: 0.1, color: 2 },
			{ x: 0.04, y: 0.7, w: 0.12, h: 0.22, r: 0.1, color: 2 },
			{ x: 0.85, y: 0.7, w: 0.12, h: 0.22, r: 0.1, color: 2 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 3 },
			{ x: 0, y: 0.95, w: 1, h: 0.1, color: 3 },
		],
		normalPallet: ["#85cef3", "#f0f5fc", "#e9b05c", "#667b89"],
		shinyPallet: ["#f6aefe", "#feeefe", "#fec69a", "#8e6e9a"],
	},
	// Ralts
	"280": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.05, color: 1 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 2 },
		],
		normalPallet: ["#b6d7af", "#dd717c", "#f3f6fa"],
		shinyPallet: ["#7adafe", "#ecbd74", "#fef2fe"],
	},
	// Kirlia
	"281": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0, y: 0.4, w: 1, h: 0.4, color: 2 },
		],
		normalPallet: ["#aed8ab", "#dd717c", "#f2f6fa"],
		shinyPallet: ["#a6e6fe", "#d87b4c", "#fefefe"],
	},
	// Gardevoir
	"282": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
			{ x: 0.45, y: 0.4, w: 0.1, h: 0.15, r: 0.1, color: 2 },
		],
		normalPallet: ["#f2f6fa", "#aed8ab", "#dd717c"],
		shinyPallet: ["#fefefe", "#a6e6fe", "#db7c4d"],
	},
	// Slakoth
	"287": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#e8ded2", "#a18370"],
		shinyPallet: ["#fed2fe", "#fe9696"],
	},
	// Vigoroth
	"288": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0.2, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#f2f2f2", "#e7767d", "#a98b6e"],
		shinyPallet: ["#f6e6ba", "#fea24e", "#fea24e"],
	},
	// Slaking
	"289": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.4, y: 0, w: 0.4, h: 1, color: 1 },
			{ x: 0.8, y: 0, w: 0.2, h: 1, color: 2 },
		],
		normalPallet: ["#87714f", "#d0b993", "#f3f4f4"],
		shinyPallet: ["#967e6e", "#daba9e", "#f2d6a6"],
	},
	// Sableye
	"302": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.4, y: 0.4, w: 0.2, h: 0.25, r: 0.1, color: 1 },
		],
		normalPallet: ["#977ecf", "#f06686"],
		shinyPallet: ["#d2a662", "#d2a662"],
	},
	// Mawile
	"303": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: -0.1, y: 0.25, w: 0.7, h: 0.9, r: 0.05, color: 2 },
			{ x: 0.8, y: 0.4, w: 0.13, h: 0.13, r: 0.1, color: 3 },
			{ x: 0.82, y: 0.64, w: 0.1, h: 0.1, r: 0.1, color: 3 },
			{ x: 0.83, y: 0.85, w: 0.08, h: 0.08, r: 0.1, color: 3 },
		],
		normalPallet: ["#464348", "#585b65", "#fbf7b1", "#ffffff"],
		shinyPallet: ["#965a76", "#965a76", "#fef2aa", "#fefefe"],
	},
	// Aron
	"304": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.37, w: 0.3, h: 0.35, r: 0.2, color: 1 },
			{ x: 0.17, y: 0.45, w: 0.2, h: 0.2, r: 0.2, color: 2 },
			{ x: 0.6, y: 0.37, w: 0.3, h: 0.35, r: 0.2, color: 1 },
			{ x: 0.63, y: 0.45, w: 0.2, h: 0.2, r: 0.2, color: 2 },
			{ x: 0.25, y: 0.15, w: 0.14, h: 0.14, r: 0.2, color: 1 },
			{ x: 0.61, y: 0.15, w: 0.14, h: 0.14, r: 0.2, color: 1 },
			{ x: 0.49, y: 0, w: 0.02, h: 1, color: 3 },
		],
		normalPallet: ["#f3efee", "#464443", "#62d8f4", "#c3c5c3"],
		shinyPallet: ["#fefef6", "#4e4c4d", "#fa6666", "#dad2c6"],
	},
	// Lairon
	"305": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.6, color: 1 },
			{ x: 0.1, y: 0.2, w: 0.2, h: 0.2, r: 0.2, color: 2 },
			{ x: 0.4, y: 0.2, w: 0.2, h: 0.2, r: 0.2, color: 2 },
			{ x: 0.7, y: 0.2, w: 0.2, h: 0.2, r: 0.2, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 0 },
		],
		normalPallet: ["#f3efee", "#7e7e7e", "#454342"],
		shinyPallet: ["#fefef6", "#729e92", "#4e7266"],
	},
	// Aggron
	"306": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0.6, y: 0.08, w: 0.15, h: 0.15, r: 0.15, color: 2 },
			{ x: 0, y: 0.7, w: 1, h: 0.1, color: 1 },
		],
		normalPallet: ["#7e7e7e", "#f3efee", "#78cad4"],
		shinyPallet: ["#729e92", "#fefef6", "#d96968"],
	},
	// Plusle
	"311": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: -0.08, y: 0.5, w: 0.3, h: 0.3, r: 0.3, color: 1 },
			{ x: 0.78, y: 0.5, w: 0.3, h: 0.3, r: 0.3, color: 1 },
			{ x: -0.03, y: 0.62, w: 0.2, h: 0.06, color: 0 },
			{ x: 0.04, y: 0.56, w: 0.06, h: 0.18, color: 0 },
			{ x: 0.83, y: 0.62, w: 0.2, h: 0.06, color: 0 },
			{ x: 0.89, y: 0.56, w: 0.06, h: 0.18, color: 0 },
		],
		normalPallet: ["#fdfecc", "#e07278"],
		shinyPallet: ["#fefeb2", "#f24e4a"],
	},
	// Minun
	"312": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: -0.08, y: 0.5, w: 0.3, h: 0.3, r: 0.3, color: 1 },
			{ x: 0.78, y: 0.5, w: 0.3, h: 0.3, r: 0.3, color: 1 },
			{ x: -0.03, y: 0.62, w: 0.2, h: 0.06, color: 0 },
			{ x: 0.83, y: 0.62, w: 0.2, h: 0.06, color: 0 },
		],
		normalPallet: ["#fdfecb", "#97ddfb"],
		shinyPallet: ["#fefeb2", "#92feba"],
	},
	// Gulpin
	"316": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#add5a8", "#fae18b"],
		shinyPallet: ["#92eafe", "#fedaa2"],
	},
	// Swalot
	"317": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#b9abd9", "#5e5c5d"],
		shinyPallet: ["#92defe", "#7e7a7a"],
	},
	// Trapinch
	"328": {
		rects: [
			{ x: 0.5, y: 0.8, w: 0.5, h: 0.2, color: 0 },
			{ x: 0, y: 0.25, w: 0.85, h: 0.75, r: 0.37, color: 1 },
			{ x: 0, y: 0.55, w: 0.85, h: 0.45, r: 0.2, color: 1 },
			{ x: 0.6, y: 0.45, w: 0.5, h: 0.5, r: 0.4, color: 1 },
			{ x: 0.05, y: 0.77, w: 0.7, h: 0.05, color: 2 },
		],
		normalPallet: ["#e0e0e0", "#e6a466", "#da7f4a"],
		shinyPallet: ["#9ae2be", "#9ae2be", "#6ab68e"],
	},
	// Vibrava
	"329": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.35, h: 1, color: 1 },
			{ x: 0, y: 0, w: 0.05, h: 1, color: 2 },
			{ x: 0.65, y: 0, w: 0.4, h: 1, color: 1 },
			{ x: 0.95, y: 0, w: 0.05, h: 1, color: 2 },
		],
		normalPallet: ["#fcfcb8", "#84c772", "#656d61"],
		shinyPallet: ["#fefec6", "#de9262", "#767672"],
	},
	// Flygon
	"330": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: -0.35, w: 1, h: 1, r: 0.45, color: 1 },
			{ x: -0.12, y: 0.2, w: 0.3, h: 0.5, r: 0.2, color: 2 },
			{ x: 0.82, y: 0.2, w: 0.3, h: 0.5, r: 0.2, color: 2 },
		],
		normalPallet: ["#def1b1", "#7fbb71", "#dc7890"],
		shinyPallet: ["#daeea6", "#a6e2fe", "#faa642"],
	},
	// Swablu
	"333": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.4, w: 0.5, h: 0.5, r: 0.25, color: 1 },
		],
		normalPallet: ["#f4f4f4", "#3edbff"],
		shinyPallet: ["#fefefe", "#feee7e"],
	},
	// Altaria
	"334": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.35, y: 0.2, w: 0.3, h: 0.4, color: 1 },
			{ x: 0.35, y: 0.1, w: 0.3, h: 0.3, r: 0.15, color: 1 },
		],
		normalPallet: ["#f4f4f4", "#3ddbfe"],
		shinyPallet: ["#fefefe", "#feee7e"],
	},
	// Shuppet
	"353": {
		rects: [{ x: 0, y: 0, w: 1, h: 1, color: 0 }],
		normalPallet: ["#878bb7"],
		shinyPallet: ["#76d2ca"],
	},
	// Banette
	"354": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.4, w: 1, h: 0.1, color: 1 },
		],
		normalPallet: ["#8d8d8d", "#fbe492"],
		shinyPallet: ["#76b2ca", "#76b2ca"],
	},
	// Absol
	"359": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#fdfdfd", "#637cb7"],
		shinyPallet: ["#fefefe", "#fe968a"],
	},
	// Wynaut
	"360": {
		rects: [
			{ x: 0.15, y: 0.15, w: 0.7, h: 0.7, r: 0.33, color: 0 },
			{ x: 0.6, y: 0.85, w: 0.35, h: 0.15, r: 0.1, color: 1 },
			{ x: 0.83, y: 0.89, w: 0.08, h: 0.08, r: 0.04, color: 2 },
			{ x: 0.26, y: 0.65, w: 0.48, h: 0.4, r: 0.3, color: 0 },
			{ x: 0.25, y: 0.8, w: 0.5, h: 0.2, r: 0.1, color: 0 },
		],
		normalPallet: ["#96e9f0", "#494949", "#ffffff"],
		shinyPallet: ["#fecafe", "#feaaee", "#fefefe"],
	},
	// Spheal
	"363": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.5, color: 1 },
		],
		normalPallet: ["#90c2fb", "#fff7dd"],
		shinyPallet: ["#faaefe", "#fefee6"],
	},
	// Spheal (Holiday)
	"8555": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.5, color: 1 },
			{ x: 0.58, y: 0.79, w: 0.44, h: 0.12, r: 0.05, color: 2 },
			{ x: 0.71, y: 0.47, w: 0.18, h: 0.17, r: 0.1, color: 2 },
			{ x: 0.65, y: 0.6, w: 0.3, h: 0.3, r: 0.15, color: 3 },
			{ x: 0.59, y: 0.8, w: 0.42, h: 0.1, r: 0.05, color: 4 },
			{ x: 0.72, y: 0.48, w: 0.16, h: 0.15, r: 0.1, color: 4 },
		],
		normalPallet: ["#90c2fb", "#fff7dd", "#aaaaaa", "#cd5f59", "#fefcf3"],
		shinyPallet: ["#f6aefa", "#fefee2", "#aaaaaa", "#cd5f59", "#fefcf3"],
	},
	// Sealeo
	"364": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.55, w: 1, h: 0.45, color: 1 },
		],
		normalPallet: ["#69defe", "#fef4d6"],
		shinyPallet: ["#feb6fe", "#fef2b6"],
	},
	// Walrein
	"365": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.45, w: 1, h: 0.1, color: 1 },
			{ x: 0, y: 0.55, w: 1, h: 0.55, color: 2 },
		],
		normalPallet: ["#fafafa", "#fff1d4", "#6dcce8"],
		shinyPallet: ["#fefefe", "#fefefe", "#e6aefe"],
	},
	// Bagon
	"371": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.35, color: 1 },
			{ x: 0, y: 0.95, w: 1, h: 0.55, color: 2 },
		],
		normalPallet: ["#9adaf8", "#e8e8e8", "#f8ee8a"],
		shinyPallet: ["#92ee82", "#eae6fa", "#c6c2de"],
	},
	// Shelgon
	"372": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.35, w: 0.5, h: 0.5, r: 0.24, color: 1 },
		],
		normalPallet: ["#f6f6f6", "#a7a8aa"],
		shinyPallet: ["#d2f2d2", "#9e9a7a"],
	},
	// Salamence
	"373": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#79cce2", "#cd5f6f", "#e7eaef"],
		shinyPallet: ["#bcf092", "#fe8e5a", "#efebfd"],
	},
	// Latias
	"380": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.48, color: 1 },
		],
		normalPallet: ["#da5b66", "#ffffff"],
		shinyPallet: ["#feca42", "#f6fafe"],
	},
	// Latios
	"381": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.48, color: 1 },
		],
		normalPallet: ["#76bde7", "#fdfdfd"],
		shinyPallet: ["#aff2d7", "#fdfdfd"],
	},
	// Shinx
	"403": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.85, w: 0.7, h: 0.08, color: 1 },
			{ x: 0.7, y: 0, w: 0.4, h: 1, color: 2 },
			{ x: 0.25, y: 0.3, w: 0.15, h: 0.1, r: 0.1, color: 3 },
		],
		normalPallet: ["#9fe3fe", "#ffed62", "#5e6061", "#fc6575"],
		shinyPallet: ["#feee6a", "#feb24e", "#6e7272", "#feb24e"],
	},
	// Luxio
	"404": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.05, y: 0.1, w: 0.65, h: 0.5, r: 0.2, color: 1 },
			{ x: 0, y: 0.7, w: 1, h: 0.6, color: 1 },
			{ x: 0, y: 0.85, w: 1, h: 0.05, color: 2 },
			{ x: 0, y: 0.92, w: 1, h: 0.05, color: 2 },
			{ x: 0.25, y: 0.35, w: 0.15, h: 0.1, r: 0.1, color: 3 },
			{ x: 0.7, y: 0, w: 0.4, h: 1, color: 0 },
		],
		normalPallet: ["#5e6061", "#96e1ff", "#fbea6a", "#fc6575"],
		shinyPallet: ["#6e7272", "#feee6a", "#feb24e", "#feb24e"],
	},
	// Luxray
	"405": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.2, w: 0.55, h: 0.45, r: 0.2, color: 1 },
			{ x: 0.3, y: 0.38, w: 0.15, h: 0.1, r: 0.1, color: 2 },
			{ x: 0.78, y: 0.7, w: 0.2, h: 0.2, r: 0.2, color: 3 },
		],
		normalPallet: ["#5e6061", "#9ce0fe", "#fc6575", "#ffea63"],
		shinyPallet: ["#6e7272", "#feee6a", "#6e7272", "#feee6a"],
	},
	// Drifloon
	"425": {
		rects: [
			{ x: 0.35, y: 0.4, w: 0.05, h: 0.6, color: 0 },
			{ x: 0.6, y: 0.4, w: 0.05, h: 0.6, color: 0 },
			{ x: 0.15, y: 0.05, w: 0.7, h: 0.7, r: 0.5, color: 1 },
			{ x: 0.2, y: 0.93, w: 0.6, h: 0.1, color: 2 },
			{ x: 0.4, y: 0.4, w: 0.2, h: 0.2, r: 0.2, color: 2 },
			{ x: 0.25, y: 0.05, w: 0.5, h: 0.2, r: 0.4, color: 3 },
		],
		normalPallet: ["#999999", "#d3bceb", "#fff769", "#ffffff"],
		shinyPallet: ["#fef272", "#fef272", "#82f6fe", "#fefefe"],
	},
	// Drifblim
	"426": {
		rects: [
			{ x: 0.2, y: 0.4, w: 0.6, h: 0.45, color: 0 },
			{ x: 0.18, y: 0.85, w: 0.64, h: 0.2, color: 1 },
			{ x: 0.1, y: 0, w: 0.8, h: 0.8, r: 0.5, color: 2 },
			{ x: 0.35, y: -0.05, w: 0.3, h: 0.2, r: 0.4, color: 3 },
			{ x: 0.4, y: 0.4, w: 0.2, h: 0.2, r: 0.2, color: 4 },
		],
		normalPallet: ["#e6dced", "#fff768", "#8b7caa", "#ffffff", "#fff56a"],
		shinyPallet: ["#fefebe", "#82f6fe", "#fee662", "#fefefe", "#82f6fe"],
	},
	// Honchkrow
	"430": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.15, y: 0.1, w: 0.5, h: 0.57, r: 0.4, color: 1 },
			{ x: 0.2, y: 0.2, w: 0.3, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.75, y: 0.55, w: 0.3, h: 0.3, r: 0.3, color: 3 },
			{ x: 0, y: 0, w: 1, h: 0.18, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.3, color: 4 },
			{ x: 0, y: 0.95, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#50658e", "#fefefe", "#f8f094", "#c03d43", "#7f8285"],
		shinyPallet: ["#d795f1", "#fefefe", "#f8f094", "#b54958", "#7f8285"],
	},
	// Bonsly
	"438": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#c1907a", "#8fc261"],
		shinyPallet: ["#daca76", "#f672ba"],
	},
	// Mime Jr.
	"439": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.35, color: 1 },
			{ x: 0.4, y: 0.6, w: 0.2, h: 0.2, r: 0.1, color: 2 },
		],
		normalPallet: ["#ffe0ee", "#4479ab", "#f97b95"],
		shinyPallet: ["#feeeea", "#4eae6a", "#ea6ed6"],
	},
	// Happiny
	"440": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.1, color: 1 },
			{ x: 0.3, y: 0.45, w: 0.4, h: 0.3, r: 0.2, color: 1 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 2 },
		],
		normalPallet: ["#ffdee4", "#ffffff", "#e593a6"],
		shinyPallet: ["#fee2fe", "#fefefe", "#faa2ea"],
	},
	// Spiritomb
	"442": {
		rects: [
			{ x: 0.32, y: 0.2, w: 0.39, h: 0.78, r: 0.1, color: 0 },
			{ x: 0.02, y: 0, w: 0.96, h: 0.8, r: 0.3, color: 1 },
			{ x: 0.11, y: 0.4, w: 0.24, h: 0.24, r: 0.2, color: 2 },
			{ x: 0.18, y: 0.47, w: 0.1, h: 0.1, r: 0.2, color: 3 },
			{ x: 0.72, y: 0.23, w: 0.18, h: 0.18, r: 0.2, color: 2 },
			{ x: 0.77, y: 0.28, w: 0.08, h: 0.08, r: 0.2, color: 4 },
			{ x: 0.4, y: 0.3, w: 0.2, h: 0.2, r: 0.3, color: 5 },
		],
		normalPallet: [
			"#e7decf",
			"#e0abd6",
			"#aace4e",
			"#f9f27e",
			"#c6e55e",
			"#a0c85c",
		],
		shinyPallet: [
			"#eedeba",
			"#8adad6",
			"#e682d6",
			"#fea6ce",
			"#e682d6",
			"#e682d6",
		],
	},
	// Riolu
	"447": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.3, w: 1, h: 0.3, color: 1 },
		],
		normalPallet: ["#7ab9d5", "#57646b"],
		shinyPallet: ["#fefe8e", "#5e7e8e"],
	},
	// Lucario
	"448": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.3, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.6, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#42b4dd", "#58646b", "#f9f5b1"],
		shinyPallet: ["#fefe8e", "#5e7e8e", "#9ee6e6"],
	},
	// Croagunk
	"453": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.4, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#5597c2", "#f5f4f1", "#56534e"],
		shinyPallet: ["#76d6c2", "#fefefe", "#5e5a56"],
	},
	// Toxicroak
	"454": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 1 },
		],
		normalPallet: ["#60a1ce", "#d77a73"],
		shinyPallet: ["#7edeca", "#ee82de"],
	},
	// Snover
	"459": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 2 },
		],
		normalPallet: ["#f4f4f4", "#62a3ab", "#b39888"],
		shinyPallet: ["#eaf6f2", "#52aeda", "#beba92"],
	},
	// Abomasnow
	"460": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.65, w: 1, h: 0.35, color: 1 },
		],
		normalPallet: ["#f4f4f4", "#62a3ab"],
		shinyPallet: ["#eaf2f6", "#52aeda"],
	},
	// Weavile
	"461": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.28, color: 1 },
			{ x: 0.4, y: 0.38, w: 0.2, h: 0.28, r: 0.11, color: 2 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, r: 0.4, color: 1 },
		],
		normalPallet: ["#64749a", "#a73951", "#edc36f"],
		shinyPallet: ["#f676a2", "#feca52", "#feee6e"],
	},
	// Magnezone
	"462": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 3 },
		],
		normalPallet: ["#b8d2ee", "#c1c6c9", "#ffdc3e", "#878587"],
		shinyPallet: ["#f4f7f8", "#d6cabb", "#f5ef8c", "#948487"],
	},
	// Togekiss
	"468": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.35, h: 0.2, color: 1 },
			{ x: 0.65, y: 0, w: 0.35, h: 0.2, color: 2 },
		],
		normalPallet: ["#f2f9fa", "#fc5300", "#49b9d8"],
		shinyPallet: ["#fffffa", "#6aa3df", "#ce6d5c"],
	},
	// Leafeon
	"470": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.3, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#fcf3c2", "#77d099", "#aedb9e"],
		shinyPallet: ["#feeeb2", "#5ed27a", "#5ed27a"],
	},
	// Glaceon
	"471": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.4, color: 1 },
		],
		normalPallet: ["#c3e4e3", "#5ebbd2"],
		shinyPallet: ["#eefefa", "#7edaf2"],
	},
	// Gallade
	"475": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 1 },
			{ x: 0.45, y: 0.4, w: 0.1, h: 0.15, r: 0.1, color: 2 },
		],
		normalPallet: ["#f2f6fa", "#0dba6d", "#dd717c"],
		shinyPallet: ["#fefefe", "#5e92d6", "#ca6641"],
	},
	// Cresselia
	"488": {
		rects: [
			{ x: 0, y: 0, w: 0.4, h: 1, color: 0 },
			{ x: 0.1, y: 0.1, w: 0.15, h: 0.2, r: 0.2, color: 1 },
			{ x: 0.4, y: 0.3, w: 0.6, h: 0.8, color: 2 },
			{ x: 0.4, y: 0, w: 0.6, h: 0.1, color: 3 },
			{ x: 0.4, y: 0.1, w: 0.6, h: 0.1, color: 4 },
			{ x: 0.4, y: 0.2, w: 0.6, h: 0.1, color: 5 },
		],
		normalPallet: [
			"#f6e592",
			"#d67cd2",
			"#9ac0f1",
			"#fdf8fe",
			"#edb7e4",
			"#ce7bc4",
		],
		shinyPallet: [
			"#feeaae",
			"#82f6ee",
			"#ba82ce",
			"#fefefe",
			"#82f6ee",
			"#82f6ee",
		],
	},
	// Darkrai
	"491": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0.1, w: 0.5, h: 0.5, r: 0.3, color: 1 },
			{ x: 0.36, y: 0.18, w: 0.28, h: 0.26, r: 0.3, color: 0 },
			{ x: 0.35, y: 0.35, w: 0.3, h: 0.3, r: 0.2, color: 1 },
			{ x: 0.4, y: -0.2, w: 0.2, h: 0.5, r: 0.1, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 3 },
		],
		normalPallet: ["#656661", "#bf354f", "#f3f3f3", "#42413f"],
		shinyPallet: ["#656661", "#bf354f", "#f3f3f3", "#42413f"],
	},
	// Munna
	"517": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.15, y: 0.5, w: 0.2, h: 0.25, r: 0.2, color: 1 },
			{ x: 0.7, y: 0.1, w: 0.4, h: 0.4, r: 0.4, color: 2 },
			{ x: 0.8, y: 0.2, w: 0.2, h: 0.2, r: 0.4, color: 3 },
		],
		normalPallet: ["#f5dde3", "#e595ad", "#b28cca", "#e596ad"],
		shinyPallet: ["#fefe9a", "#eab1c5", "#9aea7e", "#9aea7e"],
	},
	// Musharna
	"518": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.65, y: 0, w: 0.5, h: 1, color: 1 },
			{ x: 0.65, y: 0.8, w: 0.5, h: 0.3, color: 2 },
			{ x: 0, y: 0, w: 0.15, h: 1, color: 3 },
		],
		normalPallet: ["#f5dcdc", "#9483cb", "#e696ab", "#e698ad"],
		shinyPallet: ["#fedeea", "#85aecf", "#7e6cc6", "#8666ca"],
	},
	// Dwebble
	"557": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.65, w: 1, h: 1, color: 1 },
		],
		normalPallet: ["#9e968f", "#e7b474"],
		shinyPallet: ["#7a7676", "#fea27a"],
	},
	// Crustle
	"558": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0, y: 0.41, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: 0.8, w: 1, h: 1, color: 3 },
		],
		normalPallet: ["#a99073", "#c5ad8b", "#f0d083", "#e29672"],
		shinyPallet: ["#9a8e86", "#b6a6a2", "#e2ea72", "#b6a6a2"],
	},
	// Rufflet
	"627": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: -0.2, w: 1, h: 1, r: 0.2, color: 1 },
			{ x: 0.25, y: 0.35, w: 0.5, h: 0.35, r: 0.2, color: 0 },
			{ x: 0.35, y: 0.6, w: 0.3, h: 0.2, r: 0.2, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 2 },
		],
		normalPallet: ["#a09fcd", "#feffe1", "#f8ee97"],
		shinyPallet: ["#cea67a", "#fefef6", "#f8f992"],
	},
	// Braviary
	"628": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.2, h: 1, color: 1 },
			{ x: 0.8, y: 0, w: 0.2, h: 1, color: 1 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: -0.2, w: 1, h: 0.6, r: 0.2, color: 3 },
			{ x: 0.3, y: 0.3, w: 0.4, h: 0.2, r: 0.1, color: 4 },
			{ x: 0.3, y: 0.1, w: 0.4, h: 0.2, r: 0.1, color: 5 },
			{ x: 0.3, y: 0.25, w: 0.4, h: 0.1, color: 6 },
		],
		normalPallet: [
			"#716d8f",
			"#af3745",
			"#e4d463",
			"#fffffd",
			"#f1e067",
			"#aa3745",
			"#66a0ea",
		],
		shinyPallet: [
			"#86665a",
			"#4e8ad6",
			"#86665a",
			"#fefefe",
			"#f4e36a",
			"#4e8ad6",
			"#a74a3d",
		],
	},
	// Tyrunt
	"696": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#776755", "#c1c1c1", "#e6a059"],
		shinyPallet: ["#5aa2de", "#c6c6be", "#a2a29a"],
	},
	// Tyrantrum
	"697": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0, y: 0.4, w: 1, h: 0.2, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 3 },
		],
		normalPallet: ["#ae7376", "#ebb76a", "#ffffff", "#55524e"],
		shinyPallet: ["#5682c6", "#9e9a96", "#fefefe", "#3e5a96"],
	},
	// Sylveon
	"700": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.25, color: 1 },
			{ x: 0, y: 0.2, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: 0.8, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#ffffff", "#f5a6b7", "#a9e2fb"],
		shinyPallet: ["#fefefe", "#8ee2fe", "#feaed2"],
	},
	// Dedenne
	"702": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.5, w: 1, h: 0.7, r: 0.25, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
		],
		normalPallet: ["#efb44e", "#fefaaa", "#4b4441"],
		shinyPallet: ["#b68a7a", "#fefa6e", "#926652"],
	},
	// Pumpkaboo (Small)
	"29382": {
		rects: [
			{ x: 0.29, y: 0.42, w: 0.42, h: 0.33, r: 0.15, color: 0 },
			{ x: 0.38, y: 0.58, w: 0.05, h: 0.08, r: 0.2, color: 1 },
			{ x: 0.58, y: 0.58, w: 0.05, h: 0.08, r: 0.2, color: 1 },
			{ x: 0.17, y: 0.38, w: 0.67, h: 0.17, r: 0.15, color: 2 },
			{ x: 0.38, y: 0.21, w: 0.25, h: 0.33, r: 0.15, color: 2 },
		],
		normalPallet: ["#eab2a2", "#f6e864", "#816a58"],
		shinyPallet: ["#b58dc4", "#fefa6e", "#5d5a61"],
	},
	// Pumpkaboo (Medium)
	"33478": {
		rects: [
			{ x: 0.25, y: 0.4, w: 0.5, h: 0.4, r: 0.15, color: 0 },
			{ x: 0.34, y: 0.6, w: 0.07, h: 0.1, r: 0.2, color: 1 },
			{ x: 0.59, y: 0.6, w: 0.07, h: 0.1, r: 0.2, color: 1 },
			{ x: 0.1, y: 0.35, w: 0.8, h: 0.2, r: 0.15, color: 2 },
			{ x: 0.35, y: 0.15, w: 0.3, h: 0.4, r: 0.15, color: 2 },
		],
		normalPallet: ["#eab2a2", "#f6e864", "#816a58"],
		shinyPallet: ["#b58dc4", "#fefa6e", "#5d5a61"],
	},
	// Pumpkaboo (Large)
	"37574": {
		rects: [
			{ x: 0.21, y: 0.38, w: 0.58, h: 0.46, r: 0.16, color: 0 },
			{ x: 0.31, y: 0.62, w: 0.1, h: 0.12, r: 0.2, color: 1 },
			{ x: 0.59, y: 0.62, w: 0.1, h: 0.12, r: 0.2, color: 1 },
			{ x: 0.04, y: 0.33, w: 0.92, h: 0.23, r: 0.15, color: 2 },
			{ x: 0.33, y: 0.12, w: 0.33, h: 0.4, r: 0.15, color: 2 },
		],
		normalPallet: ["#eab2a2", "#f6e864", "#816a58"],
		shinyPallet: ["#b58dc4", "#fefa6e", "#5d5a61"],
	},
	// Pumpkaboo (Jumbo)
	"41670": {
		rects: [
			{ x: 0.17, y: 0.35, w: 0.67, h: 0.52, r: 0.18, color: 0 },
			{ x: 0.29, y: 0.65, w: 0.12, h: 0.13, r: 0.2, color: 1 },
			{ x: 0.59, y: 0.65, w: 0.12, h: 0.13, r: 0.2, color: 1 },
			{ x: 0, y: 0.3, w: 1, h: 0.27, r: 0.15, color: 2 },
			{ x: 0.3, y: 0.08, w: 0.4, h: 0.4, r: 0.15, color: 2 },
		],
		normalPallet: ["#eab2a2", "#f6e864", "#816a58"],
		shinyPallet: ["#b58dc4", "#fefa6e", "#5d5a61"],
	},
	// Pumpkaboo (Small)
	"29383": {
		rects: [
			{ x: 0.24, y: 0.58, w: 0.52, h: 0.42, r: 0.18, color: 0 },
			{ x: 0.41, y: 0.18, w: 0.18, h: 0.45, r: 0.1, color: 1 },
			{ x: 0.2, y: 0.18, w: 0.1, h: 0.55, r: 0.05, color: 2 },
			{ x: 0.68, y: 0.18, w: 0.1, h: 0.55, r: 0.05, color: 2 },
			{ x: 0.22, y: 0.18, w: 0.56, h: 0.1, r: 0.05, color: 2 },
		],
		normalPallet: ["#836c59", "#e5c786", "#ebb3a0"],
		shinyPallet: ["#5d5c61", "#efd1ac", "#be90d1"],
	},
	// Pumpkaboo (Medium)
	"33479": {
		rects: [
			{ x: 0.2, y: 0.55, w: 0.6, h: 0.45, r: 0.2, color: 0 },
			{ x: 0.4, y: 0.1, w: 0.2, h: 0.5, r: 0.1, color: 1 },
			{ x: 0.2, y: 0.1, w: 0.1, h: 0.6, r: 0.05, color: 2 },
			{ x: 0.7, y: 0.1, w: 0.1, h: 0.6, r: 0.05, color: 2 },
			{ x: 0.2, y: 0.1, w: 0.6, h: 0.1, r: 0.05, color: 2 },
		],
		normalPallet: ["#836c59", "#e5c786", "#ebb3a0"],
		shinyPallet: ["#5d5c61", "#efd1ac", "#be90d1"],
	},
	// Pumpkaboo (Large)
	"37575": {
		rects: [
			{ x: 0.15, y: 0.52, w: 0.68, h: 0.48, r: 0.2, color: 0 },
			{ x: 0.38, y: 0.05, w: 0.24, h: 0.55, r: 0.1, color: 1 },
			{ x: 0.18, y: 0.05, w: 0.1, h: 0.6, r: 0.05, color: 2 },
			{ x: 0.72, y: 0.05, w: 0.1, h: 0.6, r: 0.05, color: 2 },
			{ x: 0.2, y: 0.05, w: 0.6, h: 0.1, r: 0.05, color: 2 },
		],
		normalPallet: ["#836c59", "#e5c786", "#ebb3a0"],
		shinyPallet: ["#5d5c61", "#efd1ac", "#be90d1"],
	},
	// Pumpkaboo (Jumbo)
	"41671": {
		rects: [
			{ x: 0.12, y: 0.48, w: 0.74, h: 0.52, r: 0.22, color: 0 },
			{ x: 0.38, y: 0, w: 0.24, h: 0.58, r: 0.1, color: 1 },
			{ x: 0.16, y: 0, w: 0.12, h: 0.6, r: 0.05, color: 2 },
			{ x: 0.74, y: 0, w: 0.12, h: 0.6, r: 0.05, color: 2 },
			{ x: 0.2, y: 0, w: 0.6, h: 0.1, r: 0.05, color: 2 },
		],
		normalPallet: ["#836c59", "#e5c786", "#ebb3a0"],
		shinyPallet: ["#5d5c61", "#efd1ac", "#be90d1"],
	},
	// Noibat
	"714": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.1, w: 0.8, h: 1.1, r: 0.15, color: 1 },
			{ x: 0.1, y: 0.8, w: 0.8, h: 0.1, color: 2 },
			{ x: 0.3, y: 0.3, w: 0.4, h: 0.42, r: 0.2, color: 3 },
			{ x: 0.35, y: 0.4, w: 0.3, h: 0.28, r: 0.2, color: 2 },
		],
		normalPallet: ["#ad64c9", "#e9d4f1", "#6f625f", "#a860c5"],
		shinyPallet: ["#5a565a", "#a6fada", "#a68e76", "#5a565a"],
	},
	// Noivern
	"715": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.08, y: 0, w: 0.84, h: 1.2, r: 0.1, color: 1 },
			{ x: 0.21, y: 0.04, w: 0.24, h: 0.28, r: 0.2, color: 2 },
			{ x: 0.55, y: 0.04, w: 0.24, h: 0.28, r: 0.2, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.05, color: 3 },
			{ x: 0, y: 0.95, w: 1, h: 0.05, color: 4 },
		],
		normalPallet: ["#9d6fcd", "#5d5453", "#73bba7", "#e8e4dd", "#b24246"],
		shinyPallet: ["#7a5e5e", "#9aeea2", "#b64668", "#806ad7", "#9aeea2"],
	},
	// Grubbin
	"736": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.26, w: 0.7, h: 0.44, r: 0.25, color: 1 },
			{ x: 0.1, y: 0.5, w: 0.7, h: 0.44, r: 0.25, color: 2 },
			{ x: 0.1, y: 0.5, w: 0.7, h: 0.2, color: 3 },
		],
		normalPallet: ["#eff8fc", "#f3863c", "#9a6a41", "#ffed8d"],
		shinyPallet: ["#eefafe", "#fa5a56", "#fa5a56", "#feaa96"],
	},
	// Charjabug
	"737": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.33, y: 0.33, w: 0.34, h: 0.67, color: 1 },
			{ x: 0, y: 0.33, w: 0.34, h: 0.33, color: 2 },
			{ x: 0.67, y: 0.33, w: 0.33, h: 0.33, color: 2 },
			{ x: 0, y: 0.66, w: 0.33, h: 0.34, color: 3 },
			{ x: 0.67, y: 0.66, w: 0.33, h: 0.34, color: 3 },
		],
		normalPallet: ["#a0bb50", "#d3d4cb", "#518fc5", "#ffd057"],
		shinyPallet: ["#ee5a4e", "#f2eae6", "#62aeca", "#fef6b6"],
	},
	// Vikavolt
	"738": {
		rects: [
			{ x: 0, y: 0.15, w: 1, h: 0.2, color: 0 },
			{ x: 0.45, y: 0.65, w: 0.1, h: 0.1, color: 1 },
			{ x: 0.1, y: 0.55, w: 0.8, h: 0.1, color: 2 },
			{ x: 0.1, y: 0.45, w: 0.8, h: 0.1, color: 3 },
			{ x: 0.35, y: 0.55, w: 0.1, h: 0.5, color: 3 },
			{ x: 0.55, y: 0.55, w: 0.1, h: 0.5, color: 3 },
			{ x: 0.25, y: 0.55, w: 0.1, h: 0.5, color: 2 },
			{ x: 0.65, y: 0.55, w: 0.1, h: 0.5, color: 2 },
			{ x: 0.3, y: 0.3, w: 0.4, h: 0.25, color: 3 },
			{ x: 0, y: 0, w: 0.3, h: 0.35, color: 3 },
			{ x: 0.7, y: 0, w: 0.3, h: 0.35, color: 3 },
		],
		normalPallet: ["#a4aab5", "#feac6a", "#ffe460", "#3e6979"],
		shinyPallet: ["#bababa", "#d0646f", "#8eea5e", "#eaeaea"],
	},
	// Cutiefly
	"742": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.25, w: 0.8, h: 0.6, r: 0.4, color: 1 },
			{ x: 0.06, y: 0.38, w: 0.28, h: 0.37, r: 0.3, color: 2 },
			{ x: 0.12, y: 0.48, w: 0.08, h: 0.08, r: 0.02, color: 1 },
			{ x: 0.2, y: 0.58, w: 0.08, h: 0.08, r: 0.02, color: 3 },
			{ x: 0.64, y: 0.38, w: 0.28, h: 0.37, r: 0.3, color: 2 },
			{ x: 0.78, y: 0.48, w: 0.08, h: 0.08, r: 0.02, color: 1 },
			{ x: 0.7, y: 0.58, w: 0.08, h: 0.08, r: 0.02, color: 3 },
		],
		normalPallet: ["#ffe85f", "#f9f9f9", "#3f3f3f", "#d3a885"],
		shinyPallet: ["#f5e2e8", "#f9f9f9", "#4c4b4c", "#e3cfc0"],
	},
	// Ribombee
	"743": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.1, w: 0.8, h: 0.6, r: 0.4, color: 1 },
			{ x: 0.08, y: 0.23, w: 0.28, h: 0.37, r: 0.3, color: 2 },
			{ x: 0.17, y: 0.31, w: 0.08, h: 0.08, r: 0.02, color: 1 },
			{ x: 0.18, y: 0.43, w: 0.08, h: 0.08, r: 0.02, color: 3 },
			{ x: 0.64, y: 0.23, w: 0.28, h: 0.37, r: 0.3, color: 2 },
			{ x: 0.75, y: 0.31, w: 0.08, h: 0.08, r: 0.02, color: 1 },
			{ x: 0.74, y: 0.43, w: 0.08, h: 0.08, r: 0.02, color: 3 },
			{ x: 0, y: 0.65, w: 1, h: 0.5, color: 4 },
			{ x: 0.3, y: 0.7, w: 0.4, h: 0.5, r: 0.1, color: 0 },
			{ x: 0.3, y: 0.88, w: 0.4, h: 0.5, color: 1 },
		],
		normalPallet: ["#ffe85f", "#f9f9f9", "#3f3f3f", "#d3a885", "#997558"],
		shinyPallet: ["#fedae2", "#fefefe", "#4b4b4b", "#e0d1c3", "#da4a4e"],
	},
	// Stufful
	"759": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.2, w: 1, h: 0.2, color: 1 },
			{ x: 0, y: 0.6, w: 1, h: 0.4, color: 2 },
		],
		normalPallet: ["#ffc2d0", "#fffcfc", "#715449"],
		shinyPallet: ["#fee262", "#fefefe", "#966a56"],
	},
	// Bewear
	"760": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.4, w: 1, h: 0.6, color: 1 },
		],
		normalPallet: ["#ffc2d0", "#49504c"],
		shinyPallet: ["#fee262", "#666256"],
	},
	// Comfey
	"764": {
		rects: [
			{ x: 0, y: 0, w: 0.34, h: 0.34, color: 0 },
			{ x: 0, y: 0.66, w: 0.34, h: 0.34, color: 1 },
			{ x: 0, y: 0.3, w: 0.42, h: 0.42, r: 0.05, color: 2 },
			{ x: 0.34, y: 0.66, w: 0.34, h: 0.34, color: 3 },
			{ x: 0.66, y: 0.66, w: 0.34, h: 0.34, color: 4 },
			{ x: 0.66, y: 0.34, w: 0.34, h: 0.34, color: 5 },
			{ x: 0.66, y: 0, w: 0.34, h: 0.34, color: 6 },
			{ x: 0.34, y: 0, w: 0.34, h: 0.34, color: 7 },
		],
		normalPallet: [
			"#f6f6ea",
			"#f55d5e",
			"#f0f49a",
			"#fded59",
			"#f38bc8",
			"#e33336",
			"#f5d266",
			"#feadd3",
		],
		shinyPallet: [
			"#f6f6e8",
			"#e07760", // 左下
			"#bde9fc", // 顔
			"#f9f78e", // した中央
			"#ecb2e0", // 右下 (ピンク)
			"#d9624d",
			"#f7f290", // 右上
			"#f2d0eb",
		],
	},
	// Togedemaru
	"777": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.08, y: 0.3, w: 0.8, h: 0.74, r: 0.15, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.05, color: 2 },
		],
		normalPallet: ["#c6c8c5", "#fafbfc", "#f7ea68"],
		shinyPallet: ["#feeee6", "#fefefe", "#fefe86"],
	},
	// Mimikyu
	"778": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: -0.1, y: -0.15, w: 0.3, h: 0.3, r: 0.2, color: 1 },
			{ x: 0.79, y: -0.15, w: 0.3, h: 0.3, r: 0.2, color: 1 },
			{ x: 0.2, y: 0.13, w: 0.16, h: 0.18, r: 0.2, color: 1 },
			{ x: 0.6, y: 0.11, w: 0.16, h: 0.22, r: 0.2, color: 1 },
			{ x: 0.04, y: 0.26, w: 0.15, h: 0.17, r: 0.2, color: 2 },
			{ x: 0.83, y: 0.26, w: 0.15, h: 0.17, r: 0.2, color: 2 },
			{ x: 0.22, y: 0.36, w: 0.58, h: 0.04, r: 0.02, color: 1 },
			{ x: 0.4, y: 0.6, w: 0.05, h: 0.15, r: 0.2, color: 1 },
			{ x: 0.55, y: 0.6, w: 0.05, h: 0.15, r: 0.2, color: 1 },
			{ x: 0, y: 0.94, w: 1, h: 0.2, color: 1 },
		],
		normalPallet: ["#f6f0a1", "#66662f", "#ff9940"],
		shinyPallet: ["#fef6ea", "#a28a7e", "#d6c6ba"],
	},
	// Drampa
	"780": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 0.5, h: 1, r: 0.1, color: 1 },
			{ x: 0, y: 0.6, w: 1, h: 1, color: 1 },
			{ x: 0.5, y: 0.4, w: 0.4, h: 0.4, r: 0.4, color: 0 },
			{ x: 0.7, y: 0.4, w: 0.4, h: 0.4, color: 0 },
			{ x: 0.7, y: 0, w: 0.45, h: 0.5, r: 0.4, color: 1 },
			{ x: 0, y: 0.1, w: 0.4, h: 0.1, color: 2 },
			{ x: 0, y: 0.2, w: 0.4, h: 0.1, color: 3 },
			{ x: 0, y: 0.3, w: 0.4, h: 0.1, color: 0 },
			{ x: 0, y: 0.4, w: 0.4, h: 0.4, r: 0.1, color: 4 },
			{ x: 0, y: 0.4, w: 0.4, h: 0.2, color: 4 },
		],
		normalPallet: ["#76aea2", "#fdfbf2", "#f5e760", "#e5c0d6", "#dde4b8"],
		shinyPallet: ["#eabe76", "#fefef2", "#575f8f", "#f1cfe1", "#fefeca"],
	},
	// Cramorant
	"845": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.5, w: 0.6, h: 0.5, r: 0.2, color: 1 },
			{ x: 0.3, y: 0.2, w: 0.4, h: 0.15, r: 0.2, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 3 },
		],
		normalPallet: ["#339eff", "#e3ecff", "#ffea63", "#5f6f73"],
		shinyPallet: ["#fe9642", "#fefaea", "#fef2a2", "#66767a"],
	},
	// Toxel
	"848": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.3, color: 1 },
			{ x: -0.1, y: 0.85, w: 0.3, h: 0.3, r: 0.2, color: 0 },
			{ x: 0.8, y: 0.85, w: 0.3, h: 0.3, r: 0.2, color: 0 },
			{ x: 0, y: 0.45, w: 1, h: 0.2, color: 2 },
			{ x: 0.4, y: -0.08, w: 0.2, h: 0.3, r: 0.2, color: 2 },
		],
		normalPallet: ["#a370d3", "#d7c4f8", "#f6f6f6"],
		shinyPallet: ["#fe82aa", "#fefefe", "#fefefe"],
	},
	// Toxtricity (Amped)
	"21329": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.3, w: 1, h: 0.4, color: 1 },
			{ x: 0, y: 0.7, w: 1, h: 0.15, color: 2 },
			{ x: 0.4, y: -0.1, w: 0.2, h: 0.3, r: 0.1, color: 3 },
			{ x: 0.4, y: 0.35, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.52, y: 0.35, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.26, y: 0.32, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.66, y: 0.32, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.32, y: 0.52, w: 0.08, h: 0.16, r: 0.1, color: 2 },
			{ x: 0.59, y: 0.52, w: 0.08, h: 0.16, r: 0.1, color: 2 },
		],
		normalPallet: ["#8d6eb9", "#fcfc7b", "#b593e5", "#faf398"],
		shinyPallet: ["#e26ea6", "#fefe62", "#b286fe", "#fefe62"],
	},
	// Toxtricity (Low Key)
	"25425": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0.3, w: 1, h: 0.4, color: 1 },
			{ x: 0, y: 0.7, w: 1, h: 0.15, color: 2 },
			{ x: -0.1, y: -0.1, w: 0.4, h: 0.23, r: 0.05, color: 3 },
			{ x: 0.7, y: -0.1, w: 0.4, h: 0.23, r: 0.05, color: 3 },
			{ x: 0.4, y: 0.35, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.52, y: 0.35, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.26, y: 0.32, w: 0.08, h: 0.2, r: 0.1, color: 2 },
			{ x: 0.66, y: 0.32, w: 0.08, h: 0.2, r: 0.1, color: 2 },
		],
		normalPallet: ["#8566b2", "#ade9fc", "#ad8bde", "#d4faf9"],
		shinyPallet: ["#ba4a8a", "#92f6fe", "#b286fa", "#92f6fe"],
	},
	// Sprigatito
	"906": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0.15, y: 0.25, w: 0.7, h: 0.55, r: 0.32, color: 1 },
		],
		normalPallet: ["#fcffe0", "#7dc556"],
		shinyPallet: ["#fefee2", "#56e28a"],
	},
	// Floragato
	"907": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 1 },
			{ x: 0.2, y: 0.3, w: 0.6, h: 0.4, r: 0.3, color: 2 },
			{ x: 0.1, y: 0.9, w: 0.8, h: 0.8, r: 0.1, color: 3 },
			{ x: 0.7, y: 0.7, w: 0.3, h: 0.3, r: 0.15, color: 4 },
		],
		normalPallet: ["#fcffe0", "#73d168", "#4e8351", "#75d169", "#e05a8e"],
		shinyPallet: ["#fefee2", "#56e28a", "#427e6a", "#56e28a", "#b69cd8"],
	},
	// Meowscarada
	"908": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0, w: 0.8, h: 1, color: 1 },
			{ x: 0.42, y: 0.3, w: 0.16, h: 0.16, r: 0.05, color: 2 },
			{ x: 0.25, y: 0.5, w: 0.16, h: 0.16, r: 0.05, color: 2 },
			{ x: 0.59, y: 0.5, w: 0.16, h: 0.16, r: 0.05, color: 2 },
			{ x: 0.3, y: -0.2, w: 0.4, h: 0.4, r: 0.2, color: 0 },
			{ x: 0.3, y: 0.8, w: 0.4, h: 0.19, r: 0.1, color: 0 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 3 },
		],
		normalPallet: ["#feffed", "#485440", "#57aa5e", "#e36586"],
		shinyPallet: ["#fefeee", "#32524e", "#26aa82", "#9a80d6"],
	},
	// Fuecoco
	"909": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.1, y: 0.2, w: 0.8, h: 0.5, r: 0.25, color: 1 },
			{ x: 0.1, y: 0.4, w: 0.8, h: 0.3, r: 0.15, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 3 },
			{ x: 0.2, y: 0.9, w: 0.6, h: 0.1, color: 4 },
		],
		normalPallet: ["#f4693f", "#fffffb", "#feef7b", "#51545c", "#fffada"],
		shinyPallet: ["#fe96b6", "#fefef6", "#fef27a", "#865a52", "#fefef6"],
	},
	// Crocalor
	"910": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.2, y: 0.3, w: 0.6, h: 0.5, r: 0.2, color: 1 },
			{ x: 0.2, y: 0.6, w: 0.6, h: 0.2, color: 1 },
			{ x: 0, y: 0, w: 1, h: 0.3, color: 2 },
			{ x: 0.4, y: 0, w: 0.2, h: 0.25, r: 0.2, color: 3 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 4 },
		],
		normalPallet: ["#fb6855", "#fffffb", "#fec960", "#fffe86", "#56534b"],
		shinyPallet: ["#fe82a6", "#fefefa", "#feca62", "#fefe86", "#ee628e"],
	},
	// Skeledirge
	"911": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.25, color: 1 },
			{ x: 0, y: 0.25, w: 1, h: 0.25, color: 2 },
			{ x: 0.3, y: 0.2, w: 0.4, h: 0.5, r: 0.15, color: 3 },
			{ x: 0.3, y: 0.5, w: 0.4, h: 0.5, color: 3 },
			{ x: 0.4, y: 0.6, w: 0.2, h: 0.2, r: 0.1, color: 4 },
			{ x: 0.45, y: 0.65, w: 0.1, h: 0.1, r: 0.05, color: 5 },
			{ x: 0.4, y: 0.25, w: 0.2, h: 0.18, color: 6 },
			{ x: 0, y: 0.9, w: 1, h: 0.2, color: 7 },
		],
		normalPallet: [
			"#fe5d5c",
			"#fea51d",
			"#ffff4c",
			"#ffffff",
			"#f3a919",
			"#ffff4d",
			"#de5dff",
			"#56534b",
		],
		shinyPallet: [
			"#fe66ba",
			"#fea21a",
			"#fefe4e",
			"#fefee2",
			"#fea21a",
			"#fefe4e",
			"#fefee2",
			"#e64aa2",
		],
	},
	// Quaxly
	"912": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.55, r: 0.5, color: 1 },
			{ x: 0.2, y: 0.65, w: 0.6, h: 0.3, r: 0.5, color: 2 },
		],
		normalPallet: ["#fefefe", "#72f5fa", "#fff575"],
		shinyPallet: ["#fefefe", "#b2fef2", "#fef676"],
	},
	// Quaxwell
	"913": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.25, y: 0, w: 0.5, h: 0.4, r: 0.5, color: 1 },
			{ x: 0.25, y: 0.25, w: 0.5, h: 0.2, color: 1 },
			{ x: 0.35, y: 0.25, w: 0.3, h: 0.2, color: 0 },
			{ x: 0.25, y: 0.25, w: 0.5, h: 0.1, color: 2 },
			{ x: 0.35, y: 0.4, w: 0.3, h: 0.2, r: 0.5, color: 3 },
			{ x: 0, y: 0.65, w: 1, h: 0.15, color: 1 },
			{ x: 0.3, y: 0.9, w: 0.4, h: 0.1, color: 3 },
		],
		normalPallet: ["#fefefe", "#48a4f4", "#5adcec", "#fff575"],
		shinyPallet: ["#fefefe", "#b2fef2", "#46a2f6", "#fefe6a"],
	},
	// Quaquaval
	"914": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.45, y: 0, w: 0.1, h: 0.2, r: 0.2, color: 1 },
			{ x: 0, y: 0.2, w: 1, h: 0.1, color: 2 },
			{ x: 0, y: 0.3, w: 0.3, h: 0.7, color: 3 },
			{ x: 0.7, y: 0.3, w: 0.3, h: 0.7, color: 3 },
			{ x: 0.3, y: 0.3, w: 0.4, h: 0.3, color: 4 },
			{ x: 0.35, y: 0.4, w: 0.3, h: 0.2, r: 0.5, color: 5 },
			{ x: 0, y: 0.9, w: 1, h: 0.1, color: 6 },
			{ x: 0, y: 0.96, w: 1, h: 0.1, color: 7 },
		],
		normalPallet: [
			"#5878e8",
			"#b9ffff",
			"#ff4217",
			"#bdffff",
			"#f0ffff",
			"#fff575",
			"#ffdd6e",
			"#f87e53",
		],
		shinyPallet: [
			"#9a9afe",
			"#b2fef2",
			"#fede6e",
			"#b2fef2",
			"#fefefe",
			"#fede6e",
			"#fede6e",
			"#fede6e",
		],
	},
	// Pawmi
	"921": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.35, y: 0.5, w: 0.3, h: 0.2, r: 0.2, color: 1 },
			{ x: -0.1, y: 0.8, w: 0.3, h: 0.3, r: 0.2, color: 1 },
			{ x: 0.8, y: 0.8, w: 0.3, h: 0.3, r: 0.2, color: 1 },
		],
		normalPallet: ["#e9b358", "#fdffe1"],
		shinyPallet: ["#fe9a9a", "#fefede"],
	},
	// Pawmo
	"922": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.36, y: 0.3, w: 0.28, h: 0.18, r: 0.2, color: 1 },
			{ x: -0.1, y: 0.7, w: 0.3, h: 0.3, r: 0.2, color: 1 },
			{ x: 0.8, y: 0.7, w: 0.3, h: 0.3, r: 0.2, color: 1 },
		],
		normalPallet: ["#f4e07f", "#fdffde"],
		shinyPallet: ["#fec2c2", "#fefede"],
	},
	// Pawmot
	"923": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.38, y: 0.25, w: 0.24, h: 0.16, r: 0.2, color: 1 },
			{ x: -0.1, y: 0.65, w: 0.3, h: 0.3, r: 0.2, color: 1 },
			{ x: 0.8, y: 0.65, w: 0.3, h: 0.3, r: 0.2, color: 1 },
		],
		normalPallet: ["#ecc24d", "#feffe1"],
		shinyPallet: ["#fea6a2", "#fefede"],
	},
	// Cetoddle
	"974": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0.8, y: 0, w: 0.3, h: 1, color: 1 },
			{ x: 0.94, y: 0, w: 0.1, h: 1, color: 2 },
		],
		normalPallet: ["#fbfbfb", "#d8dce0", "#e89ce0"],
		shinyPallet: ["#aab2b2", "#e59a71", "#828a8a"],
	},
	// Cetitan
	"975": {
		rects: [
			{ x: 0, y: 0, w: 1, h: 1, color: 0 },
			{ x: 0, y: 0, w: 1, h: 0.5, color: 1 },
			{ x: 0.9, y: 0, w: 0.1, h: 1, color: 2 },
		],
		normalPallet: ["#d8dce0", "#f0f0f0", "#e89ce0"],
		shinyPallet: ["#e4e7e7", "#6c7372", "#e59975"],
	},
	// Clodsire
	"980": {
		rects: [
			{ x: 0, y: 0.4, w: 1, h: 0.6, r: 0.4, color: 0 },
			{ x: 0, y: 0.7, w: 1, h: 0.3, color: 0 },
			{ x: 0, y: 0.8, w: 1, h: 0.3, color: 1 },
			{ x: 0, y: 0.75, w: 0.33, h: 0.1, r: 0.4, color: 0 },
			{ x: 0.33, y: 0.75, w: 0.33, h: 0.1, r: 0.4, color: 1 },
			{ x: 0.67, y: 0.75, w: 0.33, h: 0.1, r: 0.4, color: 0 },
		],
		normalPallet: ["#5b504e", "#a89592"],
		shinyPallet: ["#5e5282", "#aeaeea"],
	},
};

export default pokemonRectData;
