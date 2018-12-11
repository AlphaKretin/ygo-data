import * as Fuse from "fuse.js";
import * as fs from "mz/fs";
import { Card } from "./class/Card";
import { banlist } from "./module/banlist";
import { cards, ISimpleCard } from "./module/cards";
import { images } from "./module/images";
import { setcodes } from "./module/setcodes";
import { translations } from "./module/translations";

class YgoData {
    public readonly langs: string[];
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
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"), (key, value) => {
            // if object with hex keys
            if (typeof value === "object" && Object.keys(value)[0].startsWith("0x")) {
                const newObj: { [i: number]: any } = {};
                for (const k in value) {
                    if (value.hasOwnProperty(k)) {
                        newObj[parseInt(k, 16)] = value[k];
                    }
                }
                return newObj;
            }
            return value;
        });
        cards.update(config.cardOpts, savePath);
        setcodes.update(config.stringOpts);
        translations.update(config.transOpts);
        banlist.update(config.banlist);
        images.update(config.imageLink, config.imageExt);
        this.fuses = {};
        this.langs = Object.keys(config.cardOpts.langs);
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

    public async getCardList(): Promise<{ [id: number]: Card }> {
        return await cards.getRawCardList();
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
