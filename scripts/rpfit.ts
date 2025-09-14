// Run npm run rpfit < data.tsv
//
// This script is designed to estimate skill% and ingredient% from
// the RP Collection data.
//
// Read tsv from stdin (RP collection sheet format)
// See parseTsv for details

import Nature from '../src/util/Nature';
import PokemonIv from '../src/util/PokemonIv';
import PokemonRp from '../src/util/PokemonRp';
import SubSkill, { SubSkillType } from '../src/util/SubSkill';
import { IngredientName } from '../src/data/pokemons';

type CsvData = {
    name: string;
    level: number;
    rp: number;
    nature: Nature;
    skillLevel: number;
    subSkill1: SubSkill|null;
    subSkill2: SubSkill|null;
    subSkill3: SubSkill|null;
    ing2: IngredientName;
    ing3: IngredientName;
};

type RpData = {
    iv: PokemonIv;
    rp: number;
};

type RateInfo = {
    skill: number;
    ing: number;
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
function parseTsv(text: string): Record<string, RpData[]> {
    const ret: Record<string, RpData[]> = {};
    const lines = text.split(/\r?\n/g);
    const subSkillNames = SubSkill.allSubSkillNames as string[];
    for (const line of lines) {
        // Parse TSV data
        if (line.trim() === "") {
            continue;
        }
        const parts = line.split(/\t/g);
        while (parts.length < 10) {
            parts.push("");
        }
        const name = fixName(parts[0]);
        if (typeof(ret[name]) === "undefined") {
            ret[name] = [];
        }
        // Convert DataLVL10-49 to DataLVL50+ format
        if (!subSkillNames.includes(parts[7] as SubSkillType)) {
            parts[8] = parts[7];
            parts[7] = "";
        }
        const datum: CsvData = {
            name,
            level: parseInt(parts[1], 10),
            rp: parseInt(parts[2], 10),
            nature: new Nature(fixNatures(parts[3])),
            skillLevel: parseInt(parts[4], 10),
            subSkill1: !subSkillNames.includes(parts[5]) ? null : new SubSkill(parts[5] as SubSkillType),
            subSkill2: !subSkillNames.includes(parts[6]) ? null : new SubSkill(parts[6] as SubSkillType),
            subSkill3: !subSkillNames.includes(parts[7]) ? null : new SubSkill(parts[7] as SubSkillType),
            ing2: convertIngName(parts[8]),
            ing3: convertIngName(parts[9]),
        };

        // Convert TSV data to PokemonIv
        const iv = new PokemonIv(datum.name);
        iv.level = datum.level;
        iv.nature = datum.nature;
        iv.skillLevel = datum.skillLevel;
        iv.subSkills.set(10, datum.subSkill1);
        iv.subSkills.set(25, datum.subSkill2);
        iv.subSkills.set(50, datum.subSkill3);
        if (iv.level >= 60) {
            if (datum.ing2 === "unknown" || datum.ing3 === "unknown") {
                console.error("unknown ing");
                continue;
            }
            switch (datum.ing3) {
                case iv.pokemon.ing3?.name:
                    iv.ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAC" : "ABC";
                    break;
                case iv.pokemon.ing2.name:
                    iv.ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAB" : "ABB";
                    break;
                case iv.pokemon.ing1.name:
                    iv.ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAA" : "ABA";
                    break;
            }
        }
        else if (iv.level >= 30) {
            if (datum.ing2 === "unknown") {
                console.error("unknown ing");
                continue;
            }
            iv.ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAA" : "ABA";
        }

        ret[name].push({iv: iv, rp: datum.rp});
    }
    return ret;
}

function convertIngName(val: string): IngredientName {
    switch (val) {
        case "Large Leek": return "leek";
        case "Tasty Mushroom": return "mushroom";
        case "Fancy Egg": return "egg";
        case "Soft Potato": return "potato";
        case "Fancy Apple": return "apple";
        case "Fiery Herb": return "herb";
        case "Bean Sausage": return "sausage";
        case "Moomoo Milk": return "milk";
        case "Honey": return "honey";
        case "Pure Oil": return "oil";
        case "Warming Ginger": return "ginger";
        case "Snoozy Tomato": return "tomato";
        case "Soothing Cacao": return "cacao";
        case "Slowpoke Tail": return "tail";
        case "Greengrass Soybeans": return "soy";
        case "Greengrass Corn": return "corn";
        case "Rousing Coffee": return "coffee";
        default: return "unknown";
    }
}

function fit(data: RpData[]) {
    let candidates: RateInfo[] = [];
    for (let skill = 10; skill < 100; skill++) {
        for (let ing = 90; ing < 400; ing++) {
            candidates.push({skill: skill / 10, ing: ing / 10});
        }
    }

    for (const datum of data) {
        candidates = candidates.filter(x => {
            datum.iv.pokemon.skillRatio = x.skill;
            datum.iv.pokemon.ingRatio = x.ing;
            const rp = new PokemonRp(datum.iv);
            return rp.Rp === datum.rp;
        });
    }
    console.log(candidates);
}

function fixName(name: string): string {
    return name.replace(" (Paldean Form)", " (Paldea)");
}

function fixNatures(nature: string): string {
    const natureI18n: I18nDict = {
        "てれや": "Bashful",
        "がんばりや": "Hardy",
        "すなお": "Docile",
        "きまぐれ": "Quirky",
        "まじめ": "Serious",
        "ずぶとい": "Bold",
        "わんぱく": "Impish",
        "のうてんき": "Lax",
        "のんき": "Relaxed",
        "おくびょう": "Timid",
        "せっかち": "Hasty",
        "ようき": "Jolly",
        "むじゃき": "Naive",
        "さみしがり": "Lonely",
        "いじっぱり": "Adamant",
        "やんちゃ": "Naughty",
        "ゆうかん": "Brave",
        "おだやか": "Calm",
        "おとなしい": "Gentle",
        "しんちょう": "Careful",
        "なまいき": "Sassy",
        "ひかえめ": "Modest",
        "おっとり": "Mild",
        "うっかりや": "Rash",
        "れいせい": "Quiet",
        "害羞": "Bashful",
        "勤奮": "Hardy",
        "坦率": "Docile",
        "浮躁": "Quirky",
        "認真": "Serious",
        "大膽": "Bold",
        "淘氣": "Impish",
        "樂天": "Lax",
        "悠閒": "Relaxed",
        "膽小": "Timid",
        "急躁": "Hasty",
        "爽朗": "Jolly",
        "天真": "Naive",
        "怕寂寞": "Lonely",
        "固執": "Adamant",
        "頑皮": "Naughty",
        "勇敢": "Brave",
        "溫和": "Calm",
        "溫順": "Gentle",
        "慎重": "Careful",
        "自大": "Sassy",
        "內斂": "Modest",
        "慢吞吞": "Mild",
        "馬虎": "Rash",
        "冷靜": "Quiet",
        "Neutral": "Serious",
    };
    if (nature in natureI18n) {
        return natureI18n[nature];
    }
    return nature;
}

// Read from stdin
const fs = require('fs');
const tsv = fs.readFileSync(0).toString();
console.log("read done");

const data = parseTsv(tsv);
for (const name of Object.keys(data)) {
    console.log(`Calculating ${name}...`);
    fit(data[name]);
}
