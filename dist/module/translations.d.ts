import { TranslationRaw, Translation } from "../class/Translation";
export interface TranslationsRaw {
    [lang: string]: TranslationRaw;
}
declare class Translations {
    private trans;
    constructor();
    update(raw: TranslationsRaw): void;
    getTrans(lang: string): Translation;
}
export declare const translations: Translations;
export {};
