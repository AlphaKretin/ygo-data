"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Language_1 = require("./Language");
class Driver {
    constructor(config, path = ".") {
        this.path = path;
        this.config = config;
        try {
            this.langList = this.prepareLangs(config, path);
        }
        catch (e) {
            throw e;
        }
    }
    async getCard(name, lang) {
        if (!(lang in this.langList)) {
            throw new Error("Invalid language " + lang + "!");
        }
        const inInt = typeof name === "number" ? name : parseInt(name, 10);
        try {
            if (!isNaN(inInt)) {
                const card = await this.langList[lang].getCardByCode(inInt);
                return card;
            }
            else {
                const card = await this.langList[lang].getCardByName(name.toString());
                return card;
            }
        }
        catch (e) {
            throw e;
        }
    }
    async updateLang(lang) {
        if (lang in this.langList) {
            const newLang = new Language_1.Language(lang, this.config[lang], this.path);
            this.langList[lang] = newLang;
        }
        else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
    get langs() {
        return Object.keys(this.langList);
    }
    async getCardList(lang) {
        if (lang in this.langList) {
            try {
                const cards = await this.langList[lang].getCards();
                return cards;
            }
            catch (e) {
                throw e;
            }
        }
        else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
    prepareLangs(config, path) {
        const langList = {};
        for (const lang in config) {
            if (config.hasOwnProperty(lang)) {
                try {
                    langList[lang] = new Language_1.Language(lang, config[lang], path);
                }
                catch (e) {
                    throw e;
                }
            }
        }
        return langList;
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map