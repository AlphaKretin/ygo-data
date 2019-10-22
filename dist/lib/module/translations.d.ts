import { ITranslationRaw, Translation } from "../class/Translation";
interface ITranslationsRaw {
	[lang: string]: ITranslationRaw;
}
declare class Translations {
	private trans;
	constructor();
	update(raw: ITranslationsRaw): void;
	getTrans(lang: string): Translation;
}
export declare const translations: Translations;
export {};
