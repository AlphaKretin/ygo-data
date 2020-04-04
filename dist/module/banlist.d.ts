import { Octokit } from "@octokit/rest";
interface LFList {
    [code: number]: number;
}
interface ListList {
    [name: string]: LFList;
}
declare class Banlist {
    private lflist?;
    getStatus(code: number, list: string): Promise<number | undefined>;
    update(repo: Octokit.ReposGetContentsParams): Promise<ListList>;
    private parseSingleBanlist;
    private load;
}
export declare const banlist: Banlist;
export {};
