import * as octokit from "@octokit/rest";
import { Card } from "../class/Card";
interface ICardListOpts {
    langs: {
        [lang: string]: {
            stringsConf: string;
            remoteDBs?: octokit.ReposGetContentParams[];
        };
    };
    gitAuth?: octokit.Auth;
}
declare class CardList {
    private cards?;
    getCard(id: number | string): Promise<Card>;
    update(opts: ICardListOpts, savePath: string): void;
    private downloadSingleDB;
    private downloadDBs;
    private loadDBs;
    private load;
}
export declare const cards: CardList;
export {};
