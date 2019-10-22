import fetch from "node-fetch";

interface SetcodesConf {
	[lang: string]: string;
}

class Counters {
	private counters?: Promise<{ [lang: string]: { [code: number]: string } }>;

	public async getCounter(counter: number, lang: string): Promise<string | undefined> {
		if (!this.counters) {
			throw new Error("Counter list not loaded!");
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

	public update(conf: SetcodesConf): Promise<{[lang: string]: {[counter: number]: string}}> {
		return (this.counters = this.load(conf));
	}

	private async loadConf(url: string): Promise<{ [counter: number]: string }> {
		const re = /!counter (0x[\da-fA-F]+) (.+)/g;
		const stringsConf = await (await fetch(url)).text();
		const file = stringsConf.split(/\n|\r|\r\n/);
		const list: { [counter: number]: string } = {};
		for (const line of file) {
			const result = re.exec(line);
			if (result !== null) {
				const counter = parseInt(result[1], 16);
				const counterName = result[2];
				list[counter] = counterName;
			}
		}
		return list;
	}

	private async load(conf: SetcodesConf): Promise<{ [lang: string]: { [counter: number]: string } }> {
		const map: { [lang: string]: { [counter: number]: string } } = {};
		for (const lang in conf) {
			const ct = await this.loadConf(conf[lang]);
			map[lang] = ct;
		}
		return map;
	}
}

export const counters = new Counters();
