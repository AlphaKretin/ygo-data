"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../module/enums");
const strings_1 = require("../module/strings");
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
async function getSetcodeNames(setcode, lang) {
    let tempCode = setcode;
    const codes = [];
    while (tempCode > 0) {
        codes.push(tempCode & 0xffff);
        tempCode = tempCode >> 16;
    }
    const names = [];
    for (const code of codes) {
        const name = await strings_1.strings.getCode(code, lang);
        if (name) {
            names.push(name);
        }
    }
    return names;
}
class CardData {
    constructor(dbData, langs) {
        this.ot = dbData.ot;
        this.alias = dbData.alias;
        this.setcode = dbData.setcode;
        this.type = dbData.type;
        this.atk = dbData.atk;
        this.literalDef = dbData.def;
        this.literalLevel = dbData.level;
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
                    race: getNames(this.race, v => trans.getRace(v, this.isType(enums_1.CardType.TYPE_SKILL))),
                    setcode: getSetcodeNames(this.setcode, lang),
                    type: getNames(this.type, v => trans.getType(v)),
                    typeString: this.generateTypeString(trans)
                };
            }
        }
    }
    get def() {
        if (this.isType(enums_1.CardType.TYPE_LINK)) {
            return undefined;
        }
        else {
            return this.literalDef;
        }
    }
    get level() {
        if (this.isType(enums_1.CardType.TYPE_PENDULUM)) {
            return this.literalLevel & 0xff;
        }
        return this.literalLevel;
    }
    get lscale() {
        if (!this.isType(enums_1.CardType.TYPE_PENDULUM)) {
            return undefined;
        }
        return (this.literalLevel >> 24) & 0xff;
    }
    get rscale() {
        if (!this.isType(enums_1.CardType.TYPE_PENDULUM)) {
            return undefined;
        }
        return (this.literalLevel >> 16) & 0xff;
    }
    get linkMarker() {
        if (!this.isType(enums_1.CardType.TYPE_LINK)) {
            return undefined;
        }
        else {
            const markers = [];
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_BOTTOM_LEFT)) {
                markers.push("↙");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_BOTTOM)) {
                markers.push("⬇");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_BOTTOM_RIGHT)) {
                markers.push("↘");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_LEFT)) {
                markers.push("⬅");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_RIGHT)) {
                markers.push("➡");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_TOP_LEFT)) {
                markers.push("↖");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_TOP)) {
                markers.push("⬆");
            }
            if (this.isLinkMarker(enums_1.CardLinkMarker.LINK_MARKER_TOP_RIGHT)) {
                markers.push("↗");
            }
            return markers;
        }
    }
    isAttribute(att) {
        return (this.attribute & att) === att;
    }
    isCategory(cat) {
        return (this.category & cat) === cat;
    }
    isOT(ot) {
        return (this.ot & ot) === ot;
    }
    isRace(race) {
        return (this.race & race) === race;
    }
    isType(type) {
        return (this.type & type) === type;
    }
    isLinkMarker(mark) {
        if (!this.isType(enums_1.CardType.TYPE_LINK)) {
            return false;
        }
        return (this.literalDef & mark) === mark;
    }
    isSetCode(code) {
        let tempCode = this.setcode;
        const codes = [];
        while (tempCode > 0) {
            codes.push(tempCode & 0xffff);
            tempCode = tempCode >> 16;
        }
        for (const c of codes) {
            // 4th digit is for extensions
            if (code === c || code === (c & 0xfff)) {
                return true;
            }
        }
        return false;
    }
    generateTypeString(trans) {
        // list of types to defer in order they should appear
        const deferred = [enums_1.CardType.TYPE_TUNER, enums_1.CardType.TYPE_NORMAL, enums_1.CardType.TYPE_EFFECT];
        const hoisted = [enums_1.CardType.TYPE_SKILL]; // Skill is enumerated last but needs to come first
        const names = [];
        const defNames = {};
        const hoistNames = {};
        for (const t of hoisted) {
            if (this.isType(t)) {
                const name = trans.getType(t);
                names.push(name);
                hoistNames[t] = name;
            }
        }
        let i = 1;
        while (i <= this.type) {
            if (this.isType(i) && !(i in hoistNames)) {
                const name = trans.getType(i);
                if (deferred.includes(i)) {
                    defNames[i] = name;
                }
                else {
                    names.push(name);
                }
            }
            i = i * 2;
        }
        for (const def of deferred) {
            if (def in defNames) {
                names.push(defNames[def]);
            }
        }
        return names
            .join("/")
            .replace(trans.getType(enums_1.CardType.TYPE_MONSTER), getNames(this.race, v => trans.getRace(v)).join("|"))
            .replace(trans.getType(enums_1.CardType.TYPE_SKILL), trans.getType(enums_1.CardType.TYPE_SKILL) + "/" + getNames(this.race, v => trans.getRace(v, true)).join("|"));
    }
}
exports.CardData = CardData;
//# sourceMappingURL=CardData.js.map