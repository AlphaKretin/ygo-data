"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                    if (card.data.alias === baseCode) {
                        ids.push(parseInt(id, 10));
                    }
                }
            }
            resolve(ids);
        });
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map