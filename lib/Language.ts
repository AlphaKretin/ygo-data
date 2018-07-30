import * as octokit from "@octokit/rest";
import * as fuse from "fuse.js";
import * as mkdirp from "mkdirp";
import * as fs from "mz/fs";
import * as request from "request-promise-native";
import * as sqlite from "sqlite";
import * as util from "util";
import { Card, ICardSqlResult } from "./Card";

const GitHub = new octokit();

function fixName(name: string) {
    return name.toLowerCase().replace(/ +/g, "");
}

async function loadDB(file: string): Promise<ICardSqlResult[]> {
    try {
        const db = await sqlite.open(file);
        const data = await db.all("select * from datas,texts where datas.id=texts.id");
        return data;
    } catch (e) {
        throw e;
    }
}

async function downloadDB(file: any, filePath: string): Promise<void> {
    try {
        const fullPath = filePath + "/" + file.name;
        await util.promisify(mkdirp)(filePath);
        const result = await request({
            encoding: null,
            url: file.download_url
        });
        fs.writeFile(fullPath, result);
    } catch (e) {
        throw e;
    }
}

async function downloadRepo(repo: octokit.ReposGetContentParams, filePath: string): Promise<string[]> {
    try {
        const res = await GitHub.repos.getContent(repo);
        const filenames: string[] = [];
        const proms: Array<Promise<void>> = [];
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
    } catch (e) {
        throw e;
    }
}

interface IStringsConfPayload {
    setcodes: { [set: string]: string };
    counters: { [counter: string]: string };
}

async function loadSetcodes(filePath: string): Promise<IStringsConfPayload> {
    try {
        const body = await request(filePath);
        const data: IStringsConfPayload = { setcodes: {}, counters: {} };
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
    } catch (e) {
        throw e;
    }
}

async function loadDBs(files: string[], filePath: string, lang: ILangTranslations): Promise<ICardList> {
    const cards: { [n: number]: Card } = {};
    const proms: Array<Promise<void>> = [];
    for (const file of files) {
        const newProm = loadDB(filePath + "/" + file).then(dat => {
            for (const cardData of dat) {
                const card = new Card(cardData, [file], lang);
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
    try {
        await Promise.all(proms);
    } catch (e) {
        throw e;
    }
    return cards;
}

async function downloadDBs(
    repos: octokit.ReposGetContentParams[],
    filePath: string,
    lang: ILangTranslations
): Promise<ICardList> {
    let cards: ICardList = {};
    const proms: Array<Promise<void>> = [];
    try {
        for (const repo of repos) {
            const newProm = downloadRepo(repo, filePath).then(async files => {
                const newCards = await loadDBs(files, filePath, lang);
                cards = { ...cards, ...newCards };
            });
            proms.push(newProm);
        }
        await Promise.all(proms);
        return cards;
    } catch (e) {
        throw e;
    }
}

interface ILanguageDataPayload {
    cards: { [code: number]: Card };
    setcodes: { [set: string]: string };
    counters: { [counter: string]: string };
    ots: { [ot: number]: string };
    types: { [type: number]: string };
    races: { [race: number]: string };
    attributes: { [type: number]: string };
    categories: { [race: number]: string };
    fuseList: fuse;
}

export interface ILangTranslations {
    setcodes: { [set: string]: string };
    ots: { [ot: number]: string };
    types: { [type: number]: string };
    races: { [race: number]: string };
    attributes: { [type: number]: string };
    categories: { [race: number]: string };
}

export interface ILangConfig {
    attributes: { [type: number]: string };
    categories: { [type: number]: string };
    fuseOptions?: fuse.FuseOptions;
    ots: { [ot: number]: string };
    races: { [race: number]: string };
    types: { [type: number]: string };
    stringsConf: string;
    localDBs?: string[];
    remoteDBs?: octokit.ReposGetContentParams[];
}

export interface ICardList {
    [code: number]: Card;
}

interface IFuseEntry {
    code: number;
    name: string;
}

export class Language {
    // preparing the data for a language must be done asynchronously, so the intended use is to call this function,
    // then instantiate a Language object with its resolution
    public pendingData: Promise<ILanguageDataPayload>;
    public name: string;
    constructor(name: string, config: ILangConfig, path: string) {
        this.name = name;
        this.pendingData = this.prepareData(config, path);
    }

    public async getCardByCode(code: number): Promise<Card | undefined> {
        try {
            const cards = await this.getCards();
            if (code in cards) {
                return cards[code];
            }
        } catch (e) {
            throw e;
        }
    }

    public async getCardByName(name: string): Promise<Card | undefined> {
        try {
            const cards = await this.getCards();
            const card: Card | undefined = Object.values(cards).find(c => c.name.toLowerCase() === name.toLowerCase());
            if (card) {
                return card;
            } else {
                const fuseList = await this.getFuse();
                const results = fuseList.search<IFuseEntry>(fixName(name));
                if (results.length > 0) {
                    // TODO: results.sort() based on OT?
                    return cards[results[0].code];
                }
            }
        } catch (e) {
            throw e;
        }
    }

    public async getCards() {
        try {
            const data = await this.pendingData;
            return data.cards;
        } catch (e) {
            throw e;
        }
    }

    private async getSetcodes() {
        try {
            const data = await this.pendingData;
            return data.setcodes;
        } catch (e) {
            throw e;
        }
    }

    private async getCounters() {
        try {
            const data = await this.pendingData;
            return data.counters;
        } catch (e) {
            throw e;
        }
    }

    private async getOts() {
        try {
            const data = await this.pendingData;
            return data.ots;
        } catch (e) {
            throw e;
        }
    }

    private async getTypes() {
        try {
            const data = await this.pendingData;
            return data.types;
        } catch (e) {
            throw e;
        }
    }

    private async getCategories() {
        try {
            const data = await this.pendingData;
            return data.categories;
        } catch (e) {
            throw e;
        }
    }

    private async getAttributes() {
        try {
            const data = await this.pendingData;
            return data.attributes;
        } catch (e) {
            throw e;
        }
    }

    private async getRaces() {
        try {
            const data = await this.pendingData;
            return data.races;
        } catch (e) {
            throw e;
        }
    }

    private async getFuse() {
        try {
            const data = await this.pendingData;
            return data.fuseList;
        } catch (e) {
            throw e;
        }
    }

    private async prepareData(config: ILangConfig, path: string): Promise<ILanguageDataPayload> {
        const cards: ICardList = {};
        let counters = {};
        let setcodes = {};
        const filePath = path + "/dbs/" + this.name;
        try {
            const res = await loadSetcodes(config.stringsConf);
            counters = res.counters;
            setcodes = res.setcodes;
            const transl: ILangTranslations = {
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
            const entries: IFuseEntry[] = Object.values(cards).map((c: Card) => {
                const entry: IFuseEntry = {
                    code: c.code,
                    name: fixName(c.name)
                };
                return entry;
            });
            const fuseList = new fuse(entries, config.fuseOptions || {});
            const data: ILanguageDataPayload = {
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
        } catch (e) {
            throw e;
        }
    }
}
