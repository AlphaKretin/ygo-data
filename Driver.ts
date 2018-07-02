import { Card } from "./Card";
import { Language } from "./Language";

export class Driver {
    private langList: { [lang: string]: Language };
    constructor(config) {
        this.langList = {};
        config.forEach(lang => {
            this.langList[lang] = new Language(lang, config[lang]);
        });
    }

    public getCard(name: string, lang: string): Promise<Card> {
        return new Promise((resolve, reject) => {
            if (!(lang in this.langList)) {
                reject("Invalid language \"${lang}\"!");
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

    get langs(): string[] {
        return Object.keys(this.langList);
    }
}
