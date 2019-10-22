export interface CardTextRaw {
    name: string;
    desc: string;
    string1: string;
    string2: string;
    string3: string;
    string4: string;
    string5: string;
    string6: string;
    string7: string;
    string8: string;
    string9: string;
    string10: string;
    string11: string;
    string12: string;
    string13: string;
    string14: string;
    string15: string;
    string16: string;
}
interface CardDesc {
    pendHead?: string;
    pendBody?: string;
    monsterHead?: string;
    monsterBody: string;
}
export declare class CardText {
    readonly name: string;
    readonly strings: string[];
    private literalDesc;
    constructor(dbData: CardTextRaw);
    private getPText;
    readonly desc: CardDesc;
}
export {};
