"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
class Setcodes {
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
            if (list[lang].hasOwnProperty(code)) {
                if (list[lang][code].toLowerCase().trim() === query) {
                    return parseInt(code, 10);
                }
            }
        }
    }
    update(conf) {
        return (this.codes = this.load(conf));
    }
    async loadConf(url) {
        const re = /!setname (0x[\da-fA-F]+) (.+)/g;
        const stringsConf = await request(url);
        const file = stringsConf.split(/\n|\r|\r\n/);
        const list = {};
        for (const line of file) {
            const result = re.exec(line);
            if (result !== null) {
                const setcode = parseInt(result[1], 16);
                const archetype = result[2];
                list[setcode] = archetype;
            }
        }
        return list;
    }
    async load(conf) {
        const map = {};
        for (const lang in conf) {
            if (conf.hasOwnProperty(lang)) {
                const sc = await this.loadConf(conf[lang]);
                map[lang] = sc;
            }
        }
        return map;
    }
}
exports.setcodes = new Setcodes();
//# sourceMappingURL=setcodes.js.map