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
    private langList: ILangList;
    private path: string;
    constructor(config: IDriverConfig, path = ".") {
        this.path = path;
        this.config = config;
        this.langList = this.prepareLangs(config, path);
    }

    public async getCard(name: string | number, lang: string): Promise<Card> {
        if (!(lang in this.langList)) {
            throw new Error("Invalid language " + lang + "!");
        }
        const inInt: number = typeof name === "number" ? name : parseInt(name, 10);
        if (!isNaN(inInt)) {
            const card = await this.langList[lang].getCardByCode(inInt);
            return card;
        } else {
            const card = await this.langList[lang].getCardByName(name.toString());
            return card;
        }
    }

    public async updateLang(lang: string): Promise<void> {
        if (lang in this.langList) {
            const newLang = new Language(lang, this.config[lang], this.path);
            this.langList[lang] = newLang;
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }

    get langs(): string[] {
        return Object.keys(this.langList);
    }

    public async getCardList(lang: string): Promise<ICardList> {
        if (lang in this.langList) {
            const cards = await this.langList[lang].getCards();
            return cards;
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }

    private prepareLangs(config: IDriverConfig, path: string): ILangList {
        const langList: ILangList = {};
        for (const lang in config) {
            if (config.hasOwnProperty(lang)) {
                langList[lang] = new Language(lang, config[lang], path);
            }
        }
        return langList;
    }
}
