"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../module/enums");
const setcodes_1 = require("../module/setcodes");
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
        const name = await setcodes_1.setcodes.getCode(code, lang);
        if (name) {
            names.push(name);
        }
    }
    return names;
}
class CardData {
    static generateTypeString(type, race, trans) {
        // list of types to defer in order they should appear
        const deferred = [enums_1.CardType.TYPE_TUNER, enums_1.CardType.TYPE_NORMAL, enums_1.CardType.TYPE_EFFECT];
        let i = 1;
        const names = [];
        const defNames = {};
        while (i <= type) {
            if ((i & type) === i) {
                const name = trans.getType(i);
                if (deferred.indexOf(i) > -1) {
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
            .replace(trans.getType(enums_1.CardType.TYPE_MONSTER), getNames(race, v => trans.getRace(v)).join("|"));
    }
    constructor(dbData, langs) {
        this.ot = dbData.ot;
        this.alias = dbData.alias;
        this.setcode = dbData.setcode;
        this.type = dbData.type;
        this.atk = dbData.atk;
        this.literalDef = dbData.def;
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
                    type: getNames(this.type, v => trans.getType(v)),
                    typeString: CardData.generateTypeString(this.type, this.race, trans)
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
}
exports.CardData = CardData;
//# sourceMappingURL=CardData.js.map