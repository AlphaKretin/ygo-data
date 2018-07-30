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
    try {
        const db = await sqlite.open(file);
        const data = await db.all("select * from datas,texts where datas.id=texts.id");
        return data;
    }
    catch (e) {
        throw e;
    }
}
async function downloadDB(file, filePath) {
    try {
        const fullPath = filePath + "/" + file.name;
        await util.promisify(mkdirp)(filePath);
        const result = await request({
            encoding: null,
            url: file.download_url
        });
        fs.writeFile(fullPath, result);
    }
    catch (e) {
        throw e;
    }
}
async function downloadRepo(repo, filePath) {
    try {
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
    catch (e) {
        throw e;
    }
}
async function loadSetcodes(filePath) {
    try {
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
    catch (e) {
        throw e;
    }
}
async function loadDBs(files, filePath, lang) {
    const cards = {};
    const proms = [];
    try {
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
    catch (e) {
        throw e;
    }
}
async function downloadDBs(repos, filePath, lang) {
    let cards = {};
    const proms = [];
    try {
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
    catch (e) {
        throw e;
    }
}
class Language {
    constructor(name, config, path) {
        this.name = name;
        this.pendingData = this.prepareData(config, path);
        this.pendingData.catch(e => {
            console.error(e);
            console.error("Above error thrown in Language " +
                this.name +
                ", expect all queries to this language to reject. Best to try to solve the error and restart.");
        });
    }
    async getCardByCode(code) {
        try {
            const cards = await this.getCards();
            if (code in cards) {
                return cards[code];
            }
        }
        catch (e) {
            throw e;
        }
    }
    async getCardByName(name) {
        try {
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
            }
        }
        catch (e) {
            throw e;
        }
    }
    async getCards() {
        try {
            const data = await this.pendingData;
            return data.cards;
        }
        catch (e) {
            throw e;
        }
    }
    async getSetcodes() {
        try {
            const data = await this.pendingData;
            return data.setcodes;
        }
        catch (e) {
            throw e;
        }
    }
    async getCounters() {
        try {
            const data = await this.pendingData;
            return data.counters;
        }
        catch (e) {
            throw e;
        }
    }
    async getOts() {
        try {
            const data = await this.pendingData;
            return data.ots;
        }
        catch (e) {
            throw e;
        }
    }
    async getTypes() {
        try {
            const data = await this.pendingData;
            return data.types;
        }
        catch (e) {
            throw e;
        }
    }
    async getCategories() {
        try {
            const data = await this.pendingData;
            return data.categories;
        }
        catch (e) {
            throw e;
        }
    }
    async getAttributes() {
        try {
            const data = await this.pendingData;
            return data.attributes;
        }
        catch (e) {
            throw e;
        }
    }
    async getRaces() {
        try {
            const data = await this.pendingData;
            return data.races;
        }
        catch (e) {
            throw e;
        }
    }
    async getFuse() {
        try {
            const data = await this.pendingData;
            return data.fuseList;
        }
        catch (e) {
            throw e;
        }
    }
    async prepareData(config, path) {
        const cards = {};
        let counters = {};
        let setcodes = {};
        const filePath = path + "/dbs/" + this.name;
        try {
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
        catch (e) {
            throw e;
        }
    }
}
exports.Language = Language;
//# sourceMappingURL=Language.js.map