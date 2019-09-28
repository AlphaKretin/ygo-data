"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fuse = require("fuse.js");
const fs = require("mz/fs");
const Card_1 = require("./class/Card");
exports.Card = Card_1.Card;
const Filter_1 = require("./class/Filter");
exports.Filter = Filter_1.Filter;
const banlist_1 = require("./module/banlist");
const cards_1 = require("./module/cards");
const counters_1 = require("./module/counters");
exports.counters = counters_1.counters;
const enums_1 = require("./module/enums");
const filterNames_1 = require("./module/filterNames");
const images_1 = require("./module/images");
const setcodes_1 = require("./module/setcodes");
exports.setcodes = setcodes_1.setcodes;
const translations_1 = require("./module/translations");
exports.translations = translations_1.translations;
class YgoData {
    constructor(configPath, savePath) {
        // TODO: Add some configurability here
        this.fuseOpts = {
            distance: 100,
            includeScore: true,
            keys: ["name"],
            location: 0,
            maxPatternLength: 52,
            minMatchCharLength: 1,
            shouldSort: true,
            threshold: 0.25,
            tokenize: true
        };
        this.config = JSON.parse(fs.readFileSync(configPath, "utf8"), (key, value) => {
            // if object with hex keys
            if (typeof value === "object" && Object.keys(value).length > 0 && Object.keys(value)[0].startsWith("0x")) {
                const newObj = {};
                for (const k in value) {
                    if (value.hasOwnProperty(k)) {
                        newObj[parseInt(k, 16)] = value[k];
                    }
                }
                return newObj;
            }
            return value;
        });
        this.savePath = savePath;
        this.update();
    }
    async update() {
        const proms = [];
        proms.push(cards_1.cards.update(this.config.cardOpts, this.savePath));
        proms.push(banlist_1.banlist.update(this.config.banlist));
        proms.push(counters_1.counters.update(this.config.stringOpts));
        proms.push(setcodes_1.setcodes.update(this.config.stringOpts));
        translations_1.translations.update(this.config.transOpts);
        filterNames_1.updateFilterNames(this.config.filterNames);
        images_1.images.update(this.config.imageLink, this.config.imageExt);
        this.fuses = {};
        this.internalLangs = Object.keys(this.config.cardOpts.langs);
        this.shortcuts = this.config.shortcuts;
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
                    if (simpList.hasOwnProperty(code)) {
                        const entry = simpList[code];
                        if (entry.name.toLowerCase() === term &&
                            (allowAnime || !entry.anime) &&
                            (allowCustom || !entry.custom)) {
                            const c = await cards_1.cards.getCard(code);
                            if (c) {
                                resultCard = c;
                                break;
                            }
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
                        if (simpList.hasOwnProperty(code)) {
                            const entry = simpList[code];
                            if (entry.name.toLowerCase() === term &&
                                (allowAnime || !entry.anime) &&
                                (allowCustom || !entry.custom)) {
                                const c = await cards_1.cards.getCard(code);
                                if (c) {
                                    resultCard = c;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (resultCard === undefined) {
                    const fuse = await this.getFuse(lang);
                    const result = fuse
                        .search(term)
                        // @ts-ignore
                        .filter(r => (allowAnime || !r.item.anime) && (allowCustom || !r.item.custom));
                    if (result.length < 1) {
                        return undefined;
                    }
                    // @ts-ignore
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
        // @ts-ignore
        return fuse.search(query).map(r => r.item);
    }
    async getFuse(lang) {
        if (!(lang in this.fuses)) {
            const list = await cards_1.cards.getSimpleList(lang);
            this.fuses[lang] = await new Fuse(Object.values(list), this.fuseOpts);
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