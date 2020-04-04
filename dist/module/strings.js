"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("mz/fs");
const node_fetch_1 = require("node-fetch");
class Strings {
    async getCode(code, lang) {
        if (!this.codes) {
            throw new Error("Setcode list not loaded!");
        }
        const list = await this.codes;
        return list[lang][code];
    }
    async reverseCode(name, lang) {
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
    async getCounter(counter, lang) {
        if (!this.counters) {
            throw new Error("String list not loaded!");
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
    update(conf, savePath) {
        const prom = this.load(conf, savePath);
        this.codes = prom.then(list => list[0]);
        this.counters = prom.then(list => list[1]);
        return prom;
    }
    async loadConf(conf, lang, savePath) {
        let stringsConf = undefined;
        if (conf.local) {
            stringsConf = await fs.readFile(savePath + "/" + lang + "/" + conf.local, "utf8");
            if (conf.remote) {
                stringsConf += "\r\n" + (await (await node_fetch_1.default(conf.remote)).text());
            }
        }
        if (conf.remote) {
            stringsConf = await (await node_fetch_1.default(conf.remote)).text();
        }
        if (!stringsConf) {
            throw new Error("Some language has no strings defined!");
        }
        const file = stringsConf.split(/\n|\r|\r\n/);
        const setList = {};
        const counterList = {};
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
    async load(conf, savePath) {
        const setMap = {};
        const counterMap = {};
        for (const lang in conf) {
            const [sets, cts] = await this.loadConf(conf[lang], lang, savePath);
            setMap[lang] = sets;
            counterMap[lang] = cts;
        }
        return [setMap, counterMap];
    }
}
exports.strings = new Strings();
//# sourceMappingURL=strings.js.map