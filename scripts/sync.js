'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');
const { setTimeout } = require('timers/promises');
const {JSDOM} = require('jsdom');
const { INIT_CWD } = process.env;

// constants
const areas = {
    "ワカクサ": 0,
    "シアン": 1,
    "トープ": 2,
    "ウノハナ": 3,
    "ラピス": 4
};
const sleepTypes = {
    "うとうと": "dozing",
    "すやすや": "snoozing",
    "ぐっすり": "slumbering",
};
const berryTypes = {
    "キーのみ": "normal",
    "ヒメリのみ": "fire",
    "オレンのみ": "water",
    "ウブのみ": "electric",
    "ドリのみ": "grass",
    "チーゴのみ": "ice",
    "クラボのみ": "fighting",
    "カゴのみ": "poison",
    "フィラのみ": "ground",
    "シーヤのみ": "flying",
    "マゴのみ": "psychic",
    "ラムのみ": "bug",
    "オボンのみ": "rock",
    "ブリーのみ": "ghost",
    "ヤチェのみ": "dragon",
    "ウイのみ": "dark",
    "ベリブのみ": "steel",
    "モモンのみ": "fairy"
};
const specialties = {
    "食材": "Ingredients",
    "きのみ": "Berries",
    "スキル": "Skills",
};
const skills = {
    "食材ゲットS": "Ingredient Magnet S",
    "げんきチャージS": "Charge Energy S",
    "エナジーチャージS(ランダム)": "Charge Strength S (Random)",
    "エナジーチャージS": "Charge Strength S",
    "エナジーチャージM": "Charge Strength M",
    "ゆめのかけらゲットS(ランダム)": "Dream Shard Magnet S (Random)",
    "ゆめのかけらゲットS": "Dream Shard Magnet S",
    "げんきエールS": "Energizing Cheer S",
    "ゆびをふる": "Metronome",
    "げんきオールS": "Energy for Everyone S",
    "おてつだいサポートS": "Extra Helpful S",
    "料理パワーアップS": "Cooking Power-Up S",
    "料理チャンスS": "Tasty Chance S",
    "おてつだいブースト(でんき)": "Helper Boost",
    "おてつだいブースト(ほのお)": "Helper Boost",
    "おてつだいブースト(みず)": "Helper Boost",
};
const ingredients = {
    "ふといながねぎ": "leek",
    "あじわいキノコ": "mushroom",
    "とくせんエッグ": "egg",
    "ほっこりポテト": "potato",
    "とくせんリンゴ": "apple",
    "げきからハーブ": "herb",
    "マメミート": "sausage",
    "モーモーミルク": "milk",
    "あまいミツ": "honey",
    "ピュアなオイル": "oil",
    "あったかジンジャー": "ginger",
    "あんみんトマト": "tomato",
    "リラックスカカオ": "cacao",
    "おいしいシッポ": "tail",
    "ワカクサ大豆": "soy",
    "ワカクサコーン": "corn",
};

async function main() {
    // Update field.json
    const fieldJsonPath = path.join(INIT_CWD, "src/data/field.json");
    const fieldJson = JSON.parse(fs.readFileSync(fieldJsonPath));
    await syncRanksAndPowers(fieldJson);
    fs.writeFileSync(fieldJsonPath, JSON.stringify(fieldJson, null, 4));

    // Read or create spo.json
/*    const spoJsonPath = path.join(INIT_CWD, "src/data/spo.json");
    let spoJson = {};
    await syncSPO(spoJson);
    fs.writeFileSync(spoJsonPath, JSON.stringify(spoJson, null, 4));*/

    // sync pokemon.json
    await syncPokemon();

    // write field.json
    console.log("done!");
}

