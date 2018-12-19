import { CardAttribute, CardCategory, CardOT, CardRace, CardType } from "../module/enums";

export interface ITranslationRaw {
    type: { [t in CardType]: string };
    race: { [r in CardRace]: string };
    attribute: { [a in CardAttribute]: string };
    ot: { [o in CardOT]: string };
    category: { [o in CardCategory]: string };
}

export class Translation {
    public readonly lang: string;
    private type: { [t in CardType]: string };
    private race: { [r in CardRace]: string };
    private attribute: { [a in CardAttribute]: string };
    private ot: { [o in CardOT]: string };
    private category: { [c in CardCategory]: string };
    constructor(name: string, raw: ITranslationRaw) {
        this.lang = name;
        this.type = raw.type;
        this.race = raw.race;
        this.attribute = raw.attribute;
        this.ot = raw.ot;
        this.category = raw.category;
    }

    public getType(t: CardType): string {
        return this.type[t];
    }

    public reverseType(s: string): CardType | undefined {
        const maxType = CardType.TYPE_MINUS;
        const q = s.toLowerCase().trim();
        let t = 1;
        while (t <= maxType) {
            const name = this.getType(t);
            if (name && name.toLowerCase().trim() === q) {
                return t;
            }
            t = t * 2;
        }
    }

    public getRace(r: CardRace): string {
        return this.race[r];
    }

    public reverseRace(s: string): CardRace | undefined {
        const maxRace = CardRace.RACE_CHARISMA;
        const q = s.toLowerCase().trim();
        let r = 1;
        while (r <= maxRace) {
            const name = this.getRace(r);
            if (name && name.toLowerCase().trim() === q) {
                return r;
            }
            r = r * 2;
        }
    }

    public getAttribute(a: CardAttribute): string {
        return this.attribute[a];
    }

    public reverseAttribute(s: string): CardAttribute | undefined {
        const maxAttribute = CardAttribute.ATTRIBUTE_LAUGH;
        const q = s.toLowerCase().trim();
        let a = 1;
        while (a <= maxAttribute) {
            const name = this.getAttribute(a);
            if (name && name.toLowerCase().trim() === q) {
                return a;
            }
            a = a * 2;
        }
    }

    public getOT(o: CardOT): string {
        return this.ot[o];
    }

    public reverseOT(s: string): CardOT | undefined {
        const maxOT = CardOT.OT_CUSTOM;
        const q = s.toLowerCase().trim();
        let o = 1;
        while (o <= maxOT) {
            const name = this.getOT(o);
            if (name && name.toLowerCase().trim() === q) {
                return o;
            }
            o = o * 2;
        }
    }

    public getCategory(c: CardCategory): string {
        return this.category[c];
    }

    public reverseCategory(s: string): CardCategory | undefined {
        const maxCategory = CardCategory.CATEGORY_NEGATE;
        const q = s.toLowerCase().trim();
        let c = 1;
        while (c <= maxCategory) {
            const name = this.getCategory(c);
            if (name && name.toLowerCase().trim() === q) {
                return c;
            }
            c = c * 2;
        }
    }
}
