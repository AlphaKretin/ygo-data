import { Language } from "./Language";

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

export class Card {
    public code: number;
    public ot: number;
    public alias: number;
    public setcode: number;
    public type: number;
    public atk: number;
    public def: number;
    public level: number;
    public race: number;
    public attribute: number;
    public category: number;
    public name: string;
    public desc: string;
    public strings: string[];
    public dbs: string[];
    private lang: Language;
    constructor(data: ICardSqlResult, file: string[], lang: Language) {
        this.code = data.id;
        this.ot = data.ot;
        this.alias = data.alias;
        this.setcode = data.setcode;
        this.type = data.type;
        this.atk = data.atk;
        this.def = data.def;
        this.level = data.level;
        this.race = data.race;
        this.attribute = data.attribute;
        this.category = data.category;
        this.name = data.name;
        this.desc = data.desc;
        this.strings = [data.str1, data.str2, data.str3, data.str4, data.str5, data.str6, data.str7, data.str8,
            data.str9, data.str10, data.str11, data.str12, data.str13, data.str14, data.str15, data.str16];
        this.dbs = file;
    }
}