async function syncRanksAndPowers(fieldJson) {
    // Update ranks & powers
    const areaNames = [
        "ワカクサ本島",
        "シアンの砂浜",
        "トープ洞窟",
        "ウノハナ雪原",
        "ラピスラズリ湖畔"
    ];
    for (let i = 0; i < areaNames.length; i++) {
        const area = "リサーチフィールド/" + areaNames[i];
        const html = await getWikiHtml(area);
        fieldJson[i].powers = getPowers(html);
    }
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
    const name = '検証：ねむけパワーと出現寝顔の関係/SPO調整/SPO一覧';
    const html = await getWikiHtml(name);
    console.log('  downloaded');
    updateSPO(json, html);
    console.log('Parsed SPO');
}

function updateSPO(json, html) {
    const dom = new JSDOM(html);

    // find table
    const tables = dom.window.document.querySelectorAll('table');
    const table = [...tables].find((t) => {
        return t.querySelector('td')?.textContent == "フィールド";
    });
    if (table == null) { throw new Error('not found'); }

    // parse table
    const trs = table.querySelectorAll('tbody tr');
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
}

async function syncPokemon() {
    console.log('Retrieving pokemon list');

    // read i18n/ja.json
    const pokemonJsonPath = path.join(INIT_CWD, "src/data/pokemon.json");
    const jaJsonPath = path.join(INIT_CWD, "src/i18n/ja.json");
    const jaJson = JSON.parse(fs.readFileSync(jaJsonPath));
    const ja2en = {};
    const en2ja = jaJson.translation.pokemons;
    for (const enname of Object.keys(jaJson.translation.pokemons)) {
        ja2en[jaJson.translation.pokemons[enname]] = enname;
    }

    // Read or initialize pokemon list
    console.log('Getting pokemon list');
    const listHtml = await getWikiHtml("ポケモンの一覧");
    console.log('  downloaded');
    const pokemonJson = updatePokemonList(listHtml, ja2en);
    fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));

    // convert pokemon name (ja -> en), and prepare name2id
    const nameJa2id = {};
    for (const pokemon of pokemonJson) {
        const nameJa = en2ja[pokemon.name];
        nameJa2id[nameJa] = parseInt(pokemon.id, 10);
    }

    const rpCsv = await getUrlWithCache(
        'https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/export?format=csv&gid=1673887151',
        'RP spread sheet', 'rp.cache');
    updatePokemonProbability(pokemonJson, ja2en, rpCsv);
    fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));

    // Update each Pokemon
    for (const pokemon of pokemonJson) {
        const name = pokemon.name;
        const nameJa = en2ja[name];

        const html = await getWikiHtml(nameJa.replace(" ", ""));
        updatePokemon(pokemon, html, nameJa, nameJa2id);
    }
    fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));
}

function updatePokemonList(html, ja2en) {
    const dom = new JSDOM(html);

    // find table
    const tables = dom.window.document.querySelectorAll('table');

    const table = [...tables].find((t) => {
        return t.querySelector('th')?.textContent == "画像";
    });
    if (table == null) { throw new Error('not found'); }

    const trs = table.querySelectorAll('tbody>tr');
    const json = [];
    for (const tr of trs) {
        const tds = tr.querySelectorAll('td');
        const id = parseInt(tds[1].textContent, 10);
        const nameJa = tds[2].firstChild.textContent.replace("(", " (");
        const sleepTypeJa = tds[3].textContent;
        const specialityJa = tds[4].textContent;
        const berryJa = tds[5].querySelector("a").getAttribute("title").replace("きのみ/", "");
        const skillJa = tds[9].textContent;
        const fp = parseInt(tds[10].textContent, 10);
        const frequency = parseInt(tds[11].textContent, 10);

        // validate
        if (!(sleepTypeJa in sleepTypes)) { throw new Error(`Unknown sleep type: ${typeJa}`); }
        const sleepType = sleepTypes[sleepTypeJa];
        if (!(berryJa in berryTypes)) { throw new Error(`Unknown berry: ${berryJa}`); }
        const type = berryTypes[berryJa];
        if (!(nameJa in ja2en)) { throw new Error(`Unknown pokemon: ${nameJa}`); }
        const name = ja2en[nameJa];
        if (!(specialityJa in specialties)) { throw new Error(`Unknown speciality: ${specialityJa}`); }
        const speciality = specialties[specialityJa];
        if (!(skillJa in skills)) { throw new Error(`Unknown skill: ${skillJa}`); }
        const skill = skills[skillJa];

        json.push({
            id, name, sleepType, type, speciality, skill, fp, frequency, 
        });
    }

    json.sort(function(a, b) {
        return a.id !== b.id ? a.id - b.id :
            a.name > b.name ? 1: -1;
    });
    return json;
}

