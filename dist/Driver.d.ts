import { Card } from "./Card";
import { ILangConfig, Language } from "./Language";
interface ILangList {
    [lang: string]: Language;
}
export interface IDriverConfig {
    [lang: string]: ILangConfig;
}
export declare class Driver {
    static build(config: IDriverConfig, path: string): Promise<Driver>;
    private static prepareLangs;
    config: IDriverConfig;
    private langList;
    private path;
    private scripts;
    constructor(config: IDriverConfig, langList: ILangList, path: string);
    getCard(name: string | number, lang: string): Promise<Card>;
    updateLang(lang: string): Promise<null>;
    readonly langs: string[];
}
export {};
