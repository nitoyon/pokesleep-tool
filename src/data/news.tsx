import rawNews from './news.json';

/**
 * Represents news liest.
 */
class News {
    /** Date time */
    researchCalc: NewsArticle[];
    /** News id (English) */
    ivCalc: NewsArticle[];

    /**
     * Initialize News object.
     * @param data JSON data.
     */
    constructor(data: JsonNews) {
        this.researchCalc = data.ResearchCalc.map(x => new NewsArticle(x));
        this.ivCalc = data.IvCalc.map(x => new NewsArticle(x));
    }

    /**
     * Get articles for the specified app.
     * @param app App name.
     * @returns Articles for the given app.
     */
    getArticles(app: "ResearchCalc"|"IvCalc") {
        if (app === "ResearchCalc") {
            return this.researchCalc;
        }
        return this.ivCalc;
    }
}

/**
 * Represents news article.
 */
export class NewsArticle {
    /** Date time */
    date: Date;
    /** News id (English) */
    id: string;

    /**
     * Initialize News object.
     * @param data JSON data.
     */
    constructor(data: JsonNewsArticle) {
        this.date = new Date(Date.parse(data.date));
        this.id = data.id;
    }
}

interface JsonNewsArticle {
    /** Date time */
    date: string;
    /** News id (English) */
    id: string;
}

interface JsonNews {
    ResearchCalc: JsonNewsArticle[],
    IvCalc: JsonNewsArticle[],
}

//const news = new News(rawNews as JsonNews);
const news = new News(rawNews);

export default news;
