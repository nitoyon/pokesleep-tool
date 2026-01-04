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
    "つきのひかり(げんきチャージS)": "Charge Energy S (Moonlight)",
    "エナジーチャージS(ランダム)": "Charge Strength S (Random)",
    "エナジーチャージS(固定)": "Charge Strength S",
    "たくわえる(エナジーチャージS)": "Charge Strength S (Stockpile)",
    "エナジーチャージS": "Charge Strength S",
    "エナジーチャージM": "Charge Strength M",
    "ゆめのかけらゲットS(ランダム)": "Dream Shard Magnet S (Random)",
    "ゆめのかけらゲットS(固定)": "Dream Shard Magnet S",
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
    "ばけのかわ(きのみバースト)": "Berry Burst (Disguise)",
    "きのみバースト": "Berry Burst",
    "へんしん(スキルコピー)": "Skill Copy (Transform)",
    "ものまね(スキルコピー)": "Skill Copy (Mimic)",
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
    "めざましコーヒー": "coffee",
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
        "ラピスラズリ湖畔",
        "ゴールド旧発電所"
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
        return t.querySelector('th')?.textContent == "ポケモン数";
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
    // read i18n/ja.json
    const pokemonJsonPath = path.join(INIT_CWD, "src/data/pokemon.json");
    const jaJsonPath = path.join(INIT_CWD, "src/i18n/ja.json");
    const jaJson = JSON.parse(fs.readFileSync(jaJsonPath));
    const ja2en = {};
    const en2ja = jaJson.translation.pokemons;
    const enNames = Object.keys(jaJson.translation.pokemons);
    for (const enname of Object.keys(jaJson.translation.pokemons)) {
        const nameJa = jaJson.translation.pokemons[enname];
        const nameJa2 = nameJa
            .replace(" ", "")
            .replace("(アローラ)", "(アローラのすがた)")
            .replace("(パルデア)", "(パルデアのすがた)");
        ja2en[nameJa] = enname;
        ja2en[nameJa2] = enname;
    }

    // Update each Pokemon
    const pokemonJson = [];
    for (const name of enNames) {
        const nameJa = en2ja[name];
        const html = await getWikiHtml(nameJa
            .replace(" ", "")
            .replace("(アローラ)", "(アローラのすがた)")
            .replace("(パルデア)", "(パルデアのすがた)"));
        pokemonJson.push(getPokemon(html, name, ja2en));
    }
    fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));

    // Update ancestor name to id
    const en2id = {};
    for (const json of pokemonJson) {
        en2id[json.name] = json.id;
    }
    for (const json of pokemonJson) {
        if (json.ancestor !== null) {
            json.ancestor = en2id[json.ancestor];
        }
    }

    // Update ing% skill%
    const rpCsv = await getUrlWithCache(
        'https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/export?format=csv&gid=1673887151',
        'RP spread sheet', 'rp.cache');
    updatePokemonProbability(pokemonJson, ja2en, rpCsv);
    fs.writeFileSync(pokemonJsonPath, JSON.stringify(pokemonJson, null, 4));
}

function updatePokemonProbability(pokemonJson, ja2en, rpCsv) {
    const lines = rpCsv.toString().split(/\n/g);
    const prob = {};
    for (const line of lines.filter(x => x.match(/^[^,]+,\d+\.\d+%/))) {
        let [pokemon, ingRate, confidence, skillRate] = line.split(',');
        let unknown = false;
        if (confidence !== 'Very good') {
            unknown = true;
        }
        pokemon = pokemon.replace("Alolan Form", "Alola");
        ingRate = parseFloat(ingRate.replace('%', ''));
        skillRate = parseFloat(skillRate.replace('%', ''));
        prob[pokemon] = {ingRate, skillRate, unknown};
    }
    for (const pokemon of pokemonJson) {
        if (!(pokemon.name in prob)) {
            console.warn(`${pokemon.name} not in prob table`);
            continue;
        }
        pokemon.ingRate = prob[pokemon.name].ingRate;
        pokemon.skillRate = prob[pokemon.name].skillRate;
        if (prob[pokemon.name].unknown) {
            pokemon.rateNotFixed = true;
        }
    }
}

