import { TranslationRaw, Translation } from "../class/Translation";

interface TranslationsRaw {
	[lang: string]: TranslationRaw;
}

class Translations {
	private trans: { [lang: string]: Translation };
	constructor() {
		this.trans = {};
	}

	public update(raw: TranslationsRaw): void {
		for (const langName in raw) {
			this.trans[langName] = new Translation(langName, raw[langName]);
		}
	}

	public getTrans(lang: string): Translation {
		return this.trans[lang];
	}
}

export const translations = new Translations();
