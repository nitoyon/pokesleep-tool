import rawFaq from "./faq.json";

/**
 * Represents FAQ list.
 */
class Faq {
	/** Research Calc FAQ entries */
	researchCalc: FaqEntry[];
	/** IV Calc FAQ entries */
	ivCalc: FaqEntry[];

	/**
	 * Initialize Faq object.
	 * @param data JSON data.
	 */
	constructor(data: JsonFaq) {
		this.researchCalc = data.ResearchCalc.map((x) => new FaqEntry(x));
		this.ivCalc = data.IvCalc.map((x) => new FaqEntry(x));
	}

	/**
	 * Get entries for the specified app.
	 * @param app App name.
	 * @returns Entries for the given app.
	 */
	getEntries(app: "ResearchCalc" | "IvCalc") {
		if (app === "ResearchCalc") {
			return this.researchCalc;
		}
		return this.ivCalc;
	}
}

/**
 * Represents a FAQ entry.
 */
export class FaqEntry {
	/** FAQ id (English) */
	id: string;

	/**
	 * Initialize FaqEntry object.
	 * @param data JSON data.
	 */
	constructor(data: JsonFaqEntry) {
		this.id = data.id;
	}
}

interface JsonFaqEntry {
	/** FAQ id (English) */
	id: string;
}

interface JsonFaq {
	ResearchCalc: JsonFaqEntry[];
	IvCalc: JsonFaqEntry[];
}

//const faq = new Faq(rawFaq as JsonFaq);
const faq = new Faq(rawFaq);

export default faq;
