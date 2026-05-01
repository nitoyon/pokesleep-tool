import common from "./en/common.json";
import ResearchCalc from "./en/ResearchCalc.json";
import IvCalc from "./en/IvCalc.json";
import IvCalcNews from "./en/IvCalcNews.json";
import events from "./en/events.json";
import skills from "./en/skills.json";
import data from "./en/data.json";
import pokemons from "./en/pokemons.json";

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
