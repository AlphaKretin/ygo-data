import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardType } from "../module/enums";
export interface ICardDataRaw {
    ot: number;
    alias: number;
    setcode: number;
    type: number;
    atk: number;
    def: number;
    level: number;
    race: number;
    attribute: number;
    category: number;
}
interface ICardDataNames {
    ot: string[];
    setcode: Promise<string[]>;
    type: string[];
    race: string[];
    attribute: string[];
    category: string[];
    typeString: string;
}
export declare class CardData {
    readonly ot: number;
    readonly alias: number;
    readonly setcode: number;
    readonly type: number;
    readonly atk: number;
    readonly level: number;
    readonly race: number;
    readonly attribute: number;
    readonly category: number;
    readonly names: {
        [lang: string]: ICardDataNames;
    };
    private literalDef;
    constructor(dbData: ICardDataRaw, langs: string[]);
    readonly def: number | undefined;
    readonly linkMarker: string[] | undefined;
    isAttribute(att: CardAttribute): boolean;
    isCategory(cat: CardCategory): boolean;
    isOT(ot: CardOT): boolean;
    isRace(race: CardRace): boolean;
    isType(type: CardType): boolean;
    isLinkMarker(mark: CardLinkMarker): boolean;
}
export {};
