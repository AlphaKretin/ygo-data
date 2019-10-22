interface SetcodesConf {
    [lang: string]: string;
}
declare class Counters {
    private counters?;
    getCounter(counter: number, lang: string): Promise<string | undefined>;
    reverseCounter(name: string, lang: string): Promise<number | undefined>;
    update(conf: SetcodesConf): Promise<{
        [lang: string]: {
            [counter: number]: string;
        };
    }>;
    private loadConf;
    private load;
}
export declare const counters: Counters;
export {};
