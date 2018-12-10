import * as fs from "mz/fs";
import { Card } from "./class/Card";
import { cards } from "./module/cards";
import { translations } from "./module/translations";

class YgoData {
    constructor(configPath: string, savePath: string) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        cards.update(config.cardOpts, savePath);
        translations.update(config.transOpts);
    }

    public async getCard(id: number | string): Promise<Card> {
        if (typeof id === "number") {
            const card = await cards.getCard(id);
            return card;
        } else {
            // TODO: Fuse.js stuff
            const card = await cards.getCard(id);
            return card;
        }
    }
}

module.exports = YgoData;
