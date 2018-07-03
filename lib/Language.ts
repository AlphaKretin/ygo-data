import * as octokit from "@octokit/rest";
import * as fs from "fs";
import * as request from "request";
import * as sqlite from "sqlite";
import { Card, ICardSqlResult } from "./Card";
const GitHub = new octokit();

const reflect = (p: Promise<any>) => p.then(v => ({ v, status: true }), e => ({ e, status: false }));

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

function downloadDB(file: any, name: string): Promise<null> {
    return new Promise((resolve, reject) => {
        const path = "dbs/" + name + "/" + file.name;
        request(file.download_url, (err: Error, _: any, body: any) => {
            if (err) {
                reject(err);
            } else {
                fs.writeFile(path, body, er => {
                    if (er) {
                        reject(er);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

function downloadRepo(repo: octokit.ReposGetContentParams, name: string): Promise<string[]> {
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
                            promises.push(downloadDB(file, name).then(() => filenames.push(file.name)));
                        }
                    }
                }
                Promise.all(promises.map(reflect))
                    .then(results => {
                        results.forEach(result => {
                            if (!result.status) {
                                reject(result);
                            }
                        });
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

function loadSetcodes(path: string): Promise<IStringsConfPayload> {
    return new Promise((resolve, reject) => {
        request(path, (err, _, body) => {
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

function loadDBs(files: string[], path: string, lang: ILangTranslations): Promise<ICardList> {
    return new Promise((resolve, reject) => {
        const cards: { [n: number]: Card } = {};
        const proms = files.map(file =>
            loadDB(path + file).then(dat => {
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
    path: string,
    name: string,
    lang: ILangTranslations
): Promise<ICardList> {
    return new Promise((resolve, reject) => {
        repos.forEach(repo => {
            downloadRepo(repo, name)
                .then(files => {
                    loadDBs(files, path, lang)
                        .then(res => {
                            // delete unused databases
                            fs.readdir("dbs/" + name, (err, r) => {
                                if (err) {
                                    // this failing shouldn't reject the whole promise, it's not crucial
                                    console.error(err);
                                } else {
                                    r.filter(f => !files.includes(f)).forEach(f => {
                                        fs.unlinkSync("dbs/" + name + "/" + f);
                                    });
                                }
                            });
                            resolve(res);
                        })
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
    ots: { [ot: number]: string };
    races: { [race: number]: string };
    types: { [type: number]: string };
    stringsConf: IStringsConfPayload;
    localDBs: string[];
    remoteDBs: octokit.ReposGetContentParams[];
}

interface ICardList {
    [code: number]: Card;
}

export class Language {
    // preparing the data for a language must be done asynchronously, so the intended use is to call this function,
    // then instantiate a Language object with its resolution
    public static prepareData(name: string, config: ILangConfig): Promise<ILanguageDataPayload> {
        return new Promise((resolve, reject) => {
            const data: ILanguageDataPayload = {
                attributes: config.attributes,
                cards: {},
                categories: config.categories,
                counters: {},
                ots: config.ots,
                races: config.races,
                setcodes: {},
                types: config.types
            };
            const path = "dbs/" + name + "/";
            const proms: Array<Promise<any>> = [];
            proms.push(
                loadSetcodes(path + config.stringsConf).then(res => {
                    data.counters = res.counters;
                    data.setcodes = res.setcodes;
                })
            );
            proms.push(
                loadDBs(config.localDBs, path, data).then((cs: ICardList) => {
                    for (const key in cs) {
                        if (cs.hasOwnProperty(key)) {
                            data.cards[key] = cs[key];
                        }
                    }
                })
            );
            proms.push(
                downloadDBs(config.remoteDBs, path, name, data).then((cs: ICardList) => {
                    for (const key in cs) {
                        if (cs.hasOwnProperty(key)) {
                            data.cards[key] = cs[key];
                        }
                    }
                })
            );
            Promise.all(proms)
                .then(() => resolve(data))
                .catch(e => reject(e));
        });
    }
    public static build(name: string, config: ILangConfig): Promise<Language> {
        return new Promise((resolve, reject) =>
            Language.prepareData(name, config)
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
    }

    public getCardByCode(code: number): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (code in this.cards) {
                resolve(this.cards[code]);
            } else {
                reject("Could not find card for code " + code + " in Language " + this.name + "!");
            }
        });
    }

    public getCardByName(name: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            const card: Card | undefined = Object.values(this.cards).find(c => c.name.toLowerCase() === name);
            if (card) {
                resolve(card);
            } else {
                // TODO: fuse stuff
                reject("Could not find card for query " + name + " in Language " + this.name + "!");
            }
        });
    }
}
