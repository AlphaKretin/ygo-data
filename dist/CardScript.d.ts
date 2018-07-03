export declare class CardScript {
    private data;
    private source;
    private code;
    constructor(code: number);
    private update;
    readonly url: Promise<string>;
    readonly content: Promise<string>;
    readonly contentLines: Promise<string>;
}
