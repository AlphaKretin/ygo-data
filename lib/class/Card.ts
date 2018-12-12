import { banlist } from "../module/banlist";
import { cards } from "../module/cards";
import { images } from "../module/images";
import { CardData, ICardDataRaw } from "./CardData";
import { CardText, ICardTextRaw } from "./CardText";

export interface ICardRaw {
    id: number;
    data: ICardDataRaw;
    dbs: string[];
    text: {
        [lang: string]: ICardTextRaw;
    };
}

export class Card {
    public readonly id: number;
    public readonly data: CardData;
    public readonly text: {
        [lang: string]: CardText;
    };
    public readonly dbs: string[];
    constructor(dbData: ICardRaw) {
        this.id = dbData.id;
        const langs = Object.keys(dbData.text);
        this.data = new CardData(dbData.data, langs);
        this.text = {};
        this.dbs = dbData.dbs;
        for (const lang in dbData.text) {
            if (dbData.text.hasOwnProperty(lang)) {
                this.text[lang] = new CardText(dbData.text[lang]);
            }
        }
    }

    get aliasIDs(): Promise<number[]> {
        return new Promise(async resolve => {
            const list = await cards.getRawCardList();
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

    get status(): Promise<string> {
        return new Promise(async resolve => {
            const stats = [];
            // TODO: yeah ik this is hardcoded but it should share names with the banlist file...
            // need a better way in general
            const ots = this.data.names.en.ot;
            for (const ot of ots) {
                const listOT = ot === "Illegal" || ot === "Video Game" ? "Anime" : ot;
                const stat = await banlist.getStatus(this.id, listOT);
                if (stat) {
                    stats.push(ot + ": " + stat);
                } else {
                    stats.push(ot);
                }
            }
            resolve(stats.join("/"));
        });
    }

    get image(): Promise<Buffer | undefined> {
        return new Promise(async resolve => {
            const image = await images.getImage(this.id);
            resolve(image);
        });
    }

    get imageLink(): string {
        return images.getLink(this.id);
    }
}
