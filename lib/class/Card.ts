import fetch from "node-fetch";
import { banlist } from "../module/banlist";
import { cards } from "../module/cards";
import { images } from "../module/images";
import { CardData, CardDataRaw } from "./CardData";
import { CardText, CardTextRaw } from "./CardText";

export interface CardRaw {
	id: number;
	data: CardDataRaw;
	dbs: string[];
	text: {
		[lang: string]: CardTextRaw;
	};
}

interface CardPrice {
	low: number;
	avg: number;
	hi: number;
}

export class Card {
	public readonly id: number;
	public readonly data: CardData;
	public readonly text: {
		[lang: string]: CardText;
	};
	public readonly dbs: string[];
	constructor(dbData: CardRaw) {
		this.id = dbData.id;
		const langs = Object.keys(dbData.text);
		this.data = new CardData(dbData.data, langs);
		this.text = {};
		this.dbs = dbData.dbs;
		for (const lang in dbData.text) {
			this.text[lang] = new CardText(dbData.text[lang]);
		}
	}

	get aliasIDs(): Promise<number[]> {
		// async promise to circumvent synchronous getters
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async resolve => {
			const list = await cards.getRawCardList();
			if (this.data.alias > 0) {
				const alCard = list[this.data.alias];
				if (!alCard || alCard.data.ot !== this.data.ot) {
					return resolve([this.id]);
				}
			}
			const baseCode = this.data.alias > 0 ? this.data.alias : this.id;
			const baseCard = list[baseCode];
			const ids = [baseCode];
			for (const id in list) {
				const card = list[id];
				let check = card && card.data.alias === baseCode && card.data.ot === baseCard.data.ot;
				const lang = Object.keys(baseCard.text)[0];
				if (card.text[lang] && baseCard.text[lang].name !== card.text[lang].name) {
					check = false;
				}
				if (check) {
					ids.push(parseInt(id, 10));
				}
			}
			resolve(ids);
		});
	}

	get status(): Promise<string> {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async resolve => {
			const stats = [];
			// TODO: yeah ik this is hardcoded but it should share names with the banlist file...
			// need a better way in general
			const ots = this.data.names.en.ot;
			for (const ot of ots) {
				const listOT = ot === "Illegal" || ot === "Video Game" ? "Anime" : ot;
				const stat = await banlist.getStatus(this.id, listOT);
				if (stat !== undefined) {
					stats.push(ot + ": " + stat);
				} else {
					stats.push(ot);
				}
			}
			resolve(stats.join("/"));
		});
	}

	get image(): Promise<Buffer | undefined> {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async resolve => {
			const image = await images.getImage(this.id);
			resolve(image);
		});
	}

	get imageLink(): string {
		return images.getLink(this.id);
	}

	get price(): Promise<CardPrice | undefined> {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async resolve => {
			try {
				// TODO: again this is hardcoded but it has to be in english for this to work so.
				// The source for OCG prices is dying :(
				const body = await fetch(
					"https://yugiohprices.com/api/get_card_prices/" + encodeURIComponent(this.text.en.name)
				);
				let result = await body.json();
				if (result instanceof Array) {
					result = result[0];
				}
				if (!(result.status && result.status === "success")) {
					resolve(undefined);
				}
				let low;
				const avgs = [];
				let hi;
				for (const print of result.data) {
					if (print.price_data.status === "success") {
						const data = print.price_data.data.prices;
						if (!low || data.low < low) {
							low = data.low;
						}
						avgs.push(data.average);
						if (!hi || data.high > hi) {
							hi = data.high;
						}
					}
				}
				if (!low || avgs.length < 1 || !hi) {
					resolve(undefined);
				}
				const avg = avgs.reduce((a, b) => a + b) / avgs.length;
				resolve({ low, avg, hi });
			} catch {
				resolve(undefined);
			}
		});
	}
}
