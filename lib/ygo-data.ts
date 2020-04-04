// ts-ignore allowed in this file because fuse.js has incorrect typings
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import * as Fuse from "fuse.js";
import * as fs from "mz/fs";
import { Card } from "./class/Card";
import { Filter } from "./class/Filter";
import { banlist } from "./module/banlist";
import { cards, CardArray, SimpleCard } from "./module/cards";
import { strings } from "./module/strings";
import { CardAttribute, CardCategory, CardLinkMarker, CardOT, CardRace, CardSkillRace, CardType } from "./module/enums";
import { updateFilterNames } from "./module/filterNames";
import { images } from "./module/images";
import { translations } from "./module/translations";

class YgoData {
	private internalLangs!: string[];
	// TODO: Add some configurability here
	private fuseOpts: Fuse.FuseOptions<SimpleCard> = {
		distance: 100,
		includeScore: true,
		keys: ["name"],
		location: 0,
		maxPatternLength: 52,
		minMatchCharLength: 1,
		shouldSort: true,
		threshold: 0.25,
		tokenize: true
	};
	private fuses!: { [lang: string]: Fuse<SimpleCard, Fuse.FuseOptions<SimpleCard>> };
	private shortcuts?: { [lang: string]: { [short: string]: string } };
	// any allowed here because config is subject to change
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private config: any;
	private savePath: string;
	constructor(configPath: string, savePath: string) {
		this.config = JSON.parse(fs.readFileSync(configPath, "utf8"), (key, value) => {
			// if object with hex keys
			if (typeof value === "object" && Object.keys(value).length > 0 && Object.keys(value)[0].startsWith("0x")) {
				// any allowed here because could apply to any part of config
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const newObj: { [i: number]: any } = {};
				for (const k in value) {
					newObj[parseInt(k, 16)] = value[k];
				}
				return newObj;
			}
			return value;
		});
		this.savePath = savePath;
		this.update();
	}

	public async update(): Promise<void> {
		// any allowed here because array of different promises
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const proms: Array<Promise<any>> = [];
		proms.push(cards.update(this.config.cardOpts, this.savePath));
		proms.push(banlist.update(this.config.banlist));
		proms.push(strings.update(this.config.stringOpts, this.savePath));
		translations.update(this.config.transOpts);
		updateFilterNames(this.config.filterNames);
		images.update(this.config.imageLink, this.config.imageExt);
		this.fuses = {};
		this.internalLangs = Object.keys(this.config.cardOpts.langs);
		this.shortcuts = this.config.shortcuts;
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
						//@ts-ignore
						.filter(r => (allowAnime || !r.item.anime) && (allowCustom || !r.item.custom));
					if (result.length < 1) {
						return undefined;
					}
					//@ts-ignore
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
		//@ts-ignore
		return fuse.search(query).map(r => r.item);
	}

	private async getFuse(lang: string): Promise<Fuse<SimpleCard, Fuse.FuseOptions<SimpleCard>>> {
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
