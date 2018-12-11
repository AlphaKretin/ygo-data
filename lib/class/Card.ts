import { banlist } from "../module/banlist";
import { cards } from "../module/cards";
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
    constructor(dbData: ICardRaw) {
        this.id = dbData.id;
        const langs = Object.keys(dbData.text);
        this.data = new CardData(dbData.data, langs);
        this.text = {};
        for (const lang in dbData.text) {
            if (dbData.text.hasOwnProperty(lang)) {
                this.text[lang] = new CardText(dbData.text[lang]);
            }
        }
    }

    get aliasIDs(): Promise<number[]> {
        return new Promise(async (resolve, reject) => {
            const baseCode = this.data.alias > 0 ? this.data.alias : this.id;
            const ids = [baseCode];
            for (const id in cards) {
                if (cards.hasOwnProperty(id)) {
                    const card = await cards.getCard(id);
                    if (card && card.data.alias === baseCode) {
                        ids.push(parseInt(id, 10));
                    }
                }
            }
            resolve(ids);
        });
    }

    get status(): Promise<string> {
        return new Promise(async (resolve, reject) => {
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
}