import { Language } from "./Language";
import { Card } from "./Card";

export class Driver {
    _langs: Object;
    constructor(config) {
        this._langs = {};
        config.forEach(lang => {
            this._langs[lang] = new Language(lang, config[lang]);                
        });
    }

    getCard(name: string, lang: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (!(lang in this._langs)) {
                reject("Invalid language \"${lang}\"!");
            }
            let inInt: number = parseInt(name);
            if (!isNaN(inInt)) {
                this._langs[lang].getCardByCode(inInt).then(card => resolve(card), err => {
                    this._langs[lang].getCardByName(name).then(card => resolve(card), er2 => reject(err + er2));
                });
            } else {
                this._langs[lang].getCardByName(name).then(card => resolve(card), err => reject(err))
            }
        });
    }

    get langs(): Array<string> {
        return Object.keys(this.langs);
    }
}