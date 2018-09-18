import { Card } from "./Card";
import { ICardList, ILangConfig, Language } from "./Language";

interface ILangList {
    [lang: string]: Language;
}

export interface IDriverConfig {
    banlist: string;
    imageLink: string;
    imageExt: string;
    langs: {
        [lang: string]: ILangConfig;
    };
}

export class Driver {
    public config: IDriverConfig;
    private langList: ILangList;
    private path: string;
    constructor(config: IDriverConfig, path = ".") {
        this.path = path;
        this.config = config;
        try {
            this.langList = this.prepareLangs(config, path);
        } catch (e) {
            throw e;
        }
    }

    public async getCard(name: string | number, lang: string): Promise<Card | undefined> {
        if (!(lang in this.langList)) {
            throw new Error("Invalid language " + lang + "!");
        }
        const inInt: number = typeof name === "number" ? name : parseInt(name, 10);
        try {
            if (!isNaN(inInt)) {
                const card = await this.langList[lang].getCardByCode(inInt);
                return card;
            } else {
                const card = await this.langList[lang].getCardByName(name.toString());
                return card;
            }
        } catch (e) {
            throw e;
        }
    }

    public async updateLang(lang: string): Promise<void> {
        if (lang in this.langList) {
            const newLang = new Language(lang, this.config.langs[lang], this.path, this.config);
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
            try {
                const cards = await this.langList[lang].getCards();
                return cards;
            } catch (e) {
                throw e;
            }
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }

    private prepareLangs(config: IDriverConfig, path: string): ILangList {
        const langList: ILangList = {};
        for (const lang in config.langs) {
            if (config.langs.hasOwnProperty(lang)) {
                try {
                    langList[lang] = new Language(lang, config.langs[lang], path, config);
                } catch (e) {
                    throw e;
                }
            }
        }
        return langList;
    }
}
