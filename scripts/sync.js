'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

// constants
const areas = {
    "ワカクサ": 0,
    "シアン": 1,
    "トープ": 2,
    "ウノハナ": 3,
    "ラピス": 4
};
const types = {
    "うとうと": "dozing",
    "すやすや": "snoozing",
    "ぐっすり": "slumbering",
};

async function main() {
    // read field.json
    const { INIT_CWD } = process.env;

    // Update field.json
    const fieldJsonPath = path.join(INIT_CWD, "src/data/field.json");
    const fieldJson = JSON.parse(fs.readFileSync(fieldJsonPath));
    //await syncRanksAndPowers(fieldJson);
    //fs.writeFileSync(fieldJsonPath, JSON.stringify(fieldJson, null, 4));

    // Read or create spo.json
    const spoJsonPath = path.join(INIT_CWD, "src/data/spo.json");
    let spoJson = {};
    if (fs.existsSync(spoJsonPath)) {
        spoJson = JSON.parse(fs.readFileSync(spoJsonPath));
    } else {
        await syncSPO(spoJson);
        fs.writeFileSync(spoJsonPath, JSON.stringify(spoJson, null, 4));
    }

    // sync pokemon.json
    await syncPokemon(spoJson, INIT_CWD);

    // write field.json
    console.log("done!");
}

async function syncRanksAndPowers(fieldJson) {
    // Update ranks & powers
    const baseUrl = 'https://wikiwiki.jp/poke_sleep/%E3%83%AA%E3%82%B5%E3%83%BC%E3%83%81%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89/';
    const areaNames = [
        "ワカクサ本島",
        "シアンの砂浜",
        "トープ洞窟",
        "ウノハナ雪原",
        "ラピスラズリ湖畔"
    ];
    for (let i = 0; i < areaNames.length; i++) {
        const area = areaNames[i];
        console.log(`Retrieving ${area}`);
        const url = baseUrl + encodeURI(area);
        const html = await getHtml(url);
        fieldJson[i].powers = getPowers(html);
    }
}

async function getHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, function(res) {
            res.setEncoding('utf-8');
            let html = '';
            res
                .on('data', function(chunk) {
                    html += chunk;
                })
                .on('end', function() {
                    resolve(html);
                })
                .on('error', reject);
        });
    });
}

function getPowers(html) {
    const dom = new JSDOM(html);

    // find table
    const tables = dom.window.document.querySelectorAll('table');
    const table = [...tables].find((t) => {
        return t.querySelector('th').textContent == "ポケモン数";
    });
    if (table == null) { throw new Error('not found'); }

    const tds = table.querySelectorAll('tr>td:nth-child(2)');
    return [...tds].map(function(td) {
        return parseInt(td.textContent.replace(/,/g, ''), 10);
    });
}

/* SPO JSON Format
* {
*     "PokemonName": {
*         // key: rarity
*         // spo: SPO
*         // id:  internal sleep id (null if unknown)
*         "1": {spo: 2, id: 7},
*     }
* }
*/
async function syncSPO(json) {
    console.log('Retrieving SPO');
    const url = 'https://wikiwiki.jp/poke_sleep/%E6%A4%9C%E8%A8%BC%EF%BC%9A%E3%81%AD%E3%82%80%E3%81%91%E3%83%91%E3%83%AF%E3%83%BC%E3%81%A8%E5%87%BA%E7%8F%BE%E5%AF%9D%E9%A1%94%E3%81%AE%E9%96%A2%E4%BF%82';
    const html = await getHtml(url);
    console.log('  downloaded');
    updateSPO(json, html);
    console.log('Parsed SPO');
}

