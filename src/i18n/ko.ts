import common from "./ko/common.json";
import ResearchCalc from "./ko/ResearchCalc.json";
import IvCalc from "./ko/IvCalc.json";
import IvCalcNews from "./ko/IvCalcNews.json";
import events from "./ko/events.json";
import skills from "./ko/skills.json";
import data from "./ko/data.json";
import pokemons from "./ko/pokemons.json";

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
