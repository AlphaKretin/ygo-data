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
    for (const key in res.data) {
        if (res.data.hasOwnProperty(key)) {
            const file = res.data[key];
            if (file.name.endsWith(".cdb")) {
                await downloadDB(file, filePath);
                filenames.push(file.name);
            }
        }
    }
    return filenames;
}
async function loadSetcodes(filePath) {
    const body = await request(filePath);
    const data = { setcodes: {}, counters: {} };
    for (const line of body.split(/\R/)) {
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
    for (const file of files) {
        const dat = await loadDB(filePath + "/" + file);
        for (const cardData of dat) {
            const card = new Card_1.Card(cardData, [file], lang);
            if (card.code in cards) {
                const dbs = card.dbs;
                dbs.push(file);
                card.dbs = dbs;
            }
            cards[card.code] = card;
        }
    }
    return cards;
}
async function downloadDBs(repos, filePath, lang) {
    let cards = {};
    for (const repo of repos) {
        const files = await downloadRepo(repo, filePath);
        const newCards = await loadDBs(files, filePath, lang);
        cards = Object.assign({}, cards, newCards);
    }
    return cards;
}
class Language {
    // preparing the data for a language must be done asynchronously, so the intended use is to call this function,
    // then instantiate a Language object with its resolution
    static async prepareData(name, config, path) {
        const cards = {};
        let counters = {};
        let setcodes = {};
        const filePath = path + "/dbs/" + name;
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
    static async build(name, config, path) {
        const data = await Language.prepareData(name, config, path);
        return new Language(name, data);
    }
    constructor(name, data) {
        this.name = name;
        this.cards = data.cards;
        this.setcodes = data.setcodes;
        this.counters = data.counters;
        this.ots = data.ots;
        this.types = data.types;
        this.races = data.races;
        this.attributes = data.attributes;
        this.categories = data.categories;
        this.fuseList = data.fuseList;
    }
    getCardByCode(code) {
        if (code in this.cards) {
            return this.cards[code];
        }
        else {
            throw new Error("Could not find card for code " + code + " in Language " + this.name + "!");
        }
    }
    getCardByName(name) {
        const card = Object.values(this.cards).find(c => c.name.toLowerCase() === name.toLowerCase());
        if (card) {
            return card;
        }
        else {
            const results = this.fuseList.search(fixName(name));
            if (results.length > 0) {
                // TODO: results.sort() based on OT?
                return this.cards[results[0].code];
            }
            else {
                throw new Error("Could not find card for query " + name + " in Language " + this.name + "!");
            }
        }
    }
}
exports.Language = Language;
//# sourceMappingURL=Language.js.map