function updateSPO(json, html) {
    const dom = new JSDOM(html);

    // find table
    const accordions = dom.window.document.querySelectorAll('div.accordion-container');
    const accordion = [...accordions].find((a) => {
        return a.querySelector('h3')?.textContent?.trim() == "SPO一覧";
    });
    if (accordion == null) { throw new Error('not found'); }

    // parse table
    const trs = accordion.querySelectorAll('tbody tr');
    for (const tr of trs) {
        // get table data
        const tds = tr.querySelectorAll('td');
        const id = parseInt(tds[3].textContent, 10);
        const name = tds[4].textContent;
        const rarity = parseInt(tds[5].textContent, 10);
        const spo = parseInt(tds[6].textContent.replace(/,/g, ''), 10);

        // add to json
        if (!(name in json)) {
            json[name] = {};
        }
        json[name][rarity] = {spo, id};
    }

    // Add Flareon & Dedenne manually
    json["デデンネ"] = {
        1: {spo: 188, id: 9999},
        2: {spo: 672, id: 9999},
        3: {spo: 1463, id: 9999},
        4: {spo: 1807, id: 9999},
    };
}

async function syncPokemon(spoJson, rootDir) {
    console.log('Retrieving pokemon list');

    // read i18n/ja.json
    const pokemonJsonPath = path.join(rootDir, "src/data/pokemon.json");
    const jaJsonPath = path.join(rootDir, "src/i18n/ja.json");
    const jaJson = JSON.parse(fs.readFileSync(jaJsonPath));
    const ja2en = {};
    const en2ja = jaJson.translation.pokemon;
    for (const enname of Object.keys(jaJson.translation.pokemon)) {
        ja2en[jaJson.translation.pokemon[enname]] = enname;
    }

    // Read or initialize pokemon list
    let pokemonJson = {};
    if (fs.existsSync(pokemonJsonPath)) {
        pokemonJson = JSON.parse(fs.readFileSync(pokemonJsonPath));
        console.log("read existing pokemon.json");
    } else {
        // get pokemon list
        console.log('Getting pokemon list');
        const listUrl = 'https://wikiwiki.jp/poke_sleep/%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%81%AE%E4%B8%80%E8%A6%A7';
        const listHtml = await getHtml(listUrl);
        console.log('  downloaded');
        updatePokemonList(pokemonJson, listHtml);
        console.log('Parsed pokemon list');

        // convert pokemon name (ja -> en), and prepare name2id
        for (const id of Object.keys(pokemonJson)) {
            const name = pokemonJson[id].name;
            if (!(name in ja2en)) { throw new Error(`Name is not defined in ja.json: ${name}`); }
            pokemonJson[id].name = ja2en[name];
        }
        fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));
    }
    const janame2id = {};
    for (const id of Object.keys(pokemonJson)) {
        const janame = en2ja[pokemonJson[id].name];
        janame2id[janame] = parseInt(id, 10);
    }

    // Update each Pokemon
    const baseUrl = 'https://wikiwiki.jp/poke_sleep/';
    for (const id of Object.keys(pokemonJson)) {
        const name = pokemonJson[id].name;
        const janame = en2ja[name];
        if ('ancestor' in pokemonJson[id]) { continue; }

        console.log(`  downloading ${janame}`);
        const url = baseUrl + encodeURI(janame);
        const html = await getHtml(url);
        updatePokemon(pokemonJson[id], html, janame, janame2id, spoJson);
        fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));
    }

    // Update ancestor
    const canEvolve = {};
    for (const id of Object.keys(pokemonJson)) {
        if (pokemonJson[id].ancestor != id) {
            canEvolve[pokemonJson[id].ancestor] = 1;
        }
    }
    for (const id of Object.keys(pokemonJson)) {
        if (pokemonJson[id].ancestor in canEvolve) {
            continue;
        }
        pokemonJson[id].ancestor = null;
    }
    fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));
}

function updatePokemonList(json, html) {
    const dom = new JSDOM(html);

    // find table
    const tables = dom.window.document.querySelectorAll('table');
    const table = [...tables].find((t) => {
        return t.querySelector('th')?.textContent == "画像";
    });
    if (table == null) { throw new Error('not found'); }

    const trs = table.querySelectorAll('tbody>tr');
    let prevId = null;
    for (const tr of trs) {
        const tds = tr.querySelectorAll('td');
        const id = parseInt(tds[1].textContent, 10);
        const name = tds[2].firstChild.textContent;
        const typeJa = tds[3].textContent;

        // validate
        if (id === prevId) { continue; } // skip event pokemon
        if (!(typeJa in types)) { throw new Error(`Unknown type: ${typeJa}`); }
        const type = types[typeJa];

        json[id] = {name, type};
        prevId = id;
    }
}

