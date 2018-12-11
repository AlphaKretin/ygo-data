"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const banlist_1 = require("../module/banlist");
const cards_1 = require("../module/cards");
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
            const baseCode = this.data.alias > 0 ? this.data.alias : this.id;
            const ids = [baseCode];
            for (const id in cards_1.cards) {
                if (cards_1.cards.hasOwnProperty(id)) {
                    const card = await cards_1.cards.getCard(id);
                    if (card && card.data.alias === baseCode) {
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
                const stat = await banlist_1.banlist.getStatus(this.id, ot);
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
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map