function updatePokemonProbability(pokemonJson, ja2en, rpCsv) {
    const lines = rpCsv.toString().split(/\n/g);
    const prob = {};
    for (const line of lines.filter(x => x.match(/^[^,]+,\d+\.\d+%/))) {
        let [pokemon, ingRatio, confidence, skillRatio] = line.split(',');
        let unknown = false;
        if (confidence !== 'Very good') {
            unknown = true;
        }
        if (pokemon === 'Pikachu (Holiday)') {
            pokemon = 'Pikachu (Festivo)';
        }
        ingRatio = parseFloat(ingRatio.replace('%', ''));
        skillRatio = parseFloat(skillRatio.replace('%', ''));
        prob[pokemon] = {ingRatio, skillRatio, unknown};
    }
    for (const pokemon of pokemonJson) {
        if (!(pokemon.name in prob)) {
            console.warn(`${pokemon.name} not in prob table`);
            continue;
        }
        pokemon.ingRatio = prob[pokemon.name].ingRatio;
        pokemon.skillRatio = prob[pokemon.name].skillRatio;
        if (prob[pokemon.name].unknown) {
            pokemon.ratioNotFixed = true;
        }
    }
}

function updatePokemon(json, html, nameJa, nameJa2id) {
    const dom = new JSDOM(html);
    const name = json.name;

    // find evolution
    if (['Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon',
        'Umbreon', 'Leafeon', 'Glaceon', 'Sylveon'].includes(name)) {
        json.ancestor = 133;
        json.evolutionCount = (name === 'Eevee' ? 0 : 1);
        json.evolutionLeft = 1 - json.evolutionCount;
        json.isFullyEvolved = (json.evolutionCount === 1);
    }
    else if (['Ralts', 'Kirlia', 'Gardevoir', 'Gallade'].includes(name)) {
        json.ancestor = 280;
        json.evolutionCount = ['Ralts', 'Kirlia', 'Gardevoir', 'Gallade'].indexOf(name);
        if (json.evolutionCount === 3) {
            json.evolutionCount = 2;
        }
        json.evolutionLeft = 2 - json.evolutionCount;
        json.isFullyEvolved = (json.evolutionCount === 2);
    }
    else if (['Slowpoke', 'Slowbro', 'Slowking'].includes(name)) {
        json.ancestor = 79;
        json.evolutionCount = ['Slowpoke', 'Slowbro', 'Slowking'].indexOf(name);
        if (json.evolutionCount === 2) {
            json.evolutionCount = 1;
        }
        json.evolutionLeft = 1 - json.evolutionCount;
        json.isFullyEvolved = (json.evolutionCount === 1);
    }
    else {
        const evolink = dom.window.document.querySelector('h4 a[title="育成/進化"]');
        if (evolink === null) { throw new Error('進化 not found'); }
        const ancestor = evolink.parentNode.parentNode.querySelector('p>strong>a')?.textContent;
        // Charmander: [4, 5, 6]
        // Non-evolving: []
        const evoline = [...evolink.parentNode.parentNode.querySelectorAll('p>strong>a')]
            .map(x => nameJa2id[x.textContent]);
        json.ancestor = (ancestor === undefined ? null : nameJa2id[ancestor]);
        json.evolutionCount = evoline.indexOf(json.id);
        json.evolutionLeft = evoline.length - json.evolutionCount - 1;
        json.isFullyEvolved = (json.evolutionCount === evoline.length - 1);
    }

    // find carry limit table
    const tables = dom.window.document.querySelectorAll('table');
    const carryLimitTable = [...tables].find((t) => {
        return t.querySelector('th')?.textContent === "初期最大所持数";
    });
    if (carryLimitTable === null) { throw new Error('carry limit table not found'); }
    json.carryLimit = parseInt(carryLimitTable.querySelector('td').textContent, 10);

    // find ing table
    const ingTable = [...tables].find((t) => {
        return t.querySelector('th')?.textContent === "食材";
    });
    if (ingTable === null) { throw new Error(`ing table not found`)}
    const trs = ingTable.querySelectorAll('tbody>tr');

    // get ing1
    let tds = trs[1].querySelectorAll('td');
    let ingJa = tds[4].querySelector('a').textContent;
    let c1 = parseInt(tds[1].textContent.replace("個", ""), 10);
    let c2 = parseInt(tds[2].textContent.replace("個", ""), 10);
    let c3 = parseInt(tds[3].textContent.replace("個", ""), 10);
    if (!(ingJa in ingredients)) { throw new Error('Unknown ing: ${ingJa}'); }
    let ing = ingredients[ingJa];
    json.ing1 = {name: ing, c1, c2, c3};

    // get ing2
    tds = trs[2].querySelectorAll('td');
    ingJa = tds[4].querySelector('a').textContent;
    c2 = parseInt(tds[2].textContent.replace("個", ""), 10);
    c3 = parseInt(tds[3].textContent.replace("個", ""), 10);
    if (!(ingJa in ingredients)) { throw new Error('Unknown ing: ${ingJa}'); }
    ing = ingredients[ingJa];
    json.ing2 = {name: ing, c2, c3};

    // get ing3
    tds = trs[3].querySelectorAll('td');
    ingJa = tds[4].querySelector('a')?.textContent;
    if (ingJa === undefined) {
        return;
    }
    c3 = parseInt(tds[3].textContent.replace("個", ""), 10);
    if (!(ingJa in ingredients)) { throw new Error('Unknown ing: ${ingJa}'); }
    ing = ingredients[ingJa];
    json.ing3 = {name: ing, c3};
}

