import common from './zh-TW/common.json';
import ResearchCalc from './zh-TW/ResearchCalc.json';
import IvCalc from './zh-TW/IvCalc.json';
import IvCalcNews from './zh-TW/IvCalcNews.json';
import events from './zh-TW/events.json';
import skills from './zh-TW/skills.json';
import data from './zh-TW/data.json';
import pokemons from './zh-TW/pokemons.json';

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
