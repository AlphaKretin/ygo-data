import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { ICardList, ISimpleCard } from "./module/cards";
import { counters } from "./module/counters";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardType } from "./module/enums";
import { setcodes } from "./module/setcodes";
import { translations } from "./module/translations";
declare class YgoData {
    private internalLangs;
    private fuseOpts;
    private fuses;
    private shortcuts?;
    private config;
    private savePath;
    constructor(configPath: string, savePath: string);
    update(): Promise<void>;
    readonly langs: string[];
    getCard(id: number | string, lang?: string, allowAnime?: boolean, allowCustom?: boolean): Promise<Card | undefined>;
    getCardList(): Promise<ICardList>;
    getFuseList(query: string, lang: string): Promise<ISimpleCard[]>;
    private getFuse;
}
declare const enumMap: {
    attribute: typeof CardAttribute;
    category: typeof CardCategory;
    marker: typeof CardLinkMarker;
    ot: typeof CardOT;
    race: typeof CardRace;
    type: typeof CardType;
};
export { YgoData, Card, translations, enumMap as enums, Filter, setcodes, counters };
