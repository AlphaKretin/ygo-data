/// <reference types="node" />
import { CardData, CardDataRaw } from "./CardData";
import { CardText, CardTextRaw } from "./CardText";
export interface CardRaw {
    id: number;
    data: CardDataRaw;
    dbs: string[];
    text: {
        [lang: string]: CardTextRaw;
    };
}
interface CardPrice {
    low: number;
    avg: number;
    hi: number;
}
export declare class Card {
    readonly id: number;
    readonly data: CardData;
    readonly text: {
        [lang: string]: CardText;
    };
    readonly dbs: string[];
    constructor(dbData: CardRaw);
    get aliasIDs(): Promise<number[]>;
    get status(): Promise<string>;
    get image(): Promise<Buffer | undefined>;
    get imageLink(): string;
    get price(): Promise<CardPrice | undefined>;
}
export {};
