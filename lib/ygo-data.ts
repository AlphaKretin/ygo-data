import Fuse from "fuse.js";
import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { banlist } from "./module/banlist";
import { cards, CardArray, SimpleCard } from "./module/cards";
import { strings } from "./module/strings";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardSkillRace, CardType } from "./module/enums";
import { updateFilterNames } from "./module/filterNames";
import { images } from "./module/images";
import { translations, TranslationsRaw } from "./module/translations";
import { ReposGetContentParams } from "./module/github";

interface CardConfig {
	langs: {
		[lang: string]: {
			remoteDBs: ReposGetContentParams[];
		};
	};
	baseDbs?: string[];
	aliasSpecialCases?: number[];
}

interface TransOptions {
	[lang: string]: {
		type: { [t: string]: string };
		race: { [r: string]: string };
		skillRace: { [r: string]: string };
		attribute: { [a: string]: string };
		ot: { [o: string]: string };
		category: { [o: string]: string };
	};
}

type TransConfig = TranslationsRaw | TransOptions;

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
	banlist: ReposGetContentParams;
	imageLink: string;
	imageExt: string;
}

function needsConversion(transOpts: TransConfig): transOpts is TransOptions {
	const key = Object.keys(transOpts)[0];
	return typeof Object.keys(transOpts[key].type)[0] === "string";
}

class YgoData {
	private internalLangs!: string[];
	// TODO: Add some configurability here
	private fuseOpts: Fuse.IFuseOptions<SimpleCard> = {
		distance: 100,
		includeScore: true,
		keys: ["name"],
		location: 0,
		minMatchCharLength: 1,
		shouldSort: true,
		threshold: 0.25,
	};
	private fuses!: { [lang: string]: Fuse<SimpleCard> };
	private shortcuts?: { [lang: string]: { [short: string]: string } };
	// any allowed here because config is subject to change
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private cardOpts: CardConfig;
	private transOpts: TranslationsRaw;
	private miscOpts: MiscConfig;
	private savePath: string;
	private gitAuth?: string;
	constructor(cardOpts: CardConfig, transOpts: TransConfig, miscOpts: MiscConfig, savePath: string, gitAuth?: string) {
		this.cardOpts = cardOpts;
		if (needsConversion(transOpts)) {
			this.transOpts = {};
			for (const lang in transOpts) {
				const type: { [t: number]: string } = {};
				for (const hex in transOpts[lang].type) {
					type[parseInt(hex, 16)] = transOpts[lang].type[hex];
				}
				const race: { [r: number]: string } = {};
				for (const hex in transOpts[lang].race) {
					race[parseInt(hex, 16)] = transOpts[lang].race[hex];
				}
				const skillRace: { [r: number]: string } = {};
				for (const hex in transOpts[lang].skillRace) {
					skillRace[parseInt(hex, 16)] = transOpts[lang].skillRace[hex];
				}
				const attribute: { [a: number]: string } = {};
				for (const hex in transOpts[lang].attribute) {
					attribute[parseInt(hex, 16)] = transOpts[lang].attribute[hex];
				}
				const ot: { [o: number]: string } = {};
				for (const hex in transOpts[lang].ot) {
					ot[parseInt(hex, 16)] = transOpts[lang].ot[hex];
				}
				const category: { [o: number]: string } = {};
				for (const hex in transOpts[lang].category) {
					category[parseInt(hex, 16)] = transOpts[lang].category[hex];
				}

				this.transOpts[lang] = {
					type: type as { [t in CardType]: string },
					race: race as { [r in CardRace]: string },
					skillRace: skillRace as { [r in CardSkillRace]: string },
					attribute: attribute as { [a in CardAttribute]: string },
					ot: ot as { [o in CardOT]: string },
					category: category as { [c in CardCategory]: string }
				};
			}
		} else {
			this.transOpts = transOpts;
		}
		this.miscOpts = miscOpts;
		this.savePath = savePath;
		if (gitAuth) {
			this.gitAuth = gitAuth;
		}
		this.update();
	}

