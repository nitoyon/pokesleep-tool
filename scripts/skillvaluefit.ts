// npm run skillvaluefit -- [baseSkillValue] < data.tsv
// npm run skillvaluefit -- [baseSkillValue] --fitValueOnly < data.tsv
//
// This script is designed to estimate Skill Value from
// the RP Collection data.
//
// TSV should be same main skill and main skill level.
// Read tsv from stdin (RP collection sheet format).
// See src/util/RpParse.tsv for details

import parseTsv, { RpData } from '../src/util/RpParse';
import PokemonRp from '../src/util/PokemonRp';
import * as fs from 'fs';

const baseSkillValue = parseInt(process.argv[2], 10);
const fitValueOnly = process.argv.some(x => x === '--fitValueOnly');

function checkSkillValue(data: Record<string, RpData[]>, skillValue: number) {
    for (const name of Object.keys(data)) {
        if (!fit(data[name], skillValue)) {
            return;
        }
    }
    console.log(skillValue);
}

function fit(data: RpData[], skillValue: number) {
    let skills: number[] = [];
    if (fitValueOnly) {
        skills = [data[0].iv.pokemon.skillRate];
    }
    else {
        for (let skill = 10; skill < 100; skill++) {
            skills.push(skill / 10);
        }
    }

    for (const datum of data) {
        skills = skills.filter(x => {
            const rp = new PokemonRp(datum.iv.clone({
                skillRate: x,
                ingRate: datum.iv.pokemon.ingRate,
            }));
            Object.defineProperty(rp, "skillValue", {
                get() {
                    return skillValue;
                },
                configurable: true,
            });
            return rp.Rp === datum.rp;
        });
    }
    return (skills.length > 0);
}

// Read from stdin
const tsv = fs.readFileSync(0).toString();
console.log("read done");

const data = parseTsv(tsv);
for (let skillValue = baseSkillValue - 500; skillValue < baseSkillValue; skillValue++) {
    checkSkillValue(data, skillValue);
}
