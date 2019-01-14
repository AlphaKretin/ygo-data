interface ISetcodesConf {
    [lang: string]: string;
}
declare class Counters {
    private counters?;
    getCounter(counter: number, lang: string): Promise<string | undefined>;
    reverseCounter(name: string, lang: string): Promise<number | undefined>;
    update(conf: ISetcodesConf): void;
    private loadConf;
    private load;
}
export declare const counters: Counters;
export {};
