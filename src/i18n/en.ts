import common from "./en/common.json";
import data from "./en/data.json";
import events from "./en/events.json";
import IvCalc from "./en/IvCalc.json";
import IvCalcNews from "./en/IvCalcNews.json";
import pokemons from "./en/pokemons.json";
import ResearchCalc from "./en/ResearchCalc.json";
import skills from "./en/skills.json";

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
