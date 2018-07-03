import { ILangTranslations } from "./Language";
export interface ICardSqlResult {
    id: number;
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
    name: string;
    desc: string;
    str1: string;
    str2: string;
    str3: string;
    str4: string;
    str5: string;
    str6: string;
    str7: string;
    str8: string;
    str9: string;
    str10: string;
    str11: string;
    str12: string;
    str13: string;
    str14: string;
    str15: string;
    str16: string;
}
export declare class Card {
    code: number;
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
    name: string;
    desc: string;
    strings: string[];
    dbs: string[];
    private lang;
    constructor(data: ICardSqlResult, file: string[], lang: ILangTranslations);
    readonly otNames: string[];
    readonly setNames: string[];
    readonly typeNames: string[];
    readonly raceNames: string[];
    readonly attributeNames: string[];
    readonly categoryNames: string[];
    readonly desc_m: string;
    readonly desc_p: string;
}
