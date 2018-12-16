import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardType } from "../module/enums";
import { setcodes } from "../module/setcodes";
import { translations } from "../module/translations";
import { Translation } from "./Translation";

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
    private static generateTypeString(type: number, race: number, trans: Translation): string {
        // list of types to defer in order they should appear
        const deferred = [CardType.TYPE_TUNER, CardType.TYPE_NORMAL, CardType.TYPE_EFFECT];
        let i = 1;
        const names = [];
        const defNames: { [type: number]: string } = {};
        while (i <= type) {
            if ((i & type) === i) {
                const name = trans.getType(i);
                if (deferred.indexOf(i) > -1) {
                    defNames[i] = name;
                } else {
                    names.push(name);
                }
            }
            i = i * 2;
        }
        for (const def of deferred) {
            if (def in defNames) {
                names.push(defNames[def]);
            }
        }
        return names
            .join("/")
            .replace(trans.getType(CardType.TYPE_MONSTER), getNames(race, v => trans.getRace(v)).join("|"));
    }
    public readonly ot: number;
    public readonly alias: number;
    public readonly setcode: number;
    public readonly type: number;
    public readonly atk: number;
    public readonly level: number;
    public readonly race: number;
    public readonly attribute: number;
    public readonly category: number;
    public readonly names: {
        [lang: string]: ICardDataNames;
    };
    private literalDef: number;
    constructor(dbData: ICardDataRaw, langs: string[]) {
        this.ot = dbData.ot;
        this.alias = dbData.alias;
        this.setcode = dbData.setcode;
        this.type = dbData.type;
        this.atk = dbData.atk;
        this.literalDef = dbData.def;
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
                    type: getNames(this.type, v => trans.getType(v)),
                    typeString: CardData.generateTypeString(this.type, this.race, trans)
                };
            }
        }
    }

    get def(): number | undefined {
        if (this.isType(CardType.TYPE_LINK)) {
            return undefined;
        } else {
            return this.literalDef;
        }
    }

    get linkMarker(): string[] | undefined {
        if (!this.isType(CardType.TYPE_LINK)) {
            return undefined;
        } else {
            const markers = [];
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_BOTTOM_LEFT)) {
                markers.push("↙");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_BOTTOM)) {
                markers.push("⬇");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_BOTTOM_RIGHT)) {
                markers.push("↘");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_LEFT)) {
                markers.push("⬅");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_RIGHT)) {
                markers.push("➡");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_TOP_LEFT)) {
                markers.push("↖");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_TOP)) {
                markers.push("⬆");
            }
            if (this.isLinkMarker(CardLinkMarker.LINK_MARKER_TOP_RIGHT)) {
                markers.push("↗");
            }
            return markers;
        }
    }

    public isAttribute(att: CardAttribute): boolean {
        return (this.attribute & att) === att;
    }

    public isCategory(cat: CardCategory): boolean {
        return (this.category & cat) === cat;
    }

    public isOT(ot: CardOT): boolean {
        return (this.ot & ot) === ot;
    }

    public isRace(race: CardRace): boolean {
        return (this.race & race) === race;
    }

    public isType(type: CardType): boolean {
        return (this.type & type) === type;
    }

    public isLinkMarker(mark: CardLinkMarker): boolean {
        if (!this.isType(CardType.TYPE_LINK)) {
            return false;
        }
        return (this.literalDef & mark) === mark;
    }
}
