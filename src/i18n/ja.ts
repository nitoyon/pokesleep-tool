import common from './ja/common.json';
import ResearchCalc from './ja/ResearchCalc.json';
import IvCalc from './ja/IvCalc.json';
import IvCalcNews from './ja/IvCalcNews.json';
import events from './ja/events.json';
import skills from './ja/skills.json';
import data from './ja/data.json';
import pokemons from './ja/pokemons.json';

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
