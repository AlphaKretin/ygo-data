"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const banlist_1 = require("../module/banlist");
const cards_1 = require("../module/cards");
const images_1 = require("../module/images");
const CardData_1 = require("./CardData");
const CardText_1 = require("./CardText");
class Card {
    constructor(dbData) {
        this.id = dbData.id;
        const langs = Object.keys(dbData.text);
        this.data = new CardData_1.CardData(dbData.data, langs);
        this.text = {};
        for (const lang in dbData.text) {
            if (dbData.text.hasOwnProperty(lang)) {
                this.text[lang] = new CardText_1.CardText(dbData.text[lang]);
            }
        }
    }
    get aliasIDs() {
        return new Promise(async (resolve, reject) => {
            const list = await cards_1.cards.getRawCardList();
            if (this.data.alias > 0) {
                const alCard = list[this.data.alias];
                if (alCard.data.ot !== this.data.ot) {
                    resolve([this.id]);
                }
            }
            const baseCode = this.data.alias > 0 ? this.data.alias : this.id;
            const baseCard = list[baseCode];
            const ids = [baseCode];
            for (const id in list) {
                if (list.hasOwnProperty(id)) {
                    const card = list[id];
                    if (card && card.data.alias === baseCode && card.data.ot === baseCard.data.ot) {
                        ids.push(parseInt(id, 10));
                    }
                }
            }
            resolve(ids);
        });
    }
    get status() {
        return new Promise(async (resolve, reject) => {
            const stats = [];
            // TODO: yeah ik this is hardcoded but it should share names with the banlist file...
            // need a better way in general
            const ots = this.data.names.en.ot;
            for (const ot of ots) {
                const listOT = ot === "Illegal" || ot === "Video Game" ? "Anime" : ot;
                const stat = await banlist_1.banlist.getStatus(this.id, listOT);
                if (stat) {
                    stats.push(ot + ": " + stat);
                }
                else {
                    stats.push(ot);
                }
            }
            resolve(stats.join("/"));
        });
    }
    get image() {
        return new Promise(async (resolve, reject) => {
            const image = await images_1.images.getImage(this.id);
            resolve(image);
        });
    }
    get imageLink() {
        return images_1.images.getLink(this.id);
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map