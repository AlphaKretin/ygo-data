import * as octokit from "@octokit/rest";
import { Card } from "../class/Card";
export interface ICardList {
    [id: number]: Card;
}
export interface ISimpleList {
    [id: number]: ISimpleCard;
}
interface ICardListOpts {
    langs: {
        [lang: string]: {
            stringsConf: string;
            remoteDBs?: octokit.ReposGetContentsParams[];
        };
    };
    baseDbs?: string[];
    gitAuth?: string;
}
export interface ISimpleCard {
    id: number;
    name: string;
}
declare class CardList {
    private cards?;
    getCard(id: number | string): Promise<Card | undefined>;
    update(opts: ICardListOpts, savePath: string): Promise<{
        [id: number]: Card;
    }>;
    getSimpleList(lang: string): Promise<ISimpleList>;
    getRawCardList(): Promise<ICardList>;
    private downloadSingleDB;
    private downloadDBs;
    private loadDBs;
    private load;
}
export declare const cards: CardList;
export {};