function updatePokemon(json, html, janame, janame2id, spoJson) {
    const dom = new JSDOM(html);
    const name = json.name;

    // find evolution
    if (['Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon',
        'Umbreon', 'Leafeon', 'Glaceon', 'Sylveon'].includes(name)) {
        json.ancestor = 133;
    }
    else if (['Ralts', 'Kirlia', 'Gardevoir', 'Gallade'].includes(name)) {
        json.ancestor = 280;
    }
    else {
        const evolink = dom.window.document.querySelector('h4 a[title="進化"]');
        if (evolink === null) { throw new Error('進化 not found'); }
        const ancestor = evolink.parentNode.parentNode.querySelector('p>strong>a')?.textContent;
        json.ancestor = (ancestor === undefined ? janame2id[janame] : janame2id[ancestor]);
        if (json.ancestor === undefined) { throw new Error(`ancestor not found for ${name}`); }
    }

    const tables = dom.window.document.querySelectorAll('table');

    // find field table
    const fieldTables = [...tables].filter((t) => {
        return t.querySelector('th:nth-child(7)')?.textContent === "評価";
    });
    if (fieldTables.length != 2) { throw new Error(`field table count: ${fieldTables.length}`)}
    const fieldTable = fieldTables[1]; // use second table (rarity 2+)
    json.field = {};
    let prevId = 0;
    for (const tr of fieldTable.querySelectorAll('tbody>tr')) {
        const tds = tr.querySelectorAll('td');
        let id = parseInt(tds[4].textContent, 10);
        const areaJa = tds[5].textContent;
        // basic: 1, great: 2, ultra: 3, master: 4
        const rank1 = parseInt(tds[6].querySelector("img").src.replace(/.*([1-4])\.png.*/, "$1"), 10);
        const rank2 = parseInt(tds[6].textContent, 10);
        // basic 1 => 0, great 1 => 5, ultra 1 => 10, master 1 => 15
        const rank = (rank1 - 1) * 5 + rank2 - 1;

        // validate
        if (!(areaJa in areas)) { throw new Error(`Unknown area: ${areaJa}`); }
        const area = areas[areaJa];
        if (prevId == id) {
            id = 5;
        }

        if (!(area in json.field)) {
            json.field[area] = [];
        }
        json.field[area].push({id, rank});
        prevId = id;
    }

    // return if we can't encounter this pokemon
    json.style = {};
    if (Object.keys(json.field).length === 0) { return; }

    // find style table
    const styleTable = [...tables].find((t) => {
        return t.querySelector('th:nth-child(6)')?.textContent === "寝顔名";
    });
    json.style = {};
    for (const tr of styleTable.querySelectorAll('tbody>tr')) {
        const tds = tr.querySelectorAll('td');
        const privateId = parseInt(tds[1].textContent.replace("ID-", ""), 10);
        const rarity = parseInt(tds[4].textContent.replace("☆", ""), 10);
        const isAtopBerry = tds[5].textContent === "おなかのうえ寝";
        const researchExp = parseInt(tds[7].textContent, 10);
        const dreamShards = parseInt(tds[8].textContent, 10);
        const candy = parseInt(tds[9].textContent, 10);
        const spo = spoJson[janame][rarity]?.spo;

        // If spo is not given, skip
        if (name === "Flareon" && spo === undefined) { continue; }
        
        // Ad-hoc approach to Ditto
        let gid = spoJson[janame][rarity].id;
        if (janame === "メタモン") {
            gid = (isAtopBerry ? 371 : 323);
        }
        if (privateId > 5) { continue; }

        json.style[privateId] = {rarity, isAtopBerry, researchExp, dreamShards, candy, spo, gid};
    }
}

main();
