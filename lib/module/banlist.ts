import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";
import { getGithub } from "./github";

interface LFList {
	[code: number]: number;
}

interface ListList {
	[name: string]: LFList;
}

class Banlist {
	private lflist?: Promise<ListList>;

	public async getStatus(code: number, list: string): Promise<number | undefined> {
		if (!this.lflist) {
			throw new Error("Banlist not loaded!");
		}
		const lf = await this.lflist;
		const listName = Object.keys(lf).find(k => k.includes(list));
		return listName && code in lf[listName] ? lf[listName][code] : 3;
	}

	public update(repo: Octokit.ReposGetContentsParams, gitAuth?: string): Promise<ListList> {
		return (this.lflist = this.load(repo, gitAuth));
	}

	private parseSingleBanlist(lflistConf: string): LFList {
		const file = lflistConf.split(/\n|\r|\r\n/);
		const list: LFList = {};
		for (const line of file) {
			if (!line.startsWith("#")) {
				const bits = line.split(" ");
				const id = parseInt(bits[0], 10);
				const lim = parseInt(bits[1], 10);
				list[id] = lim;
			}
		}
		return list;
	}

	private async load(repo: Octokit.ReposGetContentsParams, gitAuth?: string): Promise<ListList> {
		const list: ListList = {};
		const github = getGithub(gitAuth);
		const res = await github.repos.getContents(repo);
		const contents = res.data;
		if (contents instanceof Array) {
			for (const file of contents) {
				if (file.name.endsWith("lflist.conf") && file.download_url) {
					const dl = await fetch(file.download_url);
					list[file.name.split(".")[0]] = this.parseSingleBanlist(await dl.text());
				}
			}
		} else if (contents.name.endsWith("lflist.conf") && contents.download_url) {
			const dl = await fetch(contents.download_url);
			list[contents.name.split(".")[0]] = this.parseSingleBanlist(await dl.text());
		}
		return list;
	}
}

export const banlist = new Banlist();
