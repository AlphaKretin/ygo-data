import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { CardArray, SimpleCard } from "./module/cards";
import { strings } from "./module/strings";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardSkillRace, CardType } from "./module/enums";
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
    get langs(): string[];
    getCard(id: number | string, lang?: string, allowAnime?: boolean, allowCustom?: boolean): Promise<Card | undefined>;
    getCardList(): Promise<CardArray>;
    getFuseList(query: string, lang: string): Promise<SimpleCard[]>;
    private getFuse;
}
declare const enumMap: {
    attribute: typeof CardAttribute;
    category: typeof CardCategory;
    marker: typeof CardLinkMarker;
    ot: typeof CardOT;
    race: typeof CardRace;
    skillRace: typeof CardSkillRace;
    type: typeof CardType;
};
export { YgoData, Card, translations, enumMap as enums, Filter, strings };
