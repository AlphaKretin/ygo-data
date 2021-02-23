"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strings = exports.Filter = exports.enums = exports.translations = exports.Card = exports.YgoData = void 0;
const fuse_js_1 = __importDefault(require("fuse.js"));
const Card_1 = require("./class/Card");
Object.defineProperty(exports, "Card", { enumerable: true, get: function () { return Card_1.Card; } });
const Filter_1 = require("./class/Filter");
Object.defineProperty(exports, "Filter", { enumerable: true, get: function () { return Filter_1.Filter; } });
const banlist_1 = require("./module/banlist");
const cards_1 = require("./module/cards");
const strings_1 = require("./module/strings");
Object.defineProperty(exports, "strings", { enumerable: true, get: function () { return strings_1.strings; } });
const enums_1 = require("./module/enums");
const filterNames_1 = require("./module/filterNames");
const images_1 = require("./module/images");
const translations_1 = require("./module/translations");
Object.defineProperty(exports, "translations", { enumerable: true, get: function () { return translations_1.translations; } });
function needsConversion(transOpts) {
    const key = Object.keys(transOpts)[0];
    return typeof Object.keys(transOpts[key].type)[0] === "string";
}
class YgoData {
    constructor(cardOpts, transOpts, miscOpts, savePath, gitAuth) {
        // TODO: Add some configurability here
        this.fuseOpts = {
            distance: 100,
            includeScore: true,
            keys: ["name"],
            location: 0,
            minMatchCharLength: 1,
            shouldSort: true,
            threshold: 0.25,
        };
        this.cardOpts = cardOpts;
        if (needsConversion(transOpts)) {
            this.transOpts = {};
            for (const lang in transOpts) {
                const type = {};
                for (const hex in transOpts[lang].type) {
                    type[parseInt(hex, 16)] = transOpts[lang].type[hex];
                }
                const race = {};
                for (const hex in transOpts[lang].race) {
                    race[parseInt(hex, 16)] = transOpts[lang].race[hex];
                }
                const skillRace = {};
                for (const hex in transOpts[lang].skillRace) {
                    skillRace[parseInt(hex, 16)] = transOpts[lang].skillRace[hex];
                }
                const attribute = {};
                for (const hex in transOpts[lang].attribute) {
                    attribute[parseInt(hex, 16)] = transOpts[lang].attribute[hex];
                }
                const ot = {};
                for (const hex in transOpts[lang].ot) {
                    ot[parseInt(hex, 16)] = transOpts[lang].ot[hex];
                }
                const category = {};
                for (const hex in transOpts[lang].category) {
                    category[parseInt(hex, 16)] = transOpts[lang].category[hex];
                }
                this.transOpts[lang] = {
                    type: type,
                    race: race,
                    skillRace: skillRace,
                    attribute: attribute,
                    ot: ot,
                    category: category
                };
            }
        }
        else {
            this.transOpts = transOpts;
        }
        this.miscOpts = miscOpts;
        this.savePath = savePath;
        if (gitAuth) {
            this.gitAuth = gitAuth;
        }
        this.update();
    }
    async update() {
        // any allowed here because array of different promises
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proms = [];
        proms.push(cards_1.cards.update(this.cardOpts, this.savePath, this.gitAuth));
        proms.push(banlist_1.banlist.update(this.miscOpts.banlist, this.gitAuth));
        proms.push(strings_1.strings.update(this.miscOpts.stringOpts, this.savePath));
        translations_1.translations.update(this.transOpts);
        filterNames_1.updateFilterNames(this.miscOpts.filterNames);
        images_1.images.update(this.miscOpts.imageLink, this.miscOpts.imageExt);
        this.fuses = {};
        this.internalLangs = Object.keys(this.cardOpts.langs);
        this.shortcuts = this.miscOpts.shortcuts;
        await Promise.all(proms);
    }
    get langs() {
        return this.internalLangs;
    }
    async getCard(id, lang, allowAnime = true, allowCustom = true) {
        if (typeof id === "number") {
            const card = await cards_1.cards.getCard(id);
            return card;
        }
        else {
            const idNum = parseInt(id, 10);
            if (isNaN(idNum) && lang) {
                const simpList = await cards_1.cards.getSimpleList(lang);
                let term = id.trim().toLowerCase();
                let resultCard;
                for (const code in simpList) {
                    const entry = simpList[code];
                    if (entry.name.toLowerCase() === term && (allowAnime || !entry.anime) && (allowCustom || !entry.custom)) {
                        const c = await cards_1.cards.getCard(code);
                        if (c) {
                            resultCard = c;
                            break;
                        }
                    }
                }
                if (this.shortcuts && this.shortcuts[lang]) {
                    const terms = term.split(/\s/);
                    for (let i = 0; i < terms.length; i++) {
                        if (terms[i] in this.shortcuts[lang]) {
                            terms[i] = this.shortcuts[lang][terms[i]].toLowerCase().trim();
                        }
                    }
                    term = terms.join(" ");
                    for (const code in simpList) {
                        const entry = simpList[code];
                        if (entry.name.toLowerCase() === term && (allowAnime || !entry.anime) && (allowCustom || !entry.custom)) {
                            const c = await cards_1.cards.getCard(code);
                            if (c) {
                                resultCard = c;
                                break;
                            }
                        }
                    }
                }
                if (resultCard === undefined) {
                    const fuse = await this.getFuse(lang);
                    const result = fuse
                        .search(term)
                        .filter(r => (allowAnime || !r.item.anime) && (allowCustom || !r.item.custom));
                    if (result.length < 1) {
                        return undefined;
                    }
                    resultCard = await this.getCard(result[0].item.id);
                }
                if (resultCard !== undefined && resultCard.data.alias > 0) {
                    const newCard = await this.getCard(resultCard.data.alias);
                    let check = newCard && newCard.data.alias === resultCard.id && newCard.data.ot === resultCard.data.ot;
                    if (newCard && newCard.text[lang] && resultCard.text[lang].name !== newCard.text[lang].name) {
                        check = false;
                    }
                    if (check) {
                        resultCard = newCard;
                    }
                }
                return resultCard;
            }
            const card = await cards_1.cards.getCard(id);
            return card;
        }
    }
    async getCardList() {
        return await cards_1.cards.getRawCardList();
    }
    async getFuseList(query, lang) {
        const fuse = await this.getFuse(lang);
        return fuse.search(query).map(r => r.item);
    }
    async getFuse(lang) {
        if (!(lang in this.fuses)) {
            const list = await cards_1.cards.getSimpleList(lang);
            this.fuses[lang] = new fuse_js_1.default(Object.values(list), this.fuseOpts);
        }
        return this.fuses[lang];
    }
}
exports.YgoData = YgoData;
const enumMap = {
    attribute: enums_1.CardAttribute,
    category: enums_1.CardCategory,
    marker: enums_1.CardLinkMarker,
    ot: enums_1.CardOT,
    race: enums_1.CardRace,
    skillRace: enums_1.CardSkillRace,
    type: enums_1.CardType
};
exports.enums = enumMap;
//# sourceMappingURL=ygo-data.js.map