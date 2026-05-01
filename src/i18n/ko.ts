import common from "./ko/common.json";
import data from "./ko/data.json";
import events from "./ko/events.json";
import IvCalc from "./ko/IvCalc.json";
import IvCalcNews from "./ko/IvCalcNews.json";
import pokemons from "./ko/pokemons.json";
import ResearchCalc from "./ko/ResearchCalc.json";
import skills from "./ko/skills.json";

export default {
	translation: {
		...common,
		...ResearchCalc,
		...IvCalc,
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
