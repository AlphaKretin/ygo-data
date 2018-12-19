import * as octokit from "@octokit/rest";
import { Card } from "../class/Card";
export interface ICardList {
    [id: number]: Card;
}
interface ICardListOpts {
    langs: {
        [lang: string]: {
            stringsConf: string;
            remoteDBs?: octokit.ReposGetContentsParams[];
        };
    };
    gitAuth?: octokit.Auth;
}
export interface ISimpleCard {
    id: number;
    name: string;
}
declare class CardList {
    private cards?;
    getCard(id: number | string): Promise<Card | undefined>;
    update(opts: ICardListOpts, savePath: string): void;
    getSimpleList(lang: string): Promise<{
        [id: number]: ISimpleCard;
    }>;
    getRawCardList(): Promise<ICardList>;
    private downloadSingleDB;
    private downloadDBs;
    private loadDBs;
    private load;
}
export declare const cards: CardList;
export {};
