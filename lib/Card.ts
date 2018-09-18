// import jimp = require("jimp");
import * as request from "request-promise-native";
import { IDriverConfig } from "./Driver";
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

// reduce to 1-input function for easy mapping
function parseHex(q: string) {
    return parseInt(q, 16);
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
    public unofficial: boolean = true;
    private lang: ILangTranslations;
    private imageLink: string;
    constructor(data: ICardSqlResult, file: string[], lang: ILangTranslations, mainConf: IDriverConfig) {
        this.code = data.id;
        this.ot = data.ot;
        // 4+ is anime and derivatives, except custom - unofficial to OCG, but official to Percy
        if (this.ot < 4 || this.ot >= 32) {
            this.unofficial = false;
        }
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
        this.strings = [
            data.str1,
            data.str2,
            data.str3,
            data.str4,
            data.str5,
            data.str6,
            data.str7,
            data.str8,
            data.str9,
            data.str10,
            data.str11,
            data.str12,
            data.str13,
            data.str14,
            data.str15,
            data.str16
        ];
        this.dbs = file;
        this.lang = lang;
        this.imageLink = mainConf.imageLink + this.code + "." + mainConf.imageExt;
    }

    get otNames(): string[] {
        const names: string[] = [];
        for (const key in this.lang.ots) {
            if (this.lang.ots.hasOwnProperty(key)) {
                const ot = parseInt(key, 16);
                if ((ot & this.ot) !== 0) {
                    names.push(this.lang.ots[key]);
                }
            }
        }
        return names;
    }

    get status(): string {
        const names = this.otNames;
        const newNames: string[] = [];
        for (const name of names) {
            if (name in this.lang.banlist) {
                const stat = this.code in this.lang.banlist[name] ? this.lang.banlist[name][this.code] : 3;
                newNames.push(name + ": " + stat);
            } else if (this.unofficial) {
                const stat = this.code in this.lang.banlist.Anime ? this.lang.banlist.Anime[this.code] : 3;
                newNames.push(name + ": " + stat);
            } else {
                newNames.push(name);
            }
        }
        return newNames.join("/");
    }

    get setNames(): string[] {
        const hex: RegExpMatchArray | null = this.setcode
            .toString(16)
            .padStart(16, "0")
            .match(/.{1,4}/g);
        const codes: number[] | null = hex && hex.map(parseHex);
        const names: string[] = [];
        for (const key in this.lang.setcodes) {
            if (this.lang.setcodes.hasOwnProperty(key)) {
                if (codes && codes.includes(parseHex(key))) {
                    names.push(this.lang.setcodes[key]);
                }
            }
        }
        return names;
    }

    get typeNames(): string[] {
        const names: string[] = [];
        for (const key in this.lang.types) {
            if (this.lang.types.hasOwnProperty(key)) {
                const type = parseInt(key, 16);
                if ((type & this.type) !== 0) {
                    names.push(this.lang.types[key]);
                }
            }
        }
        return names;
    }

    get typeString(): string {
        const types = this.typeNames;
        const monster: string = this.lang.types["0x1"];
        const index = types.indexOf(monster);
        if (index > -1) {
            types[index] = this.raceNames.join("|");
        }
        return types.join("/");
    }

    get raceNames(): string[] {
        const names: string[] = [];
        for (const key in this.lang.races) {
            if (this.lang.races.hasOwnProperty(key)) {
                const race = parseInt(key, 16);
                if ((race & this.race) !== 0) {
                    names.push(this.lang.races[key]);
                }
            }
        }
        return names;
    }

    get attributeNames(): string[] {
        const names: string[] = [];
        for (const key in this.lang.attributes) {
            if (this.lang.attributes.hasOwnProperty(key)) {
                const att = parseInt(key, 16);
                if ((att & this.attribute) !== 0) {
                    names.push(this.lang.attributes[key]);
                }
            }
        }
        return names;
    }

    get categoryNames(): string[] {
        const names: string[] = [];
        for (const key in this.lang.categories) {
            if (this.lang.categories.hasOwnProperty(key)) {
                const cat = parseInt(key, 16);
                if ((cat & this.category) !== 0) {
                    names.push(this.lang.categories[key]);
                }
            }
        }
        return names;
    }

    get desc_m(): string {
        return this.desc; // placeholder
    }

    get desc_p(): string | null {
        return this.desc; // placeholder
    }

    get image(): Promise<Buffer | undefined> {
        return new Promise(async resolve => {
            try {
                const image = await request(this.imageLink, { encoding: null });
                resolve(image);
            } catch (e) {
                resolve(undefined);
            }
        });
    }
}
