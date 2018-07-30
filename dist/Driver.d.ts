import { Card } from "./Card";
import { ICardList, ILangConfig } from "./Language";
export interface IDriverConfig {
    [lang: string]: ILangConfig;
}
export declare class Driver {
    config: IDriverConfig;
    private langList;
    private path;
    constructor(config: IDriverConfig, path?: string);
    getCard(name: string | number, lang: string): Promise<Card | undefined>;
    updateLang(lang: string): Promise<void>;
    readonly langs: string[];
    getCardList(lang: string): Promise<ICardList>;
    private prepareLangs;
}
