import fetch from "node-fetch";

class Banlist {
	private lflist?: Promise<{ [list: string]: { [code: number]: number } }>;

	public async getStatus(code: number, list: string): Promise<number | undefined> {
		if (!this.lflist) {
			throw new Error("Banlist not loaded!");
		}
		const lf = await this.lflist;
		if (!(list in lf)) {
			return undefined;
		}
		return code in lf[list] ? lf[list][code] : 3;
	}

	public update(url: string): Promise<{ [list: string]: { [code: number]: number } }> {
		return (this.lflist = this.load(url));
	}

	private async load(url: string): Promise<{ [list: string]: { [code: number]: number } }> {
		const lflistConf = await (await fetch(url)).text();
		const file = lflistConf.split(/\n|\r|\r\n/);
		const list: { [list: string]: { [code: number]: number } } = {};
		let curList: string | undefined;
		for (const line of file) {
			if (line.startsWith("!")) {
				const name: string[] = line.split(" ");
				name.shift();
				curList = name.join(" ");
			} else if (!line.startsWith("#")) {
				const bits = line.split(" ");
				const id = parseInt(bits[0], 10);
				const lim = parseInt(bits[1], 10);
				if (!isNaN(id) && !isNaN(lim) && curList) {
					if (!(curList in list)) {
						list[curList] = {};
					}
					list[curList][id] = lim;
				}
			}
		}
		return list;
	}
}

export const banlist = new Banlist();