function getPokemon(html, name, nameJa2en) {
    const dom = new JSDOM(html);
    let ancestor, evolutionCount, evolutionLeft, isFullyEvolved;

    // Get form from name
    const m = name.match(/\(([^)]+)\)$/);
    const form = m === null ? null : m[1];

    // find evolution
    if (['Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon',
        'Umbreon', 'Leafeon', 'Glaceon', 'Sylveon'].includes(name)) {
        ancestor = 'Eevee';
        evolutionCount = (name === 'Eevee' ? 0 : 1);
        evolutionLeft = 1 - evolutionCount;
        isFullyEvolved = (evolutionCount === 1);
    }
    else if (['Ralts', 'Kirlia', 'Gardevoir', 'Gallade'].includes(name)) {
        ancestor = 'Ralts';
        evolutionCount = ['Ralts', 'Kirlia', 'Gardevoir', 'Gallade'].indexOf(name);
        if (evolutionCount === 3) {
            evolutionCount = 2;
        }
        evolutionLeft = 2 - evolutionCount;
        isFullyEvolved = (evolutionCount === 2);
    }
    else if (['Slowpoke', 'Slowbro', 'Slowking'].includes(name)) {
        ancestor = 'Slowpoke';
        evolutionCount = ['Slowpoke', 'Slowbro', 'Slowking'].indexOf(name);
        if (evolutionCount === 2) {
            evolutionCount = 1;
        }
        evolutionLeft = 1 - evolutionCount;
        isFullyEvolved = (evolutionCount === 1);
    }
    else {
        const evolink = dom.window.document.querySelector('h4 a[title="育成/進化"]');
        if (evolink === null) { throw new Error('進化 not found'); }
        ancestor = evolink.parentNode.parentNode.querySelector('p>strong>a')?.textContent;
        // Charmander: [4, 5, 6]
        // Non-evolving: []
        const evoline = [...evolink.parentNode.parentNode.querySelectorAll('p>strong>a')]
            .map(x => nameJa2en[x.textContent]);
        ancestor = (ancestor === undefined ? null : nameJa2en[ancestor]);
        evolutionCount = evoline.indexOf(name);
        evolutionLeft = evoline.length - evolutionCount - 1;
        isFullyEvolved = (evolutionCount === evoline.length - 1);
    }

    // find id
    const idMatch = dom.window.document.querySelector('ins')
        ?.textContent?.match(/No\.(\d+)/);
    if (idMatch === null) { throw new Error('pokemon ID not found'); }
    const id = parseInt(idMatch[1], 10);

    // find carry limit and main skill
    const tables = dom.window.document.querySelectorAll('table');
    const carryLimitTable = [...tables].find((t) => {
        return t.querySelector('th')?.textContent === "初期最大所持数";
    });
    if (carryLimitTable === null) { throw new Error('carry limit table not found'); }
    let tds = carryLimitTable.querySelectorAll('td');
    const carryLimit = parseInt(tds[0].textContent, 10);
    let skillJa = tds[1].textContent.replace(/ /g, "").replace("（", "(").replace("）", ")");
    if (!(skillJa in skills)) { throw new Error(`Unknown skill: ${skillJa}`); }
    const skill = skills[skillJa];

    // find specialty
    const typeTable = [...tables].find((t) => {
        return t.querySelector('th')?.textContent === 'とくい';
    });
    if (typeTable === null) { throw new Error('type table not found'); }
    tds = typeTable.querySelectorAll('td');
    const specialtyJa = tds[0].textContent;
    if (!(specialtyJa in specialties)) { throw new Error(`Unknown specialty: ${specialtyJa}`); }
    const specialty = specialties[specialtyJa];

    // find frequency
    const frequencyMatch = tds[1]?.textContent?.match(/(\d+)秒/);
    if (frequencyMatch === null) { throw new Error(`frequency not found: ${tds[1].textContent}`); }
    const frequency = parseInt(frequencyMatch[1], 10);

    // find type
    const berryJa = tds[2]?.querySelector('a').getAttribute('title').replace("きのみ/", "");
    if (!(berryJa in berryTypes)) { throw new Error(`Unknown berry: ${berryJa}`); }
    const type = berryTypes[berryJa];

    // find sleepType
    const sleepTypeTable = [...tables].find((t) => {
        return t.querySelector('th')?.textContent === '睡眠タイプ';
    });
    if (sleepTypeTable === null) { throw new Error('sleep type table not found'); }
    tds = sleepTypeTable.querySelectorAll('td');
    const sleepTypeJa = tds[0]?.textContent;
    if (!(sleepTypeJa in sleepTypes)) { throw new Error(`Unknown sleep type: ${sleepTypeJa}`); }
    const sleepType = sleepTypes[sleepTypeJa];

    // find fp
    const fpMatch = tds[1].textContent.match(/(\d+)ポイント/);
    if (fpMatch === null) { throw new Error(`fp not found: ${tds[1].textContent}`)}
    const fp = parseInt(fpMatch[1], 10);

    // find ing table
    const ingTable = [...tables].find((t) => {
        return t.querySelector('th')?.textContent === "食材";
    });
    if (ingTable === null) { throw new Error(`ing table not found`)}
    const trs = ingTable.querySelectorAll('tbody>tr');

    // get ing1
    tds = trs[1].querySelectorAll('td');
    let ingJa = tds[4].querySelector('a').textContent;
    let c1 = parseInt(tds[1].textContent.replace("個", ""), 10);
    let c2 = parseInt(tds[2].textContent.replace("個", ""), 10);
    let c3 = parseInt(tds[3].textContent.replace("個", ""), 10);
    if (!(ingJa in ingredients)) { throw new Error('Unknown ing: ${ingJa}'); }
    let ing = ingredients[ingJa];
    const ing1 = {name: ing, c1, c2, c3};

    // get ing2
    tds = trs[2].querySelectorAll('td');
    ingJa = tds[4].querySelector('a').textContent;
    c2 = parseInt(tds[2].textContent.replace("個", ""), 10);
    c3 = parseInt(tds[3].textContent.replace("個", ""), 10);
    if (!(ingJa in ingredients)) { throw new Error('Unknown ing: ${ingJa}'); }
    ing = ingredients[ingJa];
    const ing2 = {name: ing, c2, c3};

    // get ing3
    tds = trs[3].querySelectorAll('td');
    ingJa = tds[4].querySelector('a')?.textContent;
    let ing3 = undefined;
    if (ingJa !== undefined) {
        c3 = parseInt(tds[3].textContent.replace("個", ""), 10);
        if (!(ingJa in ingredients)) { throw new Error('Unknown ing: ${ingJa}'); }
        ing = ingredients[ingJa];
        ing3 = {name: ing, c3};
    }

    const ret = {
        id, name, sleepType, type, specialty, skill, fp, frequency,
        ingRate: 0, skillRate: 0,
        ancestor, evolutionCount, evolutionLeft, isFullyEvolved,
        carryLimit, ing1, ing2, ing3,
    };
    if (form !== null) {
        ret.form = form;
    }
    if (name === 'Clodsire') {
        ret.form = "Paldea";
    }
    return ret;
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
