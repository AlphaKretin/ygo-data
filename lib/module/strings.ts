import * as fs from "mz/fs";
import fetch from "node-fetch";

interface ListLang {
	[code: number]: string;
}

interface StringList {
	[lang: string]: ListLang;
}

interface StringLang {
	local?: string;
	remote?: string;
}

interface StringsConf {
	[lang: string]: StringLang;
}

class Strings {
	private counters?: Promise<StringList>;
	private codes?: Promise<StringList>;

	public async getCode(code: number, lang: string): Promise<string | undefined> {
		if (!this.codes) {
			throw new Error("Setcode list not loaded!");
		}
		const list = await this.codes;
		return list[lang][code];
	}

	public async reverseCode(name: string, lang: string): Promise<number | undefined> {
		if (!this.codes) {
			throw new Error("Setcode list not loaded!");
		}
		const query = name.toLowerCase().trim();
		const list = await this.codes;
		for (const code in list[lang]) {
			if (list[lang][code].toLowerCase().trim() === query) {
				return parseInt(code, 10);
			}
		}
	}
	public async getCounter(counter: number, lang: string): Promise<string | undefined> {
		if (!this.counters) {
			throw new Error("String list not loaded!");
		}
		const list = await this.counters;
		return list[lang][counter];
	}

	public async reverseCounter(name: string, lang: string): Promise<number | undefined> {
		if (!this.counters) {
			throw new Error("Setcode list not loaded!");
		}
		const query = name.toLowerCase().trim();
		const list = await this.counters;
		for (const counter in list[lang]) {
			if (list[lang][counter].toLowerCase().trim() === query) {
				return parseInt(counter, 10);
			}
		}
	}

	public update(conf: StringsConf, savePath: string): Promise<[StringList, StringList]> {
		const prom = this.load(conf, savePath).catch(e => {
			console.error(e);
			console.error("Failed to load strings file! Catastrophic failure, exiting");
			process.exit();
		});
		this.codes = prom
			.then(list => list[0])
			.catch(e => {
				throw e;
			});
		this.counters = prom
			.then(list => list[1])
			.catch(e => {
				throw e;
			});
		return prom;
	}

	private async loadConf(conf: StringLang, lang: string, savePath: string): Promise<[ListLang, ListLang]> {
		let stringsConf: string | undefined = undefined;
		if (conf.local) {
			stringsConf = await fs.readFile(savePath + "/" + lang + "/" + conf.local, "utf8");
			if (conf.remote) {
				stringsConf += "\r\n" + (await (await fetch(conf.remote)).text());
			}
		}
		if (!stringsConf) {
			if (conf.remote) {
				stringsConf = await (await fetch(conf.remote)).text();
			} else {
				throw new Error("Some language has no strings defined!");
			}
		}
		const file = stringsConf.split(/\n|\r|\r\n/);
		const setList: { [set: number]: string } = {};
		const counterList: { [counter: number]: string } = {};
		for (const line of file) {
			const setRegex = /!setname (0x[\da-fA-F]+) (.+)/g;
			const setResult = setRegex.exec(line);
			if (setResult !== null) {
				const setCode = parseInt(setResult[1], 16);
				const setName = setResult[2];
				setList[setCode] = setName;
			}
			const counterRegex = /!counter (0x[\da-fA-F]+) (.+)/g;
			const counterResult = counterRegex.exec(line);
			if (counterResult !== null) {
				const counter = parseInt(counterResult[1], 16);
				const counterName = counterResult[2];
				counterList[counter] = counterName;
			}
		}
		return [setList, counterList];
	}

	private async load(conf: StringsConf, savePath: string): Promise<[StringList, StringList]> {
		const setMap: StringList = {};
		const counterMap: StringList = {};
		for (const lang in conf) {
			const [sets, cts] = await this.loadConf(conf[lang], lang, savePath);
			setMap[lang] = sets;
			counterMap[lang] = cts;
		}
		return [setMap, counterMap];
	}
}

export const strings = new Strings();
