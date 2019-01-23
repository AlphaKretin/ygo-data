import * as octokit from "@octokit/rest";
import * as mkdirp from "mkdirp";
import * as fs from "mz/fs";
import * as request from "request-promise-native";
import * as sqlite from "sqlite";
import * as util from "util";
import { Card, ICardRaw } from "../class/Card";
import { ICardDataRaw } from "../class/CardData";
import { ICardTextRaw } from "../class/CardText";

export interface ICardList {
    [id: number]: Card;
}

export interface ISimpleList {
    [id: number]: ISimpleCard;
}

interface ICardListOpts {
    langs: {
        [lang: string]: {
            stringsConf: string;
            remoteDBs?: octokit.ReposGetContentsParams[];
        };
    };
    gitAuth?: octokit.Auth;
}

export interface ISimpleCard {
    id: number;
    name: string;
}

class CardList {
    private cards?: Promise<ICardList>;

    public async getCard(id: number | string): Promise<Card | undefined> {
        if (!this.cards) {
            throw new Error("Card list not loaded!");
        }
        if (typeof id === "string") {
            id = parseInt(id, 10);
        }
        const list = await this.cards;
        return list[id];
    }

    public update(opts: ICardListOpts, savePath: string) {
        return new Promise((resolve, reject) => {
            this.cards = this.load(opts, savePath);
            this.cards.then(resolve);
            this.cards.catch(reject);
        });
    }

    public async getSimpleList(lang: string): Promise<ISimpleList> {
        if (!this.cards) {
            throw new Error("Card list not loaded!");
        }
        const list = await this.cards;
        const map: ISimpleList = {};
        for (const key in list) {
            if (list.hasOwnProperty(key)) {
                const card = list[key];
                if (lang in card.text) {
                    map[card.id] = { id: card.id, name: card.text[lang].name };
                }
            }
        }
        return map;
    }

    public async getRawCardList(): Promise<ICardList> {
        if (!this.cards) {
            throw new Error("Card list not loaded!");
        }
        return await this.cards;
    }

    private async downloadSingleDB(file: any, filePath: string): Promise<void> {
        const fullPath = filePath + file.name;
        const result = await request({
            encoding: null,
            url: file.download_url
        });
        await fs.writeFile(fullPath, result);
    }

    private async downloadDBs(opts: ICardListOpts, savePath: string): Promise<void> {
        const github = new octokit();
        if (opts.gitAuth) {
            github.authenticate(opts.gitAuth);
        }
        const proms: Array<Promise<void>> = [];
        for (const langName in opts.langs) {
            if (opts.langs.hasOwnProperty(langName)) {
                const filePath = savePath + "/" + langName + "/";
                await util.promisify(mkdirp)(filePath);
                const lang = opts.langs[langName];
                if (lang.remoteDBs) {
                    for (const repo of lang.remoteDBs) {
                        const contents = await github.repos.getContents(repo);
                        for (const file of contents.data) {
                            if (file.name.endsWith(".cdb")) {
                                proms.push(this.downloadSingleDB(file, filePath));
                            }
                        }
                    }
                }
            }
        }
        await Promise.all(proms);
    }

    private async loadDBs(opts: ICardListOpts, savePath: string): Promise<{ [id: number]: ICardRaw }> {
        const raw: { [id: number]: ICardRaw } = {};
        for (const langName in opts.langs) {
            if (opts.langs.hasOwnProperty(langName)) {
                const dir = savePath + "/" + langName + "/";
                const dbs = await fs.readdir(dir);
                for (const dbName of dbs) {
                    if (dbName.endsWith(".cdb")) {
                        const db = await sqlite.open(dir + dbName);
                        const result = await db.all("select * from datas,texts where datas.id=texts.id");
                        for (const card of result) {
                            const data: ICardDataRaw = {
                                alias: card.alias,
                                atk: card.atk,
                                attribute: card.attribute,
                                category: card.category,
                                def: card.def,
                                level: card.level,
                                ot: card.ot,
                                race: card.race,
                                setcode: card.setcode,
                                type: card.type
                            };
                            const text: ICardTextRaw = {
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
                                raw[card.id].text[langName] = text;
                                raw[card.id].dbs.push(langName + "/" + dbName);
                            } else {
                                const cardRaw: ICardRaw = {
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
        }
        return raw;
    }

    private async load(opts: ICardListOpts, savePath: string): Promise<{ [id: number]: Card }> {
        await this.downloadDBs(opts, savePath);
        const rawData = await this.loadDBs(opts, savePath);
        const list: { [id: number]: Card } = {};
        for (const id in rawData) {
            if (rawData.hasOwnProperty(id)) {
                list[id] = new Card(rawData[id]);
            }
        }
        return list;
    }
}

export const cards: CardList = new CardList();
