// npm run rpfit < data.tsv
// npm run rpfit -- --fitSkillOnly < data.tsv
//     Use ing% in src/data/pokemon.json
//
// This script is designed to estimate skill% and ingredient% from
// the RP Collection data.
//
// Read tsv from stdin (RP collection sheet format)
// See src/util/RpParse.tsv for details

import parseTsv, { RpData } from '../src/util/RpParse';
import PokemonRp from '../src/util/PokemonRp';
import * as fs from 'fs';

type RateInfo = {
    skill: number;
    ing: number;
};

function fit(data: RpData[]) {
    let candidates: RateInfo[] = [];
    for (let skill = 10; skill < 100; skill++) {
        if (process.argv.some(x => x === '--fitSkillOnly')) {
            candidates.push({skill: skill / 10, ing: data[0].iv.pokemon.ingRate});
            continue;
        }
        for (let ing = 90; ing < 400; ing++) {
            candidates.push({skill: skill / 10, ing: ing / 10});
        }
    }

    for (const datum of data) {
        candidates = candidates.filter(x => {
            const rp = new PokemonRp(datum.iv.clone({
                skillRate: x.skill,
                ingRate: x.ing,
            }));
            return rp.Rp === datum.rp;
        });
    }
    console.log(candidates);
}

// Read from stdin
const tsv = fs.readFileSync(0).toString();
console.log("read done");

const data = parseTsv(tsv);
for (const name of Object.keys(data)) {
    console.log(`Calculating ${name}...`);
    fit(data[name]);
}
