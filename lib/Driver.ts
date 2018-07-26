import { Card } from "./Card";
import { ILangConfig, Language } from "./Language";

interface ILangList {
    [lang: string]: Language;
}

export interface IDriverConfig {
    [lang: string]: ILangConfig;
}

export class Driver {
    public static build(config: IDriverConfig, path: string): Promise<Driver> {
        return new Promise((resolve, reject) => {
            this.prepareLangs(config, path)
                .then(langList => resolve(new Driver(config, langList, path)))
                .catch(e => reject(e));
        });
    }
    private static prepareLangs(config: IDriverConfig, path: string): Promise<ILangList> {
        return new Promise((resolve, reject) => {
            const langList: ILangList = {};
            const proms: Array<Promise<Language>> = Object.keys(config).map((lang: string) =>
                Language.build(lang, config[lang], path).then(newLang => (langList[lang] = newLang))
            );
            Promise.all(proms)
                .then(() => resolve(langList))
                .catch((e: Error) => reject(e));
        });
    }
    public config: IDriverConfig;
    private langList: { [lang: string]: Language };
    private path: string;
    constructor(config: IDriverConfig, langList: ILangList, path: string) {
        this.path = path;
        this.config = config;
        this.langList = langList;
    }

    public getCard(name: string | number, lang: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (!(lang in this.langList)) {
                reject('Invalid language "' + lang + '"!');
            }
            const inInt: number = typeof name === "number" ? name : parseInt(name, 10);
            if (!isNaN(inInt)) {
                this.langList[lang].getCardByCode(inInt).then(
                    card => resolve(card),
                    err => {
                        this.langList[lang]
                            .getCardByName(name.toString())
                            .then(card => resolve(card))
                            .catch(er2 => reject(err + er2));
                    }
                );
            } else {
                this.langList[lang]
                    .getCardByName(name.toString())
                    .then(card => resolve(card))
                    .catch(err => reject(err));
            }
        });
    }

    public updateLang(lang: string): Promise<null> {
        return new Promise((resolve, reject) => {
            if (lang in this.langList) {
                Language.build(lang, this.config[lang], this.path)
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
