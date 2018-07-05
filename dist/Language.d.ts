import * as octokit from "@octokit/rest";
import { Card } from "./Card";
interface ILanguageDataPayload {
    cards: {
        [code: number]: Card;
    };
    setcodes: {
        [set: string]: string;
    };
    counters: {
        [counter: string]: string;
    };
    ots: {
        [ot: number]: string;
    };
    types: {
        [type: number]: string;
    };
    races: {
        [race: number]: string;
    };
    attributes: {
        [type: number]: string;
    };
    categories: {
        [race: number]: string;
    };
}
export interface ILangTranslations {
    setcodes: {
        [set: string]: string;
    };
    ots: {
        [ot: number]: string;
    };
    types: {
        [type: number]: string;
    };
    races: {
        [race: number]: string;
    };
    attributes: {
        [type: number]: string;
    };
    categories: {
        [race: number]: string;
    };
}
export interface ILangConfig {
    attributes: {
        [type: number]: string;
    };
    categories: {
        [type: number]: string;
    };
    ots: {
        [ot: number]: string;
    };
    races: {
        [race: number]: string;
    };
    types: {
        [type: number]: string;
    };
    stringsConf: string;
    localDBs?: string[];
    remoteDBs?: octokit.ReposGetContentParams[];
}
export declare class Language {
    static prepareData(name: string, config: ILangConfig, path: string): Promise<ILanguageDataPayload>;
    static build(name: string, config: ILangConfig, path: string): Promise<Language>;
    cards: {
        [code: number]: Card;
    };
    setcodes: {
        [set: string]: string;
    };
    counters: {
        [counter: string]: string;
    };
    ots: {
        [ot: number]: string;
    };
    types: {
        [type: number]: string;
    };
    races: {
        [type: number]: string;
    };
    attributes: {
        [type: number]: string;
    };
    categories: {
        [type: number]: string;
    };
    name: string;
    constructor(name: string, data: ILanguageDataPayload);
    getCardByCode(code: number): Promise<Card>;
    getCardByName(name: string): Promise<Card>;
}
export {};
