"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strings = void 0;
const fs = __importStar(require("mz/fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
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
    async loadConf(conf, lang, savePath) {
        let stringsConf = undefined;
        if (conf.local) {
            stringsConf = await fs.readFile(savePath + "/" + lang + "/" + conf.local, "utf8");
            if (conf.remote) {
                stringsConf += "\r\n" + (await (await node_fetch_1.default(conf.remote)).text());
            }
        }
        if (!stringsConf) {
            if (conf.remote) {
                stringsConf = await (await node_fetch_1.default(conf.remote)).text();
            }
            else {
                throw new Error("Some language has no strings defined!");
            }
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