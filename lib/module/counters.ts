import * as request from "request-promise-native";

interface ISetcodesConf {
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
            if (list[lang].hasOwnProperty(counter)) {
                if (list[lang][counter].toLowerCase().trim() === query) {
                    return parseInt(counter, 10);
                }
            }
        }
    }

    public update(conf: ISetcodesConf) {
        return new Promise((resolve, reject) => {
            this.counters = this.load(conf);
            this.counters.then(resolve);
            this.counters.catch(reject);
        });
    }

    private async loadConf(url: string): Promise<{ [counter: number]: string }> {
        const re = /!counter (0x[\da-fA-F]+) (.+)/g;
        const stringsConf = await request(url);
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

    private async load(conf: ISetcodesConf): Promise<{ [lang: string]: { [counter: number]: string } }> {
        const map: { [lang: string]: { [counter: number]: string } } = {};
        for (const lang in conf) {
            if (conf.hasOwnProperty(lang)) {
                const ct = await this.loadConf(conf[lang]);
                map[lang] = ct;
            }
        }
        return map;
    }
}

export const counters = new Counters();
