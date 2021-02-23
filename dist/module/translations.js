"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = void 0;
const Translation_1 = require("../class/Translation");
class Translations {
    constructor() {
        this.trans = {};
    }
    update(raw) {
        for (const langName in raw) {
            this.trans[langName] = new Translation_1.Translation(langName, raw[langName]);
        }
    }
    getTrans(lang) {
        return this.trans[lang];
    }
}
exports.translations = new Translations();
//# sourceMappingURL=translations.js.map