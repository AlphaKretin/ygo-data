"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const octokit = require("@octokit/rest");
const mkdirp = require("mkdirp");
const fs = require("mz/fs");
const request = require("request-promise-native");
const sqlite = require("sqlite");
const util = require("util");
const Card_1 = require("../class/Card");
class CardList {
	async getCard(id) {
		if (!this.cards) {
			throw new Error("Card list not loaded!");
		}
		if (typeof id === "string") {
			id = parseInt(id, 10);
		}
		const list = await this.cards;
		return list[id];
	}
	update(opts, savePath) {
		this.cards = this.load(opts, savePath);
	}
	async getSimpleList(lang) {
		if (!this.cards) {
			throw new Error("Card list not loaded!");
		}
		const list = await this.cards;
		const map = {};
		for (const key in list) {
			if (list.hasOwnProperty(key)) {
				const card = list[key];
				if (lang in card.text) {
					map[card.id] = { id: card.id, name: card.text[lang].name };
				}
			}
		}
		return map;
	}
	async getRawCardList() {
		if (!this.cards) {
			throw new Error("Card list not loaded!");
		}
		return await this.cards;
	}
	async downloadSingleDB(file, filePath) {
		const fullPath = filePath + file.name;
		const result = await request({
			encoding: null,
			url: file.download_url
		});
		await fs.writeFile(fullPath, result);
	}
	async downloadDBs(opts, savePath) {
		const github = new octokit();
		if (opts.gitAuth) {
			github.authenticate(opts.gitAuth);
		}
		const proms = [];
		for (const langName in opts.langs) {
			if (opts.langs.hasOwnProperty(langName)) {
				const filePath = savePath + "/" + langName + "/";
				await util.promisify(mkdirp)(filePath);
				const lang = opts.langs[langName];
				if (lang.remoteDBs) {
					for (const repo of lang.remoteDBs) {
						const contents = await github.repos.getContent(repo);
						for (const file of contents.data) {
							if (file.name.endsWith(".cdb")) {
								proms.push(this.downloadSingleDB(file, filePath));
							}
						}
					}
				}
			}
		}
		await Promise.all(proms);
	}
	async loadDBs(opts, savePath) {
		const raw = {};
		for (const langName in opts.langs) {
			if (opts.langs.hasOwnProperty(langName)) {
				const dir = savePath + "/" + langName + "/";
				const dbs = await fs.readdir(dir);
				for (const dbName of dbs) {
					if (dbName.endsWith(".cdb")) {
						const db = await sqlite.open(dir + dbName);
						const result = await db.all("select * from datas,texts where datas.id=texts.id");
						for (const card of result) {
							const data = {
								alias: card.alias,
								atk: card.atk,
								attribute: card.attribute,
								category: card.category,
								def: card.def,
								level: card.level,
								ot: card.ot,
								race: card.race,
								setcode: card.setcode,
								type: card.type
							};
							const text = {
								desc: card.desc,
								name: card.name,
								string1: card.string1,
								string10: card.string10,
								string11: card.string11,
								string12: card.string12,
								string13: card.string13,
								string14: card.string14,
								string15: card.string15,
								string16: card.string16,
								string2: card.string2,
								string3: card.string3,
								string4: card.string4,
								string5: card.string5,
								string6: card.string6,
								string7: card.string7,
								string8: card.string8,
								string9: card.string9
							};
							if (card.id in raw) {
								raw[card.id].text[langName] = text;
								raw[card.id].dbs.push(dbName);
							}
							else {
								const cardRaw = {
									data,
									dbs: [dbName],
									id: card.id,
									text: {}
								};
								cardRaw.text[langName] = text;
								raw[card.id] = cardRaw;
							}
						}
					}
				}
			}
		}
		return raw;
	}
	async load(opts, savePath) {
		await this.downloadDBs(opts, savePath);
		const rawData = await this.loadDBs(opts, savePath);
		const list = {};
		for (const id in rawData) {
			if (rawData.hasOwnProperty(id)) {
				list[id] = new Card_1.Card(rawData[id]);
			}
		}
		return list;
	}
}
exports.cards = new CardList();
//# sourceMappingURL=cards.js.map