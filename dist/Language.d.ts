import * as octokit from "@octokit/rest";
import * as fuse from "fuse.js";
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
    fuseList: fuse;
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
    fuseOptions?: fuse.FuseOptions;
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
export interface ICardList {
    [code: number]: Card;
}
export declare class Language {
    pendingData: Promise<ILanguageDataPayload>;
    name: string;
    constructor(name: string, config: ILangConfig, path: string);
    getCardByCode(code: number): Promise<Card | undefined>;
    getCardByName(name: string): Promise<Card | undefined>;
    getCards(): Promise<{
        [code: number]: Card;
    }>;
    private getSetcodes;
    private getCounters;
    private getOts;
    private getTypes;
    private getCategories;
    private getAttributes;
    private getRaces;
    private getFuse;
    private prepareData;
}
export {};
