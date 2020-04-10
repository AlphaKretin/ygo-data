import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardType } from "../module/enums";
export interface CardDataRaw {
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
    aliasedCards: number[];
}
interface CardDataNames {
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
    readonly race: number;
    readonly attribute: number;
    readonly category: number;
    readonly names: {
        [lang: string]: CardDataNames;
    };
    readonly aliasedCards: number[];
    private literalDef;
    private literalLevel;
    constructor(dbData: CardDataRaw, langs: string[]);
    get def(): number | undefined;
    get level(): number;
    get lscale(): number | undefined;
    get rscale(): number | undefined;
    get linkMarker(): string[] | undefined;
    isAttribute(att: CardAttribute): boolean;
    isCategory(cat: CardCategory): boolean;
    isOT(ot: CardOT): boolean;
    isRace(race: CardRace): boolean;
    isType(type: CardType): boolean;
    isLinkMarker(mark: CardLinkMarker): boolean;
    isSetCode(code: number): boolean;
    private generateTypeString;
}
export {};
