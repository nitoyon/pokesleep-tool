import common from "./zh-CN/common.json";
import data from "./zh-CN/data.json";
import events from "./zh-CN/events.json";
import IvCalc from "./zh-CN/IvCalc.json";
import IvCalcFaq from "./zh-CN/IvCalcFaq.json";
import IvCalcNews from "./zh-CN/IvCalcNews.json";
import pokemons from "./zh-CN/pokemons.json";
import ResearchCalc from "./zh-CN/ResearchCalc.json";
import skills from "./zh-CN/skills.json";

export default {
	translation: {
		...common,
		...ResearchCalc,
		...IvCalc,
		...IvCalcNews,
		...IvCalcFaq,
		IvCalc: {
			...IvCalc.IvCalc,
			...IvCalcNews.IvCalc,
			...IvCalcFaq.IvCalc,
		},
		...events,
		...skills,
		...data,
		...pokemons,
	},
};
