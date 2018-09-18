import * as octokit from "@octokit/rest";
import * as fuse from "fuse.js";
import { Card } from "./Card";
import { IDriverConfig } from "./Driver";
interface IBanlist {
    [list: string]: {
        [code: number]: number;
    };
}
interface ILanguageDataPayload {
    banlist: IBanlist;
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
        [ot: string]: string;
    };
    types: {
        [type: string]: string;
    };
    races: {
        [race: string]: string;
    };
    attributes: {
        [type: string]: string;
    };
    categories: {
        [race: string]: string;
    };
    fuseList: fuse;
}
export interface ILangTranslations {
    banlist: IBanlist;
    setcodes: {
        [set: string]: string;
    };
    ots: {
        [ot: string]: string;
    };
    types: {
        [type: string]: string;
    };
    races: {
        [race: string]: string;
    };
    attributes: {
        [type: string]: string;
    };
    categories: {
        [race: string]: string;
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
    imageLink: string;
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
    constructor(name: string, config: ILangConfig, path: string, mainConf: IDriverConfig);
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
