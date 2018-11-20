"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import jimp = require("jimp");
const request = require("request-promise-native");
// reduce to 1-input function for easy mapping
function parseHex(q) {
    return parseInt(q, 16);
}
class Card {
    constructor(data, file, lang, mainConf) {
        this.unofficial = true;
        this.code = data.id;
        this.ot = data.ot;
        // 4+ is anime and derivatives, except custom - unofficial to OCG, but official to Percy
        if (this.ot < 4 || this.ot >= 32) {
            this.unofficial = false;
        }
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
        this.imageLink = mainConf.imageLink + this.code + "." + mainConf.imageExt;
    }
    get otNames() {
        const names = [];
        for (const key in this.lang.ots) {
            if (this.lang.ots.hasOwnProperty(key)) {
                const ot = parseHex(key);
                if ((ot & this.ot) !== 0) {
                    names.push(this.lang.ots[key]);
                }
            }
        }
        return names;
    }
    get status() {
        const names = this.otNames;
        const newNames = [];
        for (const name of names) {
            if (name in this.lang.banlist) {
                const stat = this.code in this.lang.banlist[name] ? this.lang.banlist[name][this.code] : 3;
                newNames.push(name + ": " + stat);
            }
            else if (this.unofficial) {
                const stat = this.code in this.lang.banlist.Anime ? this.lang.banlist.Anime[this.code] : 3;
                newNames.push(name + ": " + stat);
            }
            else {
                newNames.push(name);
            }
        }
        return newNames.join("/");
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
                const type = parseHex(key);
                if ((type & this.type) !== 0) {
                    names.push(this.lang.types[key]);
                }
            }
        }
        return names;
    }
    get typeString() {
        // TODO: Add sorting e.g. Effect last
        const types = this.typeNames;
        const monster = this.lang.types["0x1"];
        const index = types.indexOf(monster);
        if (index > -1) {
            types[index] = this.raceNames.join("|");
        }
        return types.join("/");
    }
    get raceNames() {
        const names = [];
        for (const key in this.lang.races) {
            if (this.lang.races.hasOwnProperty(key)) {
                const race = parseHex(key);
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
                const att = parseHex(key);
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
                const cat = parseHex(key);
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
    get image() {
        return new Promise(async (resolve) => {
            try {
                const image = await request(this.imageLink, { encoding: null });
                resolve(image);
            }
            catch (e) {
                resolve(undefined);
            }
        });
    }
    get codes() {
        return new Promise(async (resolve, reject) => {
            if (!this.host) {
                reject("Host language was not defined for card " + this.code + ", something went wrong internally!");
            }
            const baseCode = this.alias && this.alias > 0 ? this.alias : this.code;
            const outCodes = [baseCode];
            const cards = await this.host.getCards();
            if (!(baseCode in cards)) {
                reject("Card " + this.code + "'s alias, " + baseCode + ", does not exist!");
            }
            for (const code in cards) {
                if (cards.hasOwnProperty(code)) {
                    const card = cards[code];
                    if (card.alias === baseCode && cards[baseCode].ot === card.ot) {
                        outCodes.push(card.code);
                    }
                }
            }
            resolve(outCodes);
        });
    }
    set owner(lang) {
        this.host = lang;
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map