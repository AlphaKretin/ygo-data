import { Card } from "./Card";
import { CardScript } from "./CardScript";
import { ILangConfig, Language } from "./Language";

interface ILangList {
    [lang: string]: Language;
}

interface IDriverConfig {
    [lang: string]: ILangConfig;
}

export class Driver {
    public static prepareLangs(config: IDriverConfig): Promise<ILangList> {
        return new Promise((resolve, reject) => {
            const langList: ILangList = {};
            const proms: Array<Promise<Language>> = Object.keys(config).map((lang: string) =>
                Language.build(lang, config[lang]).then(newLang => (langList[lang] = newLang))
            );
            Promise.all(proms)
                .then(() => resolve(langList))
                .catch((e: Error) => reject(e));
        });
    }
    public static build(config: IDriverConfig): Promise<Driver> {
        return new Promise((resolve, reject) => {
            this.prepareLangs(config)
                .then(langList => resolve(new Driver(langList)))
                .catch(e => reject(e));
        });
    }
    public config: IDriverConfig;
    private langList: { [lang: string]: Language };
    private scripts: { [code: number]: CardScript };
    constructor(langList: ILangList) {
        this.langList = langList;
        this.scripts = {
            0: new CardScript(0)
        };
        this.config = {
            en: {
                attributes: {
                    1: "Light"
                },
                categories: {
                    1: "Destroy Deck"
                },
                localDBs: ["a"],
                ots: {
                    1: "OCG"
                },
                races: {
                    1: "Dragon"
                },
                remoteDBs: [
                    {
                        owner: "a",
                        path: "a",
                        repo: "a"
                    }
                ],
                stringsConf: {
                    counters: {
                        1: "Spell Counter"
                    },
                    setcodes: {
                        1: "Fur Hire"
                    }
                },
                types: {
                    1: "Monster"
                }
            }
        };
    }

    public getCard(name: string, lang: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (!(lang in this.langList)) {
                reject('Invalid language "' + lang + '"!');
            }
            const inInt: number = parseInt(name, 10);
            if (!isNaN(inInt)) {
                this.langList[lang].getCardByCode(inInt).then(
                    card => resolve(card),
                    err => {
                        this.langList[lang].getCardByName(name).then(card => resolve(card), er2 => reject(err + er2));
                    }
                );
            } else {
                this.langList[lang].getCardByName(name).then(card => resolve(card), err => reject(err));
            }
        });
    }

    public updateLang(lang: string): Promise<null> {
        return new Promise((resolve, reject) => {
            if (lang in this.langList) {
                Language.build(lang, this.config[lang])
                    .then(newLang => {
                        this.langList[lang] = newLang;
                        resolve();
                    })
                    .catch(e => reject(e));
            } else {
                reject("Invalid language " + lang + "!");
            }
        });
    }

    get langs(): string[] {
        return Object.keys(this.langList);
    }
}