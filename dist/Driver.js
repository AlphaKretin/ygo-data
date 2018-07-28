"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Language_1 = require("./Language");
class Driver {
    static async build(config, path = ".") {
        const langList = await this.prepareLangs(config, path);
        return new Driver(config, langList, path);
    }
    static async prepareLangs(config, path) {
        const langList = {};
        for (const lang in config) {
            if (config.hasOwnProperty(lang)) {
                const newLang = await Language_1.Language.build(lang, config[lang], path);
                langList[lang] = newLang;
            }
        }
        return langList;
    }
    constructor(config, langList, path) {
        this.path = path;
        this.config = config;
        this.langList = langList;
    }
    async getCard(name, lang) {
        if (!(lang in this.langList)) {
            throw new Error("Invalid language " + lang + "!");
        }
        const inInt = typeof name === "number" ? name : parseInt(name, 10);
        if (!isNaN(inInt)) {
            const card = await this.langList[lang].getCardByCode(inInt);
            return card;
        }
        else {
            const card = await this.langList[lang].getCardByName(name.toString());
            return card;
        }
    }
    async updateLang(lang) {
        if (lang in this.langList) {
            const newLang = await Language_1.Language.build(lang, this.config[lang], this.path);
            this.langList[lang] = newLang;
        }
        else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
    get langs() {
        return Object.keys(this.langList);
    }
    getCardList(lang) {
        if (lang in this.langList) {
            return this.langList[lang].cards;
        }
        else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map