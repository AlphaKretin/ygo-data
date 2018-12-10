"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translations_1 = require("../module/translations");
function getNames(val, func) {
    let i = 1;
    const names = [];
    while (i <= val) {
        if ((i & val) === i) {
            names.push(func(i));
        }
        i = i * 2;
    }
    return names;
}
function getSetcodeNames(setcode, lang) {
    return ["unimplemented"]; // TODO
}
class CardData {
    constructor(dbData, langs) {
        this.ot = dbData.ot;
        this.alias = dbData.alias;
        this.setcode = dbData.setcode;
        this.type = dbData.type;
        this.atk = dbData.atk;
        this.def = dbData.def;
        this.level = dbData.level;
        this.race = dbData.race;
        this.attribute = dbData.attribute;
        this.category = dbData.category;
        this.names = {};
        for (const lang of langs) {
            const trans = translations_1.translations.getTrans(lang);
            if (trans) {
                this.names[lang] = {
                    attribute: getNames(this.attribute, v => trans.getAttribute(v)),
                    category: getNames(this.category, v => trans.getCategory(v)),
                    ot: getNames(this.ot, v => trans.getOT(v)),
                    race: getNames(this.race, v => trans.getRace(v)),
                    setcode: getSetcodeNames(this.setcode, lang),
                    type: getNames(this.type, v => trans.getType(v))
                };
            }
        }
    }
}
exports.CardData = CardData;
//# sourceMappingURL=CardData.js.map