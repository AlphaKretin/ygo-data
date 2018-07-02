import { Card } from "./Card";
import { Language } from "./Language";

interface ILangList {
    [lang: string]: Language;
}

export class Driver {
    public static prepareLangs(config): Promise<ILangList> {
        return new Promise((resolve, reject) => {
            const langList: ILangList = {};
            Promise.all(config.map(lang => {
                Language.build(lang, config[lang])
                    .then(newLang => langList[lang] = newLang);
            })).then(() => resolve(langList)).catch(e => reject(e));
        });
    }
    public static build(config): Promise<Driver> {
        return new Promise((resolve, reject) => {
            this.prepareLangs(config).then(langList => resolve(new Driver(langList))).catch(e => reject(e));
        });
    }
    public config;
    private langList: { [lang: string]: Language };
    constructor(langList: ILangList) {
        this.langList = langList;
    }

    public getCard(name: string, lang: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (!(lang in this.langList)) {
                reject("Invalid language \"" + lang + "\"!");
            }
            const inInt: number = parseInt(name, 10);
            if (!isNaN(inInt)) {
                this.langList[lang].getCardByCode(inInt).then(card => resolve(card), err => {
                    this.langList[lang].getCardByName(name).then(card => resolve(card), er2 => reject(err + er2));
                });
            } else {
                this.langList[lang].getCardByName(name).then(card => resolve(card), err => reject(err));
            }
        });
    }

    public updateLang(lang: string): Promise<null> {
        return new Promise((resolve, reject) => {
            if (lang in this.langList) {
                Language.build(lang, this.config[lang]).then(newLang => {
                    this.langList[lang] = newLang;
                    resolve();
                }).catch(e => reject(e));
            } else {
                reject("Invalid language " + lang + "!");
            }
        });
    }

    get langs(): string[] {
        return Object.keys(this.langList);
    }
}
