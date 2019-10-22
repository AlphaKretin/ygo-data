"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
class Counters {
    async getCounter(counter, lang) {
        if (!this.counters) {
            throw new Error("Counter list not loaded!");
        }
        const list = await this.counters;
        return list[lang][counter];
    }
    async reverseCounter(name, lang) {
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
    update(conf) {
        return (this.counters = this.load(conf));
    }
    async loadConf(url) {
        const re = /!counter (0x[\da-fA-F]+) (.+)/g;
        const stringsConf = await (await node_fetch_1.default(url)).text();
        const file = stringsConf.split(/\n|\r|\r\n/);
        const list = {};
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
    async load(conf) {
        const map = {};
        for (const lang in conf) {
            const ct = await this.loadConf(conf[lang]);
            map[lang] = ct;
        }
        return map;
    }
}
exports.counters = new Counters();
//# sourceMappingURL=counters.js.map