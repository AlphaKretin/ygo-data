import { Card } from "./Card";
import { ILangConfig, Language } from "./Language";
interface ILangList {
    [lang: string]: Language;
}
export interface IDriverConfig {
    [lang: string]: ILangConfig;
}
export declare class Driver {
    static build(config: IDriverConfig): Promise<Driver>;
    private static prepareLangs;
    config: IDriverConfig;
    private langList;
    private scripts;
    constructor(config: IDriverConfig, langList: ILangList);
    getCard(name: string, lang: string): Promise<Card>;
    updateLang(lang: string): Promise<null>;
    readonly langs: string[];
}
export {};
