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
    const db = await sqlite.open(file);
    const data = await db.all("select * from datas,texts where datas.id=texts.id");
    return data;
}

async function downloadDB(file: any, filePath: string): Promise<void> {
    const fullPath = filePath + "/" + file.name;
    await util.promisify(mkdirp)(filePath);
    const result = await request({
        encoding: null,
        url: file.download_url
    });
    fs.writeFile(fullPath, result);
}

async function downloadRepo(repo: octokit.ReposGetContentParams, filePath: string): Promise<string[]> {
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
}

interface IStringsConfPayload {
    setcodes: { [set: string]: string };
    counters: { [counter: string]: string };
}

async function loadSetcodes(filePath: string): Promise<IStringsConfPayload> {
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
    await Promise.all(proms);
    return cards;
}

async function downloadDBs(
    repos: octokit.ReposGetContentParams[],
    filePath: string,
    lang: ILangTranslations
): Promise<ICardList> {
    let cards: ICardList = {};
    const proms: Array<Promise<void>> = [];
    for (const repo of repos) {
        const newProm = downloadRepo(repo, filePath).then(async files => {
            const newCards = await loadDBs(files, filePath, lang);
            cards = { ...cards, ...newCards };
        });
        proms.push(newProm);
    }
    await Promise.all(proms);
    return cards;
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
    public static async prepareData(name: string, config: ILangConfig, path: string): Promise<ILanguageDataPayload> {
        const cards: ICardList = {};
        let counters = {};
        let setcodes = {};
        const filePath = path + "/dbs/" + name;
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
    }
    public static async build(name: string, config: ILangConfig, path: string): Promise<Language> {
        const data = await Language.prepareData(name, config, path);
        return new Language(name, data);
    }
    public cards: { [code: number]: Card };
    public setcodes: { [set: string]: string };
    public counters: { [counter: string]: string };
    public ots: { [ot: number]: string };
    public types: { [type: number]: string };
    public races: { [type: number]: string };
    public attributes: { [type: number]: string };
    public categories: { [type: number]: string };
    public name: string;
    public fuseList: fuse;
    constructor(name: string, data: ILanguageDataPayload) {
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

    public getCardByCode(code: number): Card {
        if (code in this.cards) {
            return this.cards[code];
        } else {
            throw new Error("Could not find card for code " + code + " in Language " + this.name + "!");
        }
    }

    public getCardByName(name: string): Card {
        const card: Card | undefined = Object.values(this.cards).find(c => c.name.toLowerCase() === name.toLowerCase());
        if (card) {
            return card;
        } else {
            const results = this.fuseList.search<IFuseEntry>(fixName(name));
            if (results.length > 0) {
                // TODO: results.sort() based on OT?
                return this.cards[results[0].code];
            } else {
                throw new Error("Could not find card for query " + name + " in Language " + this.name + "!");
            }
        }
    }
}
