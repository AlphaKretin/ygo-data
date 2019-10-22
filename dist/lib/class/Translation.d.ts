import { CardAttribute, CardCategory, CardOT, CardRace, CardType } from "../module/enums";
export interface ITranslationRaw {
	type: {
		[t in CardType]: string;
	};
	race: {
		[r in CardRace]: string;
	};
	attribute: {
		[a in CardAttribute]: string;
	};
	ot: {
		[o in CardOT]: string;
	};
	category: {
		[o in CardCategory]: string;
	};
}
export declare class Translation {
	readonly lang: string;
	private type;
	private race;
	private attribute;
	private ot;
	private category;
	constructor(name: string, raw: ITranslationRaw);
	getType(t: CardType): string;
	getRace(r: CardRace): string;
	getAttribute(a: CardAttribute): string;
	getOT(o: CardOT): string;
	getCategory(c: CardCategory): string;
}
