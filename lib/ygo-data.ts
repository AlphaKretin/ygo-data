import * as Fuse from "fuse.js";
import * as fs from "mz/fs";
import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { banlist } from "./module/banlist";
import { cards, ICardList, ISimpleCard } from "./module/cards";
import { counters } from "./module/counters";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardType } from "./module/enums";
import { updateFilterNames } from "./module/filterNames";
import { images } from "./module/images";
import { setcodes } from "./module/setcodes";
import { translations } from "./module/translations";

class YgoData {
    private internalLangs!: string[];
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
    private fuses!: { [lang: string]: Fuse<ISimpleCard> };
    private shortcuts?: { [lang: string]: { [short: string]: string } };
    private config: any;
    private savePath: string;
    constructor(configPath: string, savePath: string) {
        this.config = JSON.parse(fs.readFileSync(configPath, "utf8"), (key, value) => {
            // if object with hex keys
            if (typeof value === "object" && Object.keys(value).length > 0 && Object.keys(value)[0].startsWith("0x")) {
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
        this.savePath = savePath;
        this.update();
    }

    public async update() {
        const proms: Array<Promise<any>> = [];
        proms.push(cards.update(this.config.cardOpts, this.savePath));
        proms.push(banlist.update(this.config.banlist));
        proms.push(counters.update(this.config.stringOpts));
        proms.push(setcodes.update(this.config.stringOpts));
        translations.update(this.config.transOpts);
        updateFilterNames(this.config.filterNames);
        images.update(this.config.imageLink, this.config.imageExt);
        this.fuses = {};
        this.internalLangs = Object.keys(this.config.cardOpts.langs);
        this.shortcuts = this.config.shortcuts;
        await Promise.all(proms);
    }

    get langs(): string[] {
        return this.internalLangs;
    }

    public async getCard(id: number | string, lang?: string): Promise<Card | undefined> {
        if (typeof id === "number") {
            const card = await cards.getCard(id);
            return card;
        } else {
            const idNum = parseInt(id, 10);
            if (isNaN(idNum) && lang) {
                const simpList = await cards.getSimpleList(lang);
                let term = id.trim().toLowerCase();
                let resultCard: Card | undefined;
                for (const code in simpList) {
                    if (simpList.hasOwnProperty(code)) {
                        if (simpList[code].name.toLowerCase() === term) {
                            const c = await cards.getCard(code);
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
                                const c = await cards.getCard(code);
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
                    let check =
                        newCard && newCard.data.alias === resultCard.id && newCard.data.ot === resultCard.data.ot;
                    if (newCard && newCard.text[lang] && resultCard.text[lang].name !== newCard.text[lang].name) {
                        check = false;
                    }
                    if (check) {
                        resultCard = newCard;
                    }
                }
                return resultCard;
            }
            const card = await cards.getCard(id);
            return card;
        }
    }

    public async getCardList(): Promise<ICardList> {
        return await cards.getRawCardList();
    }

    public async getFuseList(query: string, lang: string): Promise<ISimpleCard[]> {
        const fuse = await this.getFuse(lang);
        // @ts-ignore
        return fuse.search(query).map(r => r.item);
    }

    private async getFuse(lang: string): Promise<Fuse<ISimpleCard>> {
        if (!(lang in this.fuses)) {
            const list = await cards.getSimpleList(lang);
            this.fuses[lang] = await new Fuse(Object.values(list), this.fuseOpts);
        }
        return this.fuses[lang];
    }
}

const enumMap = {
    attribute: CardAttribute,
    category: CardCategory,
    marker: CardLinkMarker,
    ot: CardOT,
    race: CardRace,
    type: CardType
};

export { YgoData, Card, translations, enumMap as enums, Filter, setcodes, counters };
