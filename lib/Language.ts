import * as octokit from "@octokit/rest";
import * as fs from "fs";
import * as fuse from "fuse.js";
import * as mkdirp from "mkdirp";
import * as request from "request";
import * as sqlite from "sqlite";
import { Card, ICardSqlResult } from "./Card";
const GitHub = new octokit();

function fixName(name: string) {
    return name.toLowerCase().replace(/ +/g, "");
}

function loadDB(file: string): Promise<ICardSqlResult[]> {
    return new Promise((resolve, reject) => {
        sqlite.open(file).then(
            db => {
                db.all("select * from datas,texts where datas.id=texts.id").then(
                    data => {
                        resolve(data);
                    },
                    err => reject(err)
                );
            },
            err => reject(err)
        );
    });
}

function downloadDB(file: any, filePath: string): Promise<null> {
    return new Promise((resolve, reject) => {
        const fullPath = filePath + "/" + file.name;
        mkdirp(filePath, err => {
            if (err) {
                reject(err);
            } else {
                request(
                    {
                        encoding: null,
                        url: file.download_url
                    },
                    (er: Error, _: any, body: Buffer) => {
                        if (er) {
                            reject(er);
                        } else {
                            fs.writeFile(fullPath, body, e => {
                                if (e) {
                                    reject(e);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    }
                );
            }
        });
    });
}

function downloadRepo(repo: octokit.ReposGetContentParams, filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        GitHub.repos
            .getContent(repo)
            .then(res => {
                const filenames: string[] = [];
                const promises = [];
                for (const key in res.data) {
                    if (res.data.hasOwnProperty(key)) {
                        const file = res.data[key];
                        if (file.name.endsWith(".cdb")) {
                            promises.push(downloadDB(file, filePath).then(() => filenames.push(file.name)));
                        }
                    }
                }
                Promise.all(promises)
                    .then(() => {
                        resolve(filenames);
                    })
                    .catch(e => reject(e));
            })
            .catch(e => reject(e));
    });
}

interface IStringsConfPayload {
    setcodes: { [set: string]: string };
    counters: { [counter: string]: string };
}

function loadSetcodes(filePath: string): Promise<IStringsConfPayload> {
    return new Promise((resolve, reject) => {
        request(filePath, (err, _, body) => {
            if (err) {
                reject(err);
            } else {
                const data: IStringsConfPayload = { setcodes: {}, counters: {} };
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
                resolve(data);
            }
        });
    });
}

function loadDBs(files: string[], filePath: string, lang: ILangTranslations): Promise<ICardList> {
    return new Promise((resolve, reject) => {
        const cards: { [n: number]: Card } = {};
        const proms = files.map(file =>
            loadDB(filePath + "/" + file).then(dat => {
                for (const cardData of dat) {
                    const card = new Card(cardData, [file], lang);
                    if (card.code in cards) {
                        const dbs = card.dbs;
                        dbs.push(file);
                        card.dbs = dbs;
                    }
                    cards[card.code] = card;
                }
            })
        );
        Promise.all(proms)
            .then(() => resolve(cards))
            .catch(e => reject(e));
    });
}

function downloadDBs(
    repos: octokit.ReposGetContentParams[],
    filePath: string,
    lang: ILangTranslations
): Promise<ICardList> {
    return new Promise((resolve, reject) => {
        repos.forEach(repo => {
            downloadRepo(repo, filePath)
                .then(files => {
                    loadDBs(files, filePath, lang)
                        .then(resolve)
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        });
    });
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

interface ICardList {
    [code: number]: Card;
}

interface IFuseEntry {
    code: number;
    name: string;
}

export class Language {
    // preparing the data for a language must be done asynchronously, so the intended use is to call this function,
    // then instantiate a Language object with its resolution
    public static prepareData(name: string, config: ILangConfig, path: string): Promise<ILanguageDataPayload> {
        return new Promise(async (resolve, reject) => {
            const cards: ICardList = {};
            let counters = {};
            let setcodes = {};
            const filePath = path + "/dbs/" + name;
            await loadSetcodes(config.stringsConf).then(res => {
                counters = res.counters;
                setcodes = res.setcodes;
            });
            const transl: ILangTranslations = {
                attributes: config.attributes,
                categories: config.categories,
                ots: config.ots,
                races: config.races,
                setcodes,
                types: config.types
            };
            const proms: Array<Promise<any>> = [];
            if (config.localDBs) {
                proms.push(
                    loadDBs(config.localDBs, filePath, transl).then((cs: ICardList) => {
                        for (const key in cs) {
                            if (cs.hasOwnProperty(key)) {
                                cards[key] = cs[key];
                            }
                        }
                    })
                );
            }
            if (config.remoteDBs) {
                proms.push(
                    downloadDBs(config.remoteDBs, filePath, transl).then((cs: ICardList) => {
                        for (const key in cs) {
                            if (cs.hasOwnProperty(key)) {
                                cards[key] = cs[key];
                            }
                        }
                    })
                );
            }
            Promise.all(proms)
                .then(() => {
                    const entries: IFuseEntry[] = Object.values(cards).map((c: Card) => {
                        const entry: IFuseEntry = {
                            code: c.code,
                            name: fixName(c.name)
                        };
                        return entry;
                    });
                    const fuseList = new fuse(entries, config.fuseOptions);
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
                    resolve(data);
                })
                .catch(e => reject(e));
        });
    }
    public static build(name: string, config: ILangConfig, path: string): Promise<Language> {
        return new Promise((resolve, reject) =>
            Language.prepareData(name, config, path)
                .then(data => resolve(new Language(name, data)))
                .catch(e => reject(e))
        );
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

    public getCardByCode(code: number): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (code in this.cards) {
                resolve(this.cards[code]);
            } else {
                reject(new Error("Could not find card for code " + code + " in Language " + this.name + "!"));
            }
        });
    }

    public getCardByName(name: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            const card: Card | undefined = Object.values(this.cards).find(
                c => c.name.toLowerCase() === name.toLowerCase()
            );
            if (card) {
                resolve(card);
            } else {
                const results = this.fuseList.search<IFuseEntry>(fixName(name));
                if (results.length > 0) {
                    // TODO: results.sort() based on OT?
                    resolve(this.cards[results[0].code]);
                } else {
                    reject(new Error("Could not find card for query " + name + " in Language " + this.name + "!"));
                }
            }
        });
    }
}
