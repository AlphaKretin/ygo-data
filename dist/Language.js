"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const octokit = require("@octokit/rest");
const fuse = require("fuse.js");
const mkdirp = require("mkdirp");
const fs = require("mz/fs");
const request = require("request-promise-native");
const sqlite = require("sqlite");
const util = require("util");
const Card_1 = require("./Card");
const GitHub = new octokit();
function fixName(name) {
    return name.toLowerCase().replace(/ +/g, "");
}
async function loadDB(file) {
    const db = await sqlite.open(file);
    const data = await db.all("select * from datas,texts where datas.id=texts.id");
    return data;
}
async function downloadDB(file, filePath) {
    const fullPath = filePath + "/" + file.name;
    await util.promisify(mkdirp)(filePath);
    const result = await request({
        encoding: null,
        url: file.download_url
    });
    fs.writeFile(fullPath, result);
}
async function downloadRepo(repo, filePath) {
    const res = await GitHub.repos.getContent(repo);
    const filenames = [];
    const proms = [];
    for (const key in res.data) {
        if (res.data.hasOwnProperty(key)) {
            const file = res.data[key];
            if (file.name.endsWith(".cdb")) {
                const newProm = downloadDB(file, filePath).then(() => {
                    filenames.push(file.name);
                });
                proms.push(newProm);
            }
        }
    }
    await Promise.all(proms);
    return filenames;
}
async function loadSetcodes(filePath) {
    const body = await request(filePath);
    const data = { setcodes: {}, counters: {} };
    const lines = body.split(/\r?\n/);
    for (const line of lines) {
        if (line.startsWith("!setname")) {
            const code = line.split(" ")[1];
            const name = line.slice(line.indexOf(code) + code.length + 1);
            data.setcodes[code] = name;
        }
        if (line.startsWith("!counter")) {
            const code = line.split(" ")[1];
            const name = line.slice(line.indexOf(code) + code.length + 1);
            data.counters[code] = name;
        }
    }
    return data;
}
async function loadDBs(files, filePath, lang) {
    const cards = {};
    const proms = [];
    for (const file of files) {
        const newProm = loadDB(filePath + "/" + file).then(dat => {
            for (const cardData of dat) {
                const card = new Card_1.Card(cardData, [file], lang);
                if (card.code in cards) {
                    const dbs = card.dbs;
                    dbs.push(file);
                    card.dbs = dbs;
                }
                cards[card.code] = card;
            }
        });
        proms.push(newProm);
    }
    await Promise.all(proms);
    return cards;
}
async function downloadDBs(repos, filePath, lang) {
    let cards = {};
    const proms = [];
    for (const repo of repos) {
        const newProm = downloadRepo(repo, filePath).then(async (files) => {
            const newCards = await loadDBs(files, filePath, lang);
            cards = Object.assign({}, cards, newCards);
        });
        proms.push(newProm);
    }
    await Promise.all(proms);
    return cards;
}
class Language {
    constructor(name, config, path) {
        this.name = name;
        this.pendingData = this.prepareData(config, path);
    }
    async getCardByCode(code) {
        const cards = await this.getCards();
        if (code in cards) {
            return cards[code];
        }
        else {
            throw new Error("Could not find card for code " + code + " in Language " + this.name + "!");
        }
    }
    async getCardByName(name) {
        const cards = await this.getCards();
        const card = Object.values(cards).find(c => c.name.toLowerCase() === name.toLowerCase());
        if (card) {
            return card;
        }
        else {
            const fuseList = await this.getFuse();
            const results = fuseList.search(fixName(name));
            if (results.length > 0) {
                // TODO: results.sort() based on OT?
                return cards[results[0].code];
            }
            else {
                throw new Error("Could not find card for query " + name + " in Language " + this.name + "!");
            }
        }
    }
    async getCards() {
        const data = await this.pendingData;
        return data.cards;
    }
    async getSetcodes() {
        const data = await this.pendingData;
        return data.setcodes;
    }
    async getCounters() {
        const data = await this.pendingData;
        return data.counters;
    }
    async getOts() {
        const data = await this.pendingData;
        return data.ots;
    }
    async getTypes() {
        const data = await this.pendingData;
        return data.types;
    }
    async getCategories() {
        const data = await this.pendingData;
        return data.categories;
    }
    async getAttributes() {
        const data = await this.pendingData;
        return data.attributes;
    }
    async getRaces() {
        const data = await this.pendingData;
        return data.races;
    }
    async getFuse() {
        const data = await this.pendingData;
        return data.fuseList;
    }
    async prepareData(config, path) {
        const cards = {};
        let counters = {};
        let setcodes = {};
        const filePath = path + "/dbs/" + this.name;
        const res = await loadSetcodes(config.stringsConf);
        counters = res.counters;
        setcodes = res.setcodes;
        const transl = {
            attributes: config.attributes,
            categories: config.categories,
            ots: config.ots,
            races: config.races,
            setcodes,
            types: config.types
        };
        if (config.localDBs) {
            const cs = await loadDBs(config.localDBs, filePath, transl);
            for (const key in cs) {
                if (cs.hasOwnProperty(key)) {
                    cards[key] = cs[key];
                }
            }
        }
        if (config.remoteDBs) {
            const cs = await downloadDBs(config.remoteDBs, filePath, transl);
            for (const key in cs) {
                if (cs.hasOwnProperty(key)) {
                    cards[key] = cs[key];
                }
            }
        }
        const entries = Object.values(cards).map((c) => {
            const entry = {
                code: c.code,
                name: fixName(c.name)
            };
            return entry;
        });
        const fuseList = new fuse(entries, config.fuseOptions || {});
        const data = {
            attributes: config.attributes,
            cards,
            categories: config.categories,
            counters,
            fuseList,
            ots: config.ots,
            races: config.races,
            setcodes,
            types: config.types
        };
        return data;
    }
}
exports.Language = Language;
//# sourceMappingURL=Language.js.map