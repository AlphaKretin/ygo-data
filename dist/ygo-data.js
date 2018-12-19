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
const enums_1 = require("./module/enums");
const filterNames_1 = require("./module/filterNames");
const images_1 = require("./module/images");
const setcodes_1 = require("./module/setcodes");
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
            threshold: 0.2
        };
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"), (key, value) => {
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
        try {
            cards_1.cards.update(config.cardOpts, savePath);
            banlist_1.banlist.update(config.banlist);
        }
        catch (e) {
            throw e;
        }
        setcodes_1.setcodes.update(config.stringOpts);
        translations_1.translations.update(config.transOpts);
        filterNames_1.updateFilterNames(config.filterNames);
        images_1.images.update(config.imageLink, config.imageExt);
        this.fuses = {};
        this.langs = Object.keys(config.cardOpts.langs);
        this.shortcuts = config.shortcuts;
    }
    async getCard(id, lang) {
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
                        if (simpList[code].name.toLowerCase() === term) {
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
                            if (simpList[code].name.toLowerCase() === term) {
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
                    const result = fuse.search(term);
                    if (result.length < 1) {
                        return undefined;
                    }
                    // @ts-ignore
                    resultCard = await this.getCard(result[0].item.id);
                }
                if (resultCard !== undefined && resultCard.data.alias > 0) {
                    const newCard = await this.getCard(resultCard.data.alias);
                    if (newCard && newCard.data.ot === resultCard.data.ot) {
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
    type: enums_1.CardType
};
exports.enums = enumMap;
//# sourceMappingURL=ygo-data.js.map