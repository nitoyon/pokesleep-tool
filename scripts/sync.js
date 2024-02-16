'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

async function main() {
    // read field.json
    const { INIT_CWD } = process.env;
    const fieldJsonPath = path.join(INIT_CWD, "src/field.json");
    const json = JSON.parse(fs.readFileSync(fieldJsonPath));

    // URL
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
        json[i].powers = getPowers(html);
    }

    // write field.json
    fs.writeFileSync(fieldJsonPath, JSON.stringify(json, null, 4));
    console.log("done!");
}

async function getHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, function(res) {
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


main();
