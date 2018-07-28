"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Language_1 = require("./Language");
class Driver {
    static build(config, path = ".") {
        return new Promise((resolve, reject) => {
            this.prepareLangs(config, path)
                .then(langList => resolve(new Driver(config, langList, path)))
                .catch(e => reject(e));
        });
    }
    static prepareLangs(config, path) {
        return new Promise((resolve, reject) => {
            const langList = {};
            const proms = Object.keys(config).map((lang) => Language_1.Language.build(lang, config[lang], path).then(newLang => (langList[lang] = newLang)));
            Promise.all(proms)
                .then(() => resolve(langList))
                .catch((e) => reject(e));
        });
    }
    constructor(config, langList, path) {
        this.path = path;
        this.config = config;
        this.langList = langList;
    }
    getCard(name, lang) {
        return new Promise((resolve, reject) => {
            if (!(lang in this.langList)) {
                reject(new Error("Invalid language " + lang + "!"));
            }
            const inInt = typeof name === "number" ? name : parseInt(name, 10);
            if (!isNaN(inInt)) {
                this.langList[lang].getCardByCode(inInt).then(card => resolve(card), err => {
                    this.langList[lang]
                        .getCardByName(name.toString())
                        .then(card => resolve(card))
                        .catch(er2 => reject(err + er2));
                });
            }
            else {
                this.langList[lang]
                    .getCardByName(name.toString())
                    .then(card => resolve(card))
                    .catch(err => reject(err));
            }
        });
    }
    updateLang(lang) {
        return new Promise((resolve, reject) => {
            if (lang in this.langList) {
                Language_1.Language.build(lang, this.config[lang], this.path)
                    .then(newLang => {
                    this.langList[lang] = newLang;
                    resolve();
                })
                    .catch(e => reject(e));
            }
            else {
                reject(new Error("Invalid language " + lang + "!"));
            }
        });
    }
    get langs() {
        return Object.keys(this.langList);
    }
    getCardList(lang) {
        return new Promise((resolve, reject) => {
            if (lang in this.langList) {
                resolve(this.langList[lang].cards);
            }
            else {
                reject(new Error("Invalid language " + lang + "!"));
            }
        });
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map