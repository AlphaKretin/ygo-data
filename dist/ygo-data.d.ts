import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { ICardList, ISimpleCard } from "./module/cards";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardType } from "./module/enums";
import { translations } from "./module/translations";
declare class YgoData {
    readonly langs: string[];
    private fuseOpts;
    private fuses;
    private shortcuts?;
    constructor(configPath: string, savePath: string);
    getCard(id: number | string, lang?: string): Promise<Card | undefined>;
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
export { YgoData, Card, translations, enumMap as enums, Filter };
