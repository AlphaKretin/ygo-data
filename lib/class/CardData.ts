import { setcodes } from "../module/setcodes";
import { translations } from "../module/translations";

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
}

function getNames(val: number, func: (v: number) => string): string[] {
    let i = 1;
    const names = [];
    while (i <= val) {
        if ((i & val) === i) {
            names.push(func(i));
        }
        i = i * 2;
    }
    return names;
}

async function getSetcodeNames(setcode: number, lang: string): Promise<string[]> {
    let tempCode = setcode;
    const codes: number[] = [];
    while (tempCode > 0) {
        codes.push(tempCode & 0xffff);
        tempCode = tempCode >> 16;
    }
    const names: string[] = [];
    for (const code of codes) {
        const name = await setcodes.getCode(code, lang);
        if (name) {
            names.push(name);
        }
    }
    return names;
}

export class CardData {
    public readonly ot: number;
    public readonly alias: number;
    public readonly setcode: number;
    public readonly type: number;
    public readonly atk: number;
    public readonly def: number;
    public readonly level: number;
    public readonly race: number;
    public readonly attribute: number;
    public readonly category: number;
    public readonly names: {
        [lang: string]: ICardDataNames;
    };
    constructor(dbData: ICardDataRaw, langs: string[]) {
        this.ot = dbData.ot;
        this.alias = dbData.alias;
        this.setcode = dbData.setcode;
        this.type = dbData.type;
        this.atk = dbData.atk;
        this.def = dbData.def;
        this.level = dbData.level;
        this.race = dbData.race;
        this.attribute = dbData.attribute;
        this.category = dbData.category;
        this.names = {};
        for (const lang of langs) {
            const trans = translations.getTrans(lang);
            if (trans) {
                this.names[lang] = {
                    attribute: getNames(this.attribute, v => trans.getAttribute(v)),
                    category: getNames(this.category, v => trans.getCategory(v)),
                    ot: getNames(this.ot, v => trans.getOT(v)),
                    race: getNames(this.race, v => trans.getRace(v)),
                    setcode: getSetcodeNames(this.setcode, lang),
                    type: getNames(this.type, v => trans.getType(v))
                };
            }
        }
    }
}
