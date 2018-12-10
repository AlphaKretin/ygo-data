import * as Fuse from "fuse.js";
import * as fs from "mz/fs";
import { Card } from "./class/Card";
import { cards, ISimpleCard } from "./module/cards";
import { translations } from "./module/translations";

class YgoData {
    // TODO: Add some configurability here
    private fuseOpts: Fuse.FuseOptions<ISimpleCard> = {
        distance: 100,
        includeScore: true,
        keys: ["name"],
        location: 0,
        maxPatternLength: 52,
        minMatchCharLength: 1,
        shouldSort: true,
        threshold: 0.2
    };
    private fuses: { [lang: string]: Fuse<ISimpleCard> };
    constructor(configPath: string, savePath: string) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        cards.update(config.cardOpts, savePath);
        translations.update(config.transOpts);
        this.fuses = {};
    }

    public async getCard(id: number | string, lang?: string): Promise<Card | undefined> {
        if (typeof id === "number") {
            const card = await cards.getCard(id);
            return card;
        } else {
            const idNum = parseInt(id, 10);
            if (isNaN(idNum) && lang) {
                const fuse = await this.getFuse(lang);
                const result = fuse.search(id);
                if (result.length < 1) {
                    return undefined;
                }
                // @ts-ignore
                const resultCard = await this.getCard(result[0].item.id);
                return resultCard;
            }
            const card = await cards.getCard(id);
            return card;
        }
    }

    private async getFuse(lang: string): Promise<Fuse<ISimpleCard>> {
        if (!(lang in this.fuses)) {
            const list = await cards.getSimpleList(lang);
            this.fuses[lang] = await new Fuse<ISimpleCard>(Object.values(list), this.fuseOpts);
        }
        return this.fuses[lang];
    }
}

module.exports = YgoData;
