// Run npm run rpfit < data.tsv
//
// Read tsv from stdin (RP collection 'DataLVL10-49' sheet format)
// Name \t Level \t RP \t Nature \t SkillLevel \t SubSkill1

import Nature from '../src/util/Nature';
import PokemonIv from '../src/util/PokemonIv';
import PokemonRp from '../src/util/PokemonRp';
import SubSkill, { SubSkillType } from '../src/util/SubSkill';

type CsvData = {
    name: string;
    level: number;
    rp: number;
    nature: Nature;
    skillLevel: number;
    subSkill1: SubSkill;
};

type RateInfo = {
    skill: number;
    ing: number;
};

type I18nDict = {
    [key: string]: string;
};

function parseTsv(text: string): CsvData[] {
    const ret: CsvData[] = [];
    const lines = text.split(/\r?\n/g);
    for (const line of lines) {
        const parts = line.split(/\t/g);
        ret.push({
            name: fixName(parts[0]),
            level: parseInt(parts[1], 10),
            rp: parseInt(parts[2], 10),
            nature: new Nature(fixNatures(parts[3])),
            skillLevel: parseInt(parts[4], 10),
            subSkill1: new SubSkill(parts[5] as SubSkillType),
        });
    }
    return ret;
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
    };
    if (nature in natureI18n) {
        return natureI18n[nature];
    }
    return nature;
}

// Read from stdin
const fs = require('fs');
const tsv = fs.readFileSync(0).toString();

const data = parseTsv(tsv);
fit(data);
