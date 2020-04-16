import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { CardArray, SimpleCard } from "./module/cards";
import { strings } from "./module/strings";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardSkillRace, CardType } from "./module/enums";
import { translations, TranslationsRaw } from "./module/translations";
import { Octokit } from "@octokit/rest";
interface CardConfig {
    langs: {
        [lang: string]: {
            remoteDBs: Octokit.ReposGetContentsParams[];
        };
    };
    baseDbs?: string[];
    aliasSpecialCases?: number[];
}
interface TransOptions {
    [lang: string]: {
        type: {
            [t: string]: string;
        };
        race: {
            [r: string]: string;
        };
        skillRace: {
            [r: string]: string;
        };
        attribute: {
            [a: string]: string;
        };
        ot: {
            [o: string]: string;
        };
        category: {
            [o: string]: string;
        };
    };
}
declare type TransConfig = TranslationsRaw | TransOptions;
interface MiscConfig {
    stringOpts: {
        [lang: string]: {
            local?: string;
            remote?: string;
        };
    };
    shortcuts: {
        [lang: string]: {
            [shortcut: string]: string;
        };
    };
    filterNames: {
        attribute: string[];
        category: string[];
        ot: string[];
        race: string[];
        type: string[];
        level: string[];
        atk: string[];
        def: string[];
        setcode: string[];
    };
    banlist: Octokit.ReposGetContentsParams;
    imageLink: string;
    imageExt: string;
}
declare class YgoData {
    private internalLangs;
    private fuseOpts;
    private fuses;
    private shortcuts?;
    private cardOpts;
    private transOpts;
    private miscOpts;
    private savePath;
    constructor(cardOpts: CardConfig, transOpts: TransConfig, miscOpts: MiscConfig, savePath: string);
    update(): Promise<void>;
    get langs(): string[];
    getCard(id: number | string, lang?: string, allowAnime?: boolean, allowCustom?: boolean): Promise<Card | undefined>;
    getCardList(): Promise<CardArray>;
    getFuseList(query: string, lang: string): Promise<SimpleCard[]>;
    private getFuse;
}
declare const enumMap: {
    attribute: typeof CardAttribute;
    category: typeof CardCategory;
    marker: typeof CardLinkMarker;
    ot: typeof CardOT;
    race: typeof CardRace;
    skillRace: typeof CardSkillRace;
    type: typeof CardType;
};
export { YgoData, Card, translations, enumMap as enums, Filter, strings };
