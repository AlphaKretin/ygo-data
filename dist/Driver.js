"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CardScript_1 = require("./CardScript");
const Language_1 = require("./Language");
class Driver {
    static build(config) {
        return new Promise((resolve, reject) => {
            this.prepareLangs(config)
                .then(langList => resolve(new Driver(config, langList)))
                .catch(e => reject(e));
        });
    }
    static prepareLangs(config) {
        return new Promise((resolve, reject) => {
            const langList = {};
            const proms = Object.keys(config).map((lang) => Language_1.Language.build(lang, config[lang]).then(newLang => (langList[lang] = newLang)));
            Promise.all(proms)
                .then(() => resolve(langList))
                .catch((e) => reject(e));
        });
    }
    constructor(config, langList) {
        this.config = config;
        this.langList = langList;
        this.scripts = {
            0: new CardScript_1.CardScript(0)
        };
    }
    getCard(name, lang) {
        return new Promise((resolve, reject) => {
            if (!(lang in this.langList)) {
                reject('Invalid language "' + lang + '"!');
            }
            const inInt = typeof name === "number" ? name : parseInt(name, 10);
            if (!isNaN(inInt)) {
                this.langList[lang].getCardByCode(inInt).then(card => resolve(card), err => {
                    this.langList[lang]
                        .getCardByName(name.toString())
                        .then(card => resolve(card), er2 => reject(err + er2));
                });
            }
            else {
                this.langList[lang].getCardByName(name.toString()).then(card => resolve(card), err => reject(err));
            }
        });
    }
    updateLang(lang) {
        return new Promise((resolve, reject) => {
            if (lang in this.langList) {
                Language_1.Language.build(lang, this.config[lang])
                    .then(newLang => {
                    this.langList[lang] = newLang;
                    resolve();
                })
                    .catch(e => reject(e));
            }
            else {
                reject("Invalid language " + lang + "!");
            }
        });
    }
    get langs() {
        return Object.keys(this.langList);
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map