async function getWikiHtml(name) {
    // return cache if it exists
    // TODO: cache 1 week
    const cacheFileName = name.replace(/\//g, '_') + '.html';

    // download and cache
    const url = getWikiUrl(name);
    return await getUrlWithCache(url, name, cacheFileName);
}

function getWikiUrl(name) {
    return "https://wikiwiki.jp/poke_sleep/" + encodeURI(name);        
}

async function getUrlWithCache(url, name, cacheFileName) {
    // ensure that cache dir exists
    const cacheDir = path.join(INIT_CWD, ".cache");
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }

    // return cache if it exists
    // TODO: cache 1 week
    const cachePath = path.join(cacheDir, cacheFileName);
    if (fs.existsSync(cachePath)) {
        console.log(`Retrieving ${name} (cache)`);
        return fs.readFileSync(cachePath);
    }

    // download and cache
    console.log(`Retrieving ${name}`);
    const content = await getHtml(url);
    fs.writeFileSync(cachePath, content);
    await setTimeout(2000);
    return content;
}

async function getHtml(url) {
    console.log('getting ', url);
    const handleResponse = (res, resolve, reject) => {
        let html = '';
        res.setEncoding('utf-8');
        res
            .on('data', function(chunk) {
                html += chunk;
            })
            .on('end', function() {
                resolve(html);
            })
            .on('error', reject);
    }
    return new Promise((resolve, reject) => {
        https.get(url, function(res) {
            if (res.headers.location !== undefined) {
                res.on('data', function() {})
                    .on('end', function() {})
                    .on('error', function() {});
                https.get(res.headers.location, function(res) {
                    handleResponse(res, resolve, reject);
                });
                return;
            }
            handleResponse(res, resolve, reject);
        });
    });
}

main();
