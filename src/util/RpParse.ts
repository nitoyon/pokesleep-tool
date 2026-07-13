import type { IngredientName } from "../data/pokemons";
import Nature from "./Nature";
import PokemonIv from "./PokemonIv";
import type { IngredientType } from "./PokemonRp";
import SubSkill from "./SubSkill";
import SubSkillList from "./SubSkillList";

type CsvData = {
	name: string;
	level: number;
	rp: number;
	nature: Nature;
	skillLevel: number;
	subSkill1: SubSkill | null;
	subSkill2: SubSkill | null;
	subSkill3: SubSkill | null;
	subSkill4: SubSkill | null;
	ing2: IngredientName;
	ing3: IngredientName;
};

export type RpData = {
	iv: PokemonIv;
	rp: number;
};

type I18nDict = {
	[key: string]: string;
};

/**
 * Parse TSV data from string.
 *
 * Following format is supported.
 * - Name \t Level \t RP \t Nature \t SkillLevel
 * - Name \t Level \t RP \t Nature \t SkillLevel \t SubSkill1 \t SubSkill2 \t Ing2
 * - Name \t Level \t RP \t Nature \t SkillLevel \t SubSkill1 \t SubSkill2 \t SubSkill3 \t Ing2 \t Ing3
 *
 * @param text TSV string
 * @returns Record<string, RpData[]>. Key is the name of Pokemon.
 */
export function parseTsv(text: string): Record<string, RpData[]> {
	const ret: Record<string, RpData[]> = {};
	const lines = text.split(/\r?\n/g);
	for (const line of lines) {
		// Parse TSV data
		if (line.trim() === "") {
			continue;
		}
		const parts = line.split(/\t/g);

		// Convert DataLVL1-9 to DataLVL10-49 format
		if (parts.length === 5) {
			parts.push("");
			parts.push("");
			parts.push("");
		}

		// Convert DataLVL10-49 to DataLVL50+ format
		if (parts.length === 8) {
			parts.push("");
			parts.push("");
			parts[8] = parts[7];
			parts[7] = "";
		}

		// Pad DataLVL50-59 without Ing3 to 10 columns
		if (parts.length === 9) {
			parts.push("");
		}

		// Convert DataLVL50+ to DataLVL70+ format
		if (parts.length === 10) {
			parts.splice(8, 0, "");
		}
		const name = fixName(parts[0]);
		if (typeof ret[name] === "undefined") {
			ret[name] = [];
		}
		const datum: CsvData = {
			name,
			level: parseInt(parts[1], 10),
			rp: parseInt(parts[2], 10),
			nature: new Nature(fixNatures(parts[3])),
			skillLevel: parseInt(parts[4], 10),
			subSkill1: convertSubSkillName(parts[5]),
			subSkill2: convertSubSkillName(parts[6]),
			subSkill3: convertSubSkillName(parts[7]),
			subSkill4: convertSubSkillName(parts[8]),
			ing2: convertIngName(parts[9]),
			ing3: convertIngName(parts[10]),
		};

		// Convert TSV data to PokemonIv
		const iv = new PokemonIv({
			pokemonName: datum.name,
			level: datum.level,
			nature: datum.nature,
			skillLevel: datum.skillLevel,
			subSkills: new SubSkillList({
				lv10: datum.subSkill1,
				lv25: datum.subSkill2,
				lv50: datum.subSkill3,
				lv70: datum.subSkill4,
			}),
		});

		// Determine ingredient
		let ingredient: IngredientType = "AAA";
		if (iv.level >= 60) {
			if (datum.ing2 === "unknown" || datum.ing3 === "unknown") {
				console.error(`unknown ing: ${line}`);
				continue;
			}
			switch (datum.ing3) {
				case iv.pokemon.ing3?.name:
					ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAC" : "ABC";
					break;
				case iv.pokemon.ing2.name:
					ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAB" : "ABB";
					break;
				case iv.pokemon.ing1.name:
					ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAA" : "ABA";
					break;
			}
		} else if (iv.level >= 30) {
			if (datum.ing2 === "unknown" && iv.pokemonName !== "Darkrai") {
				console.error(`unknown ing: ${line}`);
				continue;
			}
			ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAA" : "ABA";
		}

		ret[name].push({ iv: iv.clone({ ingredient }), rp: datum.rp });
	}
	return ret;
}

