"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Language_1 = require("./Language");
class Driver {
    constructor(config, path = ".") {
        this.path = path;
        this.config = config;
        this.pendingLangList = this.prepareLangs(config, path);
    }
    async getCard(name, lang) {
        const langList = await this.pendingLangList;
        if (!(lang in langList)) {
            throw new Error("Invalid language " + lang + "!");
        }
        const inInt = typeof name === "number" ? name : parseInt(name, 10);
        if (!isNaN(inInt)) {
            const card = await langList[lang].getCardByCode(inInt);
            return card;
        }
        else {
            const card = await langList[lang].getCardByName(name.toString());
            return card;
        }
    }
    async updateLang(lang) {
        const langList = await this.pendingLangList;
        if (lang in langList) {
            const newLang = await Language_1.Language.build(lang, this.config[lang], this.path);
            langList[lang] = newLang;
        }
        else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
    get langs() {
        return new Promise(async (resolve) => {
            const langList = await this.pendingLangList;
            resolve(Object.keys(langList));
        });
    }
    async getCardList(lang) {
        const langList = await this.pendingLangList;
        if (lang in langList) {
            return langList[lang].cards;
        }
        else {
            throw new Error("Invalid language " + lang + "!");
        }
    }
    async prepareLangs(config, path) {
        const langList = {};
        const proms = [];
        for (const lang in config) {
            if (config.hasOwnProperty(lang)) {
                const newProm = Language_1.Language.build(lang, config[lang], path).then(newLang => (langList[lang] = newLang));
                proms.push(newProm);
            }
        }
        await Promise.all(proms);
        return langList;
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map