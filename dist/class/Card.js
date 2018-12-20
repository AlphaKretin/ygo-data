"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
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
        this.dbs = dbData.dbs;
        for (const lang in dbData.text) {
            if (dbData.text.hasOwnProperty(lang)) {
                this.text[lang] = new CardText_1.CardText(dbData.text[lang]);
            }
        }
    }
    get aliasIDs() {
        return new Promise(async (resolve) => {
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
                    let check = card && card.data.alias === baseCode && card.data.ot === baseCard.data.ot;
                    const lang = Object.keys(baseCard.text)[0];
                    if (card.text[lang] && baseCard.text[lang].name !== card.text[lang].name) {
                        check = false;
                    }
                    if (check) {
                        ids.push(parseInt(id, 10));
                    }
                }
            }
            resolve(ids);
        });
    }
    get status() {
        return new Promise(async (resolve) => {
            const stats = [];
            // TODO: yeah ik this is hardcoded but it should share names with the banlist file...
            // need a better way in general
            const ots = this.data.names.en.ot;
            for (const ot of ots) {
                const listOT = ot === "Illegal" || ot === "Video Game" ? "Anime" : ot;
                const stat = await banlist_1.banlist.getStatus(this.id, listOT);
                if (stat !== undefined) {
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
        return new Promise(async (resolve) => {
            const image = await images_1.images.getImage(this.id);
            resolve(image);
        });
    }
    get imageLink() {
        return images_1.images.getLink(this.id);
    }
    get price() {
        return new Promise(async (resolve) => {
            try {
                // TODO: again this is hardcoded but it has to be in english for this to work so.
                // The source for OCG prices is dying :(
                const body = await request("https://yugiohprices.com/api/get_card_prices/" + encodeURIComponent(this.text.en.name));
                let result = JSON.parse(body);
                if (result instanceof Array) {
                    result = result[0];
                }
                if (!(result.status && result.status === "success")) {
                    resolve(undefined);
                }
                let low;
                const avgs = [];
                let hi;
                for (const print of result.data) {
                    if (print.price_data.status === "success") {
                        const data = print.price_data.data.prices;
                        if (!low || data.low < low) {
                            low = data.low;
                        }
                        avgs.push(data.average);
                        if (!hi || data.high > hi) {
                            hi = data.high;
                        }
                    }
                }
                if (!low || avgs.length < 1 || !hi) {
                    resolve(undefined);
                }
                const avg = avgs.reduce((a, b) => a + b) / avgs.length;
                resolve({ low, avg, hi });
            }
            catch (_a) {
                resolve(undefined);
            }
        });
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map