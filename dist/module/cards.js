"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cards = void 0;
const mkdirp_1 = __importDefault(require("mkdirp"));
const fs_1 = __importDefault(require("mz/fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const Card_1 = require("../class/Card");
const ygo_data_1 = require("../ygo-data");
const github_1 = require("./github");
class CardList {
    async getCard(id) {
        if (!this.cards) {
            throw new Error("Card list not loaded!");
        }
        if (typeof id === "string") {
            id = parseInt(id, 10);
        }
        const list = await this.cards;
        return list[id];
    }
    update(opts, savePath, gitAuth) {
        // returns the same promise it registers to this.cards, so awaiting the function will await the update process
        return (this.cards = this.load(opts, savePath, gitAuth));
    }
    async getSimpleList(lang) {
        if (!this.cards) {
            throw new Error("Card list not loaded!");
        }
        const list = await this.cards;
        const map = {};
        for (const key in list) {
            const card = list[key];
            const anime = card.data.isOT(ygo_data_1.enums.ot.OT_ANIME) ||
                card.data.isOT(ygo_data_1.enums.ot.OT_ILLEGAL) ||
                card.data.isOT(ygo_data_1.enums.ot.OT_VIDEO_GAME);
            if (lang in card.text) {
                map[card.id] = {
                    id: card.id,
                    name: card.text[lang].name,
                    anime,
                    custom: card.data.isOT(ygo_data_1.enums.ot.OT_CUSTOM)
                };
            }
        }
        return map;
    }
    async getRawCardList() {
        if (!this.cards) {
            throw new Error("Card list not loaded!");
        }
        return await this.cards;
    }
    async downloadSingleDB(file, filePath) {
        const fullPath = filePath + file.name;
        if (file.download_url) {
            const result = await (await node_fetch_1.default(file.download_url)).buffer();
            await fs_1.default.writeFile(fullPath, result);
        }
    }
    async downloadDBs(opts, savePath, gitAuth) {
        const proms = [];
        for (const langName in opts.langs) {
            const filePath = savePath + "/" + langName + "/";
            await mkdirp_1.default(filePath);
            const lang = opts.langs[langName];
            if (lang.remoteDBs) {
                for (const repo of lang.remoteDBs) {
                    const github = github_1.getGithub(gitAuth);
                    const res = await github.repos.getContent(repo);
                    const contents = res.data;
                    if (contents instanceof Array) {
                        for (const file of contents) {
                            if (file.name.endsWith(".cdb")) {
                                proms.push(this.downloadSingleDB(file, filePath));
                            }
                        }
                    }
                    else if (contents.name.endsWith(".cdb")) {
                        proms.push(this.downloadSingleDB(contents, filePath));
                    }
                }
            }
        }
        await Promise.all(proms);
    }
    async loadDBs(opts, savePath) {
        const raw = {};
        for (const langName in opts.langs) {
            const dir = savePath + "/" + langName + "/";
            const dbs = await fs_1.default.readdir(dir);
            for (const dbName of dbs) {
                if (dbName.endsWith(".cdb")) {
                    const db = better_sqlite3_1.default(dir + dbName);
                    const statement = db.prepare("select * from datas,texts where datas.id=texts.id");
                    const result = statement.all();
                    for (const card of result) {
                        const data = {
                            alias: card.alias,
                            atk: card.atk,
                            attribute: card.attribute,
                            category: card.category,
                            def: card.def,
                            level: card.level,
                            ot: card.ot,
                            race: card.race,
                            setcode: card.setcode,
                            type: card.type,
                            aliasedCards: [card.id]
                        };
                        const text = {
                            desc: card.desc,
                            name: card.name,
                            string1: card.str1,
                            string10: card.str10,
                            string11: card.str11,
                            string12: card.str12,
                            string13: card.str13,
                            string14: card.str14,
                            string15: card.str15,
                            string16: card.str16,
                            string2: card.str2,
                            string3: card.str3,
                            string4: card.str4,
                            string5: card.str5,
                            string6: card.str6,
                            string7: card.str7,
                            string8: card.str8,
                            string9: card.str9
                        };
                        if (card.id in raw) {
                            const firstLang = raw[card.id].dbs[0].split("/")[0]; // get first language loaded
                            raw[card.id].dbs.push(langName + "/" + dbName); // update DB list no matter what
                            if (langName === firstLang) {
                                // only pull data updates from same language as initial
                                if (opts.baseDbs) {
                                    // don't update from a base DB, those should be superceded
                                    if (!opts.baseDbs.includes(dbName)) {
                                        raw[card.id].data = data;
                                    }
                                }
                                else {
                                    // if no base DBs, update no matter what
                                    raw[card.id].data = data;
                                }
                            }
                            // text updates need to follow logic regardless of current language
                            if (langName in raw[card.id].text) {
                                if (opts.baseDbs) {
                                    // don't update from a base DB, those should be superceded
                                    if (!opts.baseDbs.includes(dbName)) {
                                        raw[card.id].text[langName] = text;
                                    }
                                }
                                else {
                                    // if no base DBs, update no matter what
                                    raw[card.id].text[langName] = text;
                                }
                            }
                            else {
                                // always push the text if we don't have any for this language yet
                                raw[card.id].text[langName] = text;
                            }
                        }
                        else {
                            const cardRaw = {
                                data,
                                dbs: [langName + "/" + dbName],
                                id: card.id,
                                text: {}
                            };
                            cardRaw.text[langName] = text;
                            raw[card.id] = cardRaw;
                        }
                    }
                }
            }
        }
        for (const id in raw) {
            const card = raw[id];
            if (card.data.alias > 0) {
                const alCard = raw[card.data.alias];
                // lists alt arts - different OT means anime version, distant ID means "always treated as"
                if (alCard && alCard.data.ot === card.data.ot && Math.abs(alCard.id - card.id) < 10) {
                    alCard.data.aliasedCards.push(card.id);
                }
                if (alCard && opts.aliasSpecialCases && opts.aliasSpecialCases.includes(card.id)) {
                    alCard.data.aliasedCards.push(card.id);
                }
            }
        }
        for (const id in raw) {
            const card = raw[id];
            if (card.data.alias === 0 && card.data.aliasedCards.length > 1) {
                for (const code of card.data.aliasedCards) {
                    // propagate alias lists to match the base card
                    raw[code].data.aliasedCards = card.data.aliasedCards;
                }
            }
        }
        return raw;
    }
    async load(opts, savePath, gitAuth) {
        await this.downloadDBs(opts, savePath, gitAuth);
        const rawData = await this.loadDBs(opts, savePath);
        const list = {};
        for (const id in rawData) {
            list[id] = new Card_1.Card(rawData[id]);
        }
        return list;
    }
}
exports.cards = new CardList();
//# sourceMappingURL=cards.js.map