import common from "./ja/common.json";
import data from "./ja/data.json";
import events from "./ja/events.json";
import IvCalc from "./ja/IvCalc.json";
import IvCalcNews from "./ja/IvCalcNews.json";
import pokemons from "./ja/pokemons.json";
import ResearchCalc from "./ja/ResearchCalc.json";
import skills from "./ja/skills.json";

export default {
	translation: {
		...common,
		...ResearchCalc,
		...IvCalc,
		...IvCalcNews,
		IvCalc: {
			...IvCalc.IvCalc,
			...IvCalcNews.IvCalc,
		},
		...events,
		...skills,
		...data,
		...pokemons,
	},
};
