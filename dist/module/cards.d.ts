import { Octokit } from "@octokit/rest";
import { Card } from "../class/Card";
export interface CardArray {
    [id: number]: Card;
}
export interface SimpleList {
    [id: number]: SimpleCard;
}
interface CardListOpts {
    langs: {
        [lang: string]: {
            remoteDBs?: Octokit.ReposGetContentsParams[];
        };
    };
    baseDbs?: string[];
    aliasSpecialCases?: number[];
}
export interface SimpleCard {
    id: number;
    name: string;
    anime: boolean;
    custom: boolean;
}
declare class CardList {
    private cards?;
    getCard(id: number | string): Promise<Card | undefined>;
    update(opts: CardListOpts, savePath: string, gitAuth?: string): Promise<{
        [id: number]: Card;
    }>;
    getSimpleList(lang: string): Promise<SimpleList>;
    getRawCardList(): Promise<CardArray>;
    private downloadSingleDB;
    private downloadDBs;
    private loadDBs;
    private load;
}
export declare const cards: CardList;
export {};
