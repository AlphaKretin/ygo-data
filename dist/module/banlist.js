"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
class Banlist {
    async getStatus(code, list) {
        if (!this.lflist) {
            throw new Error("Banlist not loaded!");
        }
        const lf = await this.lflist;
        if (!(list in lf)) {
            return undefined;
        }
        return code in lf[list] ? lf[list][code] : 3;
    }
    update(url) {
        return (this.lflist = this.load(url));
    }
    async load(url) {
        const lflistConf = await (await node_fetch_1.default(url)).text();
        const file = lflistConf.split(/\n|\r|\r\n/);
        const list = {};
        let curList;
        for (const line of file) {
            if (line.startsWith("!")) {
                const name = line.split(" ");
                name.shift();
                curList = name.join(" ");
            }
            else if (!line.startsWith("#")) {
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
exports.banlist = new Banlist();
//# sourceMappingURL=banlist.js.map