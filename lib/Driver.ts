import { Card } from "./Card";
import { ICardList, ILangConfig, Language } from "./Language";

interface ILangList {
    [lang: string]: Language;
}

export interface IDriverConfig {
    [lang: string]: ILangConfig;
}

export class Driver {
    public config: IDriverConfig;
    private pendingLangList: Promise<ILangList>;
    private path: string;
    constructor(config: IDriverConfig, path = ".") {
        this.path = path;
        this.config = config;
        this.pendingLangList = this.prepareLangs(config, path);
    }

    public async getCard(name: string | number, lang: string): Promise<Card> {
        const langList = await this.pendingLangList;
        if (!(lang in langList)) {
            throw new Error("Invalid language " + lang + "!");
        }
        const inInt: number = typeof name === "number" ? name : parseInt(name, 10);
        if (!isNaN(inInt)) {
            const card = await langList[lang].getCardByCode(inInt);
            return card;
        } else {
            const card = await langList[lang].getCardByName(name.toString());
            return card;
        }
    }

    public async updateLang(lang: string): Promise<void> {
        const langList = await this.pendingLangList;
        if (lang in langList) {
            const newLang = await Language.build(lang, this.config[lang], this.path);
            langList[lang] = newLang;
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }

    get langs(): Promise<string[]> {
        return new Promise(async resolve => {
            const langList = await this.pendingLangList;
            resolve(Object.keys(langList));
        });
    }

    public async getCardList(lang: string): Promise<ICardList> {
        const langList = await this.pendingLangList;
        if (lang in langList) {
            return langList[lang].cards;
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }

    private async prepareLangs(config: IDriverConfig, path: string): Promise<ILangList> {
        const langList: ILangList = {};
        const proms: Array<Promise<Language>> = [];
        for (const lang in config) {
            if (config.hasOwnProperty(lang)) {
                const newProm = Language.build(lang, config[lang], path).then(newLang => (langList[lang] = newLang));
                proms.push(newProm);
            }
        }
        await Promise.all(proms);
        return langList;
    }
}
