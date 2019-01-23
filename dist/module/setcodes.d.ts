interface ISetcodesConf {
    [lang: string]: string;
}
declare class Setcodes {
    private codes?;
    getCode(code: number, lang: string): Promise<string | undefined>;
    reverseCode(name: string, lang: string): Promise<number | undefined>;
    update(conf: ISetcodesConf): Promise<{}>;
    private loadConf;
    private load;
}
export declare const setcodes: Setcodes;
export {};
