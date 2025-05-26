// Run npm run rpfit < data.tsv
//
// Read tsv from stdin (RP collection 'DataLVL10-49' sheet format)
// Name \t Level \t RP \t Nature \t SkillLevel \t SubSkill1

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
    ing2: IngredientName;
};

type RateInfo = {
    skill: number;
    ing: number;
};

type I18nDict = {
    [key: string]: string;
};

function parseTsv(text: string): Record<string, CsvData[]> {
    const ret: Record<string, CsvData[]> = {};
    const lines = text.split(/\r?\n/g);
    for (const line of lines) {
        if (line.trim() === "") {
            continue;
        }
        const parts = line.split(/\t/g);
        while (parts.length < 8) {
            parts.push("");
        }
        const name = fixName(parts[0]);
        if (typeof(ret[name]) === "undefined") {
            ret[name] = [];
        }
        ret[name].push({
            name,
            level: parseInt(parts[1], 10),
            rp: parseInt(parts[2], 10),
            nature: new Nature(fixNatures(parts[3])),
            skillLevel: parseInt(parts[4], 10),
            subSkill1: parts[5] === "" || parts[5] === "-" ? null : new SubSkill(parts[5] as SubSkillType),
            subSkill2: parts[6] === "" || parts[6] === "-" ? null : new SubSkill(parts[6] as SubSkillType),
            ing2: convertIngName(parts[7]),
        });
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

function fit(data: CsvData[]) {
    let candidates: RateInfo[] = [];
    for (let skill = 10; skill < 100; skill++) {
        for (let ing = 90; ing < 400; ing++) {
            candidates.push({skill: skill / 10, ing: ing / 10});
        }
    }

    for (const datum of data) {
        const iv = new PokemonIv(datum.name);
        iv.level = datum.level;
        iv.nature = datum.nature;
        iv.skillLevel = datum.skillLevel;
        iv.subSkills.set(10, datum.subSkill1);
        iv.subSkills.set(25, datum.subSkill2);
        if (iv.level >= 30) {
            if (datum.ing2 === "unknown") {
                console.error("unknown ing");
                continue;
            }
            iv.ingredient = iv.pokemon.ing1.name === datum.ing2 ? "AAA" : "ABA";
        }
        candidates = candidates.filter(x => {
            iv.pokemon.skillRatio = x.skill;
            iv.pokemon.ingRatio = x.ing;
            const rp = new PokemonRp(iv);
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
