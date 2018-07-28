import { Card } from "./Card";
import { ICardList, ILangConfig, Language } from "./Language";

interface ILangList {
    [lang: string]: Language;
}

export interface IDriverConfig {
    [lang: string]: ILangConfig;
}

export class Driver {
    public static async build(config: IDriverConfig, path = "."): Promise<Driver> {
        const langList = await this.prepareLangs(config, path);
        return new Driver(config, langList, path);
    }
    private static async prepareLangs(config: IDriverConfig, path: string): Promise<ILangList> {
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
    public config: IDriverConfig;
    private langList: ILangList;
    private path: string;
    constructor(config: IDriverConfig, langList: ILangList, path: string) {
        this.path = path;
        this.config = config;
        this.langList = langList;
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
            const newLang = await Language.build(lang, this.config[lang], this.path);
            this.langList[lang] = newLang;
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }

    get langs(): string[] {
        return Object.keys(this.langList);
    }

    public getCardList(lang: string): ICardList {
        if (lang in this.langList) {
            return this.langList[lang].cards;
        } else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
}
