declare class Banlist {
    private lflist?;
    getStatus(code: number, list: string): Promise<number | undefined>;
    update(url: string): Promise<{
        [list: string]: {
            [code: number]: number;
        };
    }>;
    private load;
}
export declare const banlist: Banlist;
export {};
