import { ReposGetContentParams } from "./github";
interface LFList {
    [code: number]: number;
}
interface ListList {
    [name: string]: LFList;
}
declare class Banlist {
    private lflist?;
    getStatus(code: number, list: string): Promise<number | undefined>;
    update(repo: ReposGetContentParams, gitAuth?: string): Promise<ListList>;
    private parseSingleBanlist;
    private load;
}
export declare const banlist: Banlist;
export {};
