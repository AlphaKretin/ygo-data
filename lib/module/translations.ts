import { ITranslationRaw, Translation } from "../class/Translation";

interface ITranslationsRaw {
    [lang: string]: ITranslationRaw;
}

class Translations {
    private trans: { [lang: string]: Translation };
    constructor() {
        this.trans = {};
    }

    public update(raw: ITranslationsRaw) {
        for (const langName in raw) {
            if (raw.hasOwnProperty(langName)) {
                this.trans[langName] = new Translation(langName, raw[langName]);
            }
        }
    }

    public getTrans(lang: string) {
        return this.trans[lang];
    }
}

export const translations = new Translations();
