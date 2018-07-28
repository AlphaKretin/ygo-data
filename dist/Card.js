"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// reduce to 1-input function for easy mapping
function parseHex(q) {
    return parseInt(q, 16);
}
class Card {
    constructor(data, file, lang) {
        this.code = data.id;
        this.ot = data.ot;
        this.alias = data.alias;
        this.setcode = data.setcode;
        this.type = data.type;
        this.atk = data.atk;
        this.def = data.def;
        this.level = data.level;
        this.race = data.race;
        this.attribute = data.attribute;
        this.category = data.category;
        this.name = data.name;
        this.desc = data.desc;
        this.strings = [
            data.str1,
            data.str2,
            data.str3,
            data.str4,
            data.str5,
            data.str6,
            data.str7,
            data.str8,
            data.str9,
            data.str10,
            data.str11,
            data.str12,
            data.str13,
            data.str14,
            data.str15,
            data.str16
        ];
        this.dbs = file;
        this.lang = lang;
    }
    get otNames() {
        const names = [];
        for (const key in this.lang.ots) {
            if (this.lang.ots.hasOwnProperty(key)) {
                const ot = parseInt(key, 16);
                if ((ot & this.ot) !== 0) {
                    names.push(this.lang.ots[key]);
                }
            }
        }
        return names;
    }
    get setNames() {
        const hex = this.setcode
            .toString(16)
            .padStart(16, "0")
            .match(/.{1,4}/g);
        const codes = hex && hex.map(parseHex);
        const names = [];
        for (const key in this.lang.setcodes) {
            if (this.lang.setcodes.hasOwnProperty(key)) {
                if (codes && codes.includes(parseHex(key))) {
                    names.push(this.lang.setcodes[key]);
                }
            }
        }
        return names;
    }
    get typeNames() {
        const names = [];
        for (const key in this.lang.types) {
            if (this.lang.types.hasOwnProperty(key)) {
                const type = parseInt(key, 16);
                if ((type & this.type) !== 0) {
                    names.push(this.lang.types[key]);
                }
            }
        }
        return names;
    }
    get raceNames() {
        const names = [];
        for (const key in this.lang.races) {
            if (this.lang.races.hasOwnProperty(key)) {
                const race = parseInt(key, 16);
                if ((race & this.race) !== 0) {
                    names.push(this.lang.races[key]);
                }
            }
        }
        return names;
    }
    get attributeNames() {
        const names = [];
        for (const key in this.lang.attributes) {
            if (this.lang.attributes.hasOwnProperty(key)) {
                const att = parseInt(key, 16);
                if ((att & this.attribute) !== 0) {
                    names.push(this.lang.attributes[key]);
                }
            }
        }
        return names;
    }
    get categoryNames() {
        const names = [];
        for (const key in this.lang.categories) {
            if (this.lang.categories.hasOwnProperty(key)) {
                const cat = parseInt(key, 16);
                if ((cat & this.category) !== 0) {
                    names.push(this.lang.categories[key]);
                }
            }
        }
        return names;
    }
    get desc_m() {
        return this.desc; // placeholder
    }
    get desc_p() {
        return this.desc; // placeholder
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map