	public async update(): Promise<void> {
		// any allowed here because array of different promises
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const proms: Array<Promise<any>> = [];
		proms.push(cards.update(this.cardOpts, this.savePath, this.gitAuth));
		proms.push(banlist.update(this.miscOpts.banlist, this.gitAuth));
		proms.push(strings.update(this.miscOpts.stringOpts, this.savePath));
		translations.update(this.transOpts);
		updateFilterNames(this.miscOpts.filterNames);
		images.update(this.miscOpts.imageLink, this.miscOpts.imageExt);
		this.fuses = {};
		this.internalLangs = Object.keys(this.cardOpts.langs);
		this.shortcuts = this.miscOpts.shortcuts;
		await Promise.all(proms);
	}

	get langs(): string[] {
		return this.internalLangs;
	}

	public async getCard(
		id: number | string,
		lang?: string,
		allowAnime = true,
		allowCustom = true
	): Promise<Card | undefined> {
		if (typeof id === "number") {
			const card = await cards.getCard(id);
			return card;
		} else {
			const idNum = parseInt(id, 10);
			if (isNaN(idNum) && lang) {
				const simpList = await cards.getSimpleList(lang);
				let term = id.trim().toLowerCase();
				let resultCard: Card | undefined;
				for (const code in simpList) {
					const entry = simpList[code];
					if (entry.name.toLowerCase() === term && (allowAnime || !entry.anime) && (allowCustom || !entry.custom)) {
						const c = await cards.getCard(code);
						if (c) {
							resultCard = c;
							break;
						}
					}
				}
				if (this.shortcuts && this.shortcuts[lang]) {
					const terms = term.split(/\s/);
					for (let i = 0; i < terms.length; i++) {
						if (terms[i] in this.shortcuts[lang]) {
							terms[i] = this.shortcuts[lang][terms[i]].toLowerCase().trim();
						}
					}
					term = terms.join(" ");
					for (const code in simpList) {
						const entry = simpList[code];
						if (entry.name.toLowerCase() === term && (allowAnime || !entry.anime) && (allowCustom || !entry.custom)) {
							const c = await cards.getCard(code);
							if (c) {
								resultCard = c;
								break;
							}
						}
					}
				}
				if (resultCard === undefined) {
					const fuse = await this.getFuse(lang);
					const result = fuse
						.search(term)
						.filter(r => (allowAnime || !r.item.anime) && (allowCustom || !r.item.custom));
					if (result.length < 1) {
						return undefined;
					}
					resultCard = await this.getCard(result[0].item.id);
				}
				if (resultCard !== undefined && resultCard.data.alias > 0) {
					const newCard = await this.getCard(resultCard.data.alias);
					let check = newCard && newCard.data.alias === resultCard.id && newCard.data.ot === resultCard.data.ot;
					if (newCard && newCard.text[lang] && resultCard.text[lang].name !== newCard.text[lang].name) {
						check = false;
					}
					if (check) {
						resultCard = newCard;
					}
				}
				return resultCard;
			}
			const card = await cards.getCard(id);
			return card;
		}
	}

	public async getCardList(): Promise<CardArray> {
		return await cards.getRawCardList();
	}

	public async getFuseList(query: string, lang: string): Promise<SimpleCard[]> {
		const fuse = await this.getFuse(lang);
		return fuse.search(query).map(r => r.item);
	}

	private async getFuse(lang: string): Promise<Fuse<SimpleCard>> {
		if (!(lang in this.fuses)) {
			const list = await cards.getSimpleList(lang);
			this.fuses[lang] = new Fuse(Object.values(list), this.fuseOpts);
		}
		return this.fuses[lang];
	}
}

const enumMap = {
	attribute: CardAttribute,
	category: CardCategory,
	marker: CardLinkMarker,
	ot: CardOT,
	race: CardRace,
	skillRace: CardSkillRace,
	type: CardType
};

export { YgoData, Card, translations, enumMap as enums, Filter, strings };
