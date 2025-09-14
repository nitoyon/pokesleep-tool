// Run npm run rpfit < data.tsv
//
// This script is designed to test RP calculation logic using data from
// the RP Collection data.
//
// Read tsv from stdin (RP collection sheet format)
// See rpparse.tsv for details

import PokemonRp from '../src/util/PokemonRp';
import parseTsv, { RpData } from './rpparse';

function test(data: RpData[]) {
    for (const datum of data) {
        const rp = new PokemonRp(datum.iv).Rp;
        if (datum.rp !== rp) {
            console.log(`NOT MATCH: ${datum.iv.pokemonName} (Lv ${datum.iv.level}) should ${datum.rp} but ${rp}`);
        }
    }
}

// Read from stdin
const fs = require('fs');
const tsv = fs.readFileSync(0).toString();
console.log("read done");

const data = parseTsv(tsv);
for (const name of Object.keys(data)) {
    test(data[name]);
}
