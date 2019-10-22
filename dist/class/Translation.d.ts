import { CardAttribute, CardCategory, CardOT, CardRace, CardSkillRace, CardType } from "../module/enums";
export interface TranslationRaw {
    type: {
        [t in CardType]: string;
    };
    race: {
        [r in CardRace]: string;
    };
    skillRace: {
        [r in CardSkillRace]: string;
    };
    attribute: {
        [a in CardAttribute]: string;
    };
    ot: {
        [o in CardOT]: string;
    };
    category: {
        [o in CardCategory]: string;
    };
}
export declare class Translation {
    readonly lang: string;
    private type;
    private race;
    private skillRace;
    private attribute;
    private ot;
    private category;
    constructor(name: string, raw: TranslationRaw);
    getType(t: CardType): string;
    reverseType(s: string): CardType | undefined;
    getRace(r: CardRace | CardSkillRace, isSkill?: boolean): string;
    reverseRace(s: string): CardRace | undefined;
    getAttribute(a: CardAttribute): string;
    reverseAttribute(s: string): CardAttribute | undefined;
    getOT(o: CardOT): string;
    reverseOT(s: string): CardOT | undefined;
    getCategory(c: CardCategory): string;
    reverseCategory(s: string): CardCategory | undefined;
}
