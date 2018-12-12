declare class Banlist {
    private lflist?;
    getStatus(code: number, list: string): Promise<number | undefined>;
    update(url: string): void;
    private load;
}
export declare const banlist: Banlist;
export {};
