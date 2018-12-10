"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("mz/fs");
const cards_1 = require("./module/cards");
const translations_1 = require("./module/translations");
class YgoData {
    constructor(configPath, savePath) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        cards_1.cards.update(config.cardOpts, savePath);
        translations_1.translations.update(config.transOpts);
    }
    async getCard(id) {
        if (typeof id === "number") {
            const card = await cards_1.cards.getCard(id);
            return card;
        }
        else {
            // TODO: Fuse.js stuff
            const card = await cards_1.cards.getCard(id);
            return card;
        }
    }
}
module.exports = YgoData;
//# sourceMappingURL=ygo-data.js.map