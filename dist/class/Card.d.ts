/// <reference types="node" />
import { CardData, ICardDataRaw } from "./CardData";
import { CardText, ICardTextRaw } from "./CardText";
export interface ICardRaw {
    id: number;
    data: ICardDataRaw;
    dbs: string[];
    text: {
        [lang: string]: ICardTextRaw;
    };
}
export declare class Card {
    readonly id: number;
    readonly data: CardData;
    readonly text: {
        [lang: string]: CardText;
    };
    constructor(dbData: ICardRaw);
    readonly aliasIDs: Promise<number[]>;
    readonly status: Promise<string>;
    readonly image: Promise<Buffer | undefined>;
    readonly imageLink: string;
}
