"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const github_1 = require("./github");
class Banlist {
    async getStatus(code, list) {
        if (!this.lflist) {
            throw new Error("Banlist not loaded!");
        }
        const lf = await this.lflist;
        const listName = Object.keys(lf).find(k => k.includes(list));
        return listName && code in lf[listName] ? lf[listName][code] : 3;
    }
    update(repo, gitAuth) {
        return (this.lflist = this.load(repo, gitAuth));
    }
    parseSingleBanlist(lflistConf) {
        const file = lflistConf.split(/\n|\r|\r\n/);
        const list = {};
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
    async load(repo, gitAuth) {
        const list = {};
        const github = github_1.getGithub(gitAuth);
        const res = await github.repos.getContents(repo);
        const contents = res.data;
        if (contents instanceof Array) {
            for (const file of contents) {
                if (file.name.endsWith("lflist.conf") && file.download_url) {
                    const dl = await node_fetch_1.default(file.download_url);
                    list[file.name.split(".")[0]] = this.parseSingleBanlist(await dl.text());
                }
            }
        }
        else if (contents.name.endsWith("lflist.conf") && contents.download_url) {
            const dl = await node_fetch_1.default(contents.download_url);
            list[contents.name.split(".")[0]] = this.parseSingleBanlist(await dl.text());
        }
        return list;
    }
}
exports.banlist = new Banlist();
//# sourceMappingURL=banlist.js.map