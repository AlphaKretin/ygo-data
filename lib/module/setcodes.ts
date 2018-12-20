import * as request from "request-promise-native";

interface ISetcodesConf {
    [lang: string]: string;
}

class Setcodes {
    private codes?: Promise<{ [lang: string]: { [code: number]: string } }>;

    public async getCode(code: number, lang: string): Promise<string | undefined> {
        if (!this.codes) {
            throw new Error("Setcode list not loaded!");
        }
        const list = await this.codes;
        return list[lang][code];
    }

    public async reverseCode(name: string, lang: string): Promise<number | undefined> {
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

    public update(conf: ISetcodesConf) {
        this.codes = this.load(conf);
    }

    private async loadConf(url: string): Promise<{ [code: number]: string }> {
        const re = /!setname (0x[\da-fA-F]+) (.+)/g;
        const stringsConf = await request(url);
        const file = stringsConf.split(/\n|\r|\r\n/);
        const list: { [code: number]: string } = {};
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

    private async load(conf: ISetcodesConf): Promise<{ [lang: string]: { [code: number]: string } }> {
        const map: { [lang: string]: { [code: number]: string } } = {};
        for (const lang in conf) {
            if (conf.hasOwnProperty(lang)) {
                const sc = await this.loadConf(conf[lang]);
                map[lang] = sc;
            }
        }
        return map;
    }
}

export const setcodes = new Setcodes();
