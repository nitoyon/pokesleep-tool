import common from "./zh-CN/common.json";
import ResearchCalc from "./zh-CN/ResearchCalc.json";
import IvCalc from "./zh-CN/IvCalc.json";
import IvCalcNews from "./zh-CN/IvCalcNews.json";
import events from "./zh-CN/events.json";
import skills from "./zh-CN/skills.json";
import data from "./zh-CN/data.json";
import pokemons from "./zh-CN/pokemons.json";

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
