interface ListLang {
    [code: number]: string;
}
interface StringList {
    [lang: string]: ListLang;
}
interface StringLang {
    local?: string;
    remote?: string;
}
interface StringsConf {
    [lang: string]: StringLang;
}
declare class Strings {
    private counters?;
    private codes?;
    getCode(code: number, lang: string): Promise<string | undefined>;
    reverseCode(name: string, lang: string): Promise<number | undefined>;
    getCounter(counter: number, lang: string): Promise<string | undefined>;
    reverseCounter(name: string, lang: string): Promise<number | undefined>;
    update(conf: StringsConf, savePath: string): Promise<[StringList, StringList]>;
    private loadConf;
    private load;
}
export declare const strings: Strings;
export {};