function convertSubSkillName(val: string): SubSkill | null {
	switch (val) {
		case "Berry Finding S":
		case "樹果數量S":
			return new SubSkill("Berry Finding S");
		case "Dream Shard Bonus":
		case "夢之碎片獎勵":
			return new SubSkill("Dream Shard Bonus");
		case "Energy Recovery Bonus":
		case "活力回復獎勵":
			return new SubSkill("Energy Recovery Bonus");
		case "Helping Bonus":
		case "幫手獎勵":
			return new SubSkill("Helping Bonus");
		case "Research EXP Bonus":
		case "研究EXP獎勵":
			return new SubSkill("Research EXP Bonus");
		case "Sleep EXP Bonus":
		case "睡眠EXP獎勵":
			return new SubSkill("Sleep EXP Bonus");
		case "Skill Level Up M":
		case "技能等級提升M":
			return new SubSkill("Skill Level Up M");
		case "Skill Level Up S":
		case "技能等級提升S":
			return new SubSkill("Skill Level Up S");
		case "Skill Trigger M":
		case "技能機率提升M":
			return new SubSkill("Skill Trigger M");
		case "Skill Trigger S":
		case "技能機率提升S":
			return new SubSkill("Skill Trigger S");
		case "Helping Speed M":
		case "幫忙速度M":
			return new SubSkill("Helping Speed M");
		case "Helping Speed S":
		case "幫忙速度S":
			return new SubSkill("Helping Speed S");
		case "Ingredient Finder M":
		case "食材機率提升M":
			return new SubSkill("Ingredient Finder M");
		case "Ingredient Finder S":
		case "食材機率提升S":
			return new SubSkill("Ingredient Finder S");
		case "Inventory Up L":
		case "持有上限提升L":
			return new SubSkill("Inventory Up L");
		case "Inventory Up M":
		case "持有上限提升M":
			return new SubSkill("Inventory Up M");
		case "Inventory Up S":
		case "持有上限提升S":
			return new SubSkill("Inventory Up S");
		default:
			return null;
	}
}

function convertIngName(val: string): IngredientName {
	switch (val) {
		case "Large Leek":
		case "粗枝大蔥":
			return "leek";
		case "Tasty Mushroom":
		case "品鮮蘑菇":
			return "mushroom";
		case "Fancy Egg":
		case "特選蛋":
			return "egg";
		case "Soft Potato":
		case "窩心洋芋":
			return "potato";
		case "Fancy Apple":
		case "特選蘋果":
			return "apple";
		case "Fiery Herb":
		case "火辣香草":
			return "herb";
		case "Bean Sausage":
		case "豆製肉":
			return "sausage";
		case "Moomoo Milk":
		case "哞哞鮮奶":
			return "milk";
		case "Honey":
		case "甜甜蜜":
			return "honey";
		case "Pure Oil":
		case "純粹油":
			return "oil";
		case "Warming Ginger":
		case "暖暖薑":
			return "ginger";
		case "Snoozy Tomato":
		case "好眠番茄":
			return "tomato";
		case "Soothing Cacao":
		case "放鬆可可":
			return "cacao";
		case "Slowpoke Tail":
		case "美味尾巴":
			return "tail";
		case "Greengrass Soybeans":
		case "萌綠大豆":
			return "soy";
		case "Greengrass Corn":
		case "萌綠玉米":
			return "corn";
		case "Rousing Coffee":
		case "醒腦咖啡豆":
			return "coffee";
		case "Plump Pumpkin":
		case "沉甸甸南瓜":
			return "pumpkin";
		case "Glossy Avocado":
		case "嫩亮酪梨":
			return "avocado";
		default:
			return "unknown";
	}
}

function fixName(name: string): string {
	return name
		.replace(" (Alolan Form)", " (Alola)")
		.replace(" (Paldean Form)", " (Paldea)")
		.replace(" (Amped Form)", " (Amped)")
		.replace(" (Low Key Form)", " (Low Key)");
}

function fixNatures(nature: string): string {
	const natureI18n: I18nDict = {
		てれや: "Bashful",
		がんばりや: "Hardy",
		すなお: "Docile",
		きまぐれ: "Quirky",
		まじめ: "Serious",
		ずぶとい: "Bold",
		わんぱく: "Impish",
		のうてんき: "Lax",
		のんき: "Relaxed",
		おくびょう: "Timid",
		せっかち: "Hasty",
		ようき: "Jolly",
		むじゃき: "Naive",
		さみしがり: "Lonely",
		いじっぱり: "Adamant",
		やんちゃ: "Naughty",
		ゆうかん: "Brave",
		おだやか: "Calm",
		おとなしい: "Gentle",
		しんちょう: "Careful",
		なまいき: "Sassy",
		ひかえめ: "Modest",
		おっとり: "Mild",
		うっかりや: "Rash",
		れいせい: "Quiet",
		害羞: "Bashful",
		勤奮: "Hardy",
		坦率: "Docile",
		浮躁: "Quirky",
		認真: "Serious",
		大膽: "Bold",
		淘氣: "Impish",
		樂天: "Lax",
		悠閒: "Relaxed",
		膽小: "Timid",
		急躁: "Hasty",
		爽朗: "Jolly",
		天真: "Naive",
		怕寂寞: "Lonely",
		固執: "Adamant",
		頑皮: "Naughty",
		勇敢: "Brave",
		溫和: "Calm",
		溫順: "Gentle",
		慎重: "Careful",
		自大: "Sassy",
		內斂: "Modest",
		慢吞吞: "Mild",
		馬虎: "Rash",
		冷靜: "Quiet",
		Neutral: "Serious",
	};
	if (nature in natureI18n) {
		return natureI18n[nature];
	}
	return nature;
}

export default parseTsv;
