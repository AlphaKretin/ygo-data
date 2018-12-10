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

    public getRace(r: CardRace): string {
        return this.race[r];
    }

    public getAttribute(a: CardAttribute): string {
        return this.attribute[a];
    }

    public getOT(o: CardOT): string {
        return this.ot[o];
    }

    public getCategory(c: CardCategory): string {
        return this.category[c];
    }
}
