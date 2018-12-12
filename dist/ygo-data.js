"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fuse = require("fuse.js");
const fs = require("mz/fs");
const Card_1 = require("./class/Card");
exports.Card = Card_1.Card;
const banlist_1 = require("./module/banlist");
const cards_1 = require("./module/cards");
const enums_1 = require("./module/enums");
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
            if (typeof value === "object" && Object.keys(value)[0].startsWith("0x")) {
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
        cards_1.cards.update(config.cardOpts, savePath);
        setcodes_1.setcodes.update(config.stringOpts);
        translations_1.translations.update(config.transOpts);
        banlist_1.banlist.update(config.banlist);
        images_1.images.update(config.imageLink, config.imageExt);
        this.fuses = {};
        this.langs = Object.keys(config.cardOpts.langs);
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
                const term = id.trim().toLowerCase();
                for (const code in simpList) {
                    if (simpList.hasOwnProperty(code)) {
                        if (simpList[code].name.toLowerCase() === term) {
                            const c = await cards_1.cards.getCard(code);
                            return c;
                        }
                    }
                }
                const fuse = await this.getFuse(lang);
                const result = fuse.search(id);
                if (result.length < 1) {
                    return undefined;
                }
                // @ts-ignore
                const resultCard = await this.getCard(result[0].item.id);
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