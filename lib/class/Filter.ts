import { ICardList } from "../module/cards";
import { CardAttribute, CardCategory, CardOT, CardRace, CardType } from "../module/enums";
import { filterNames } from "../module/filterNames";
import { setcodes } from "../module/setcodes";
import { translations } from "../ygo-data";
import { Card } from "./Card";

interface IFilterProperty<T> {
    yes?: T[];
    no?: T[];
}

interface IFilterData {
    attribute?: Array<IFilterProperty<CardAttribute>>;
    category?: Array<IFilterProperty<CardCategory>>;
    ot?: Array<IFilterProperty<CardOT>>;
    race?: Array<IFilterProperty<CardRace>>;
    type?: Array<IFilterProperty<CardType>>;
    setcode?: Array<IFilterProperty<number>>;
    level?: IFilterNumberProperty;
    atk?: IFilterNumberProperty;
    def?: IFilterNumberProperty;
}

interface IFilterNumberProperty {
    above: number;
    below: number;
}

function previousIndexOf(s: string, char: string, index: number) {
    let i = index - 1;
    while (s[i] !== char && i > -1) {
        i--;
    }
    return i;
}

function nextIndexOf(s: string, char: string, index: number) {
    let i = index + 1;
    while (s[i] !== char && i < s.length) {
        i++;
    }
    return i >= s.length ? -1 : i;
}

function propSplit(input: string): string[] {
    const out = [];
    let i = input.indexOf(":");
    while (i > -1) {
        let preIndex = previousIndexOf(input, " ", i);
        if (preIndex === -1) {
            preIndex = 0;
        }
        let postIndex: number | undefined;
        const nextIndex = nextIndexOf(input, ":", i);
        if (nextIndex === -1) {
            postIndex = input.length;
        }
        if (!postIndex) {
            postIndex = previousIndexOf(input, " ", nextIndex);
            if (postIndex === -1) {
                postIndex = input.length;
            }
        }

        out.push(input.slice(preIndex, postIndex).trim());
        input = input.slice(0, preIndex) + input.slice(postIndex);
        i = input.indexOf(":");
    }
    return out;
}

function checkName(name: string, names: string[]) {
    for (const n of names) {
        if (n === name) {
            return true;
        }
    }
    return false;
}

async function parseProperty<T>(query: string, f: (s: string) => T | undefined | Promise<T | undefined>) {
    const out = [];
    const ands = query.split("/");
    for (const and of ands) {
        const a: IFilterProperty<T> = { yes: [], no: [] };
        const props = and.split("+");
        for (const prop of props) {
            if (prop.startsWith("!")) {
                const p = await f(prop.slice(1));
                if (p) {
                    a.no!.push(p);
                }
            } else {
                const p = await f(prop);
                if (p) {
                    a.yes!.push(p);
                }
            }
        }
        out.push(a);
    }
    return out;
}

function parseNumberProperty(query: string): IFilterNumberProperty | undefined {
    const nums = query.split("-");
    if (nums.length === 1) {
        const l = parseInt(nums[0], 10);
        return { above: l, below: l };
    } else if (nums.length === 2) {
        return { above: parseInt(nums[0], 10), below: parseInt(nums[1], 10) };
    }
}

export class Filter {
    public static async parse(input: string, lang: string): Promise<IFilterData> {
        const dat: IFilterData = {};
        const raws = propSplit(input.toLowerCase());
        const trans = translations.getTrans(lang);
        for (const raw of raws) {
            const a = raw.split(":");
            const name = a[0];
            const query = a[1];
            if (checkName(name, filterNames.attribute)) {
                dat.attribute = await parseProperty(query, s => trans.reverseAttribute(s));
            }
            if (checkName(name, filterNames.category)) {
                dat.category = await parseProperty(query, s => trans.reverseCategory(s));
            }
            if (checkName(name, filterNames.ot)) {
                dat.ot = await parseProperty(query, s => trans.reverseOT(s));
            }
            if (checkName(name, filterNames.race)) {
                dat.race = await parseProperty(query, s => trans.reverseRace(s));
            }
            if (checkName(name, filterNames.type)) {
                dat.type = await parseProperty(query, s => trans.reverseType(s));
            }
            if (checkName(name, filterNames.setcode)) {
                dat.setcode = await parseProperty(query, async s => await setcodes.reverseCode(s, lang));
            }
            if (checkName(name, filterNames.level)) {
                dat.level = parseNumberProperty(query);
            }
            if (checkName(name, filterNames.atk)) {
                dat.atk = parseNumberProperty(query);
            }
            if (checkName(name, filterNames.def)) {
                dat.def = parseNumberProperty(query);
            }
        }
        return dat;
    }
    private data: IFilterData;
    constructor(dat: IFilterData) {
        this.data = dat;
    }

    public filter(i: ICardList | Card[]): ICardList {
        const output: ICardList = {};
        const input = Object.values(i);
        for (const card of input) {
            if (this.check(card)) {
                output[card.id] = card;
            }
        }
        return output;
    }

    private check(c: Card): boolean {
        let ans: boolean = true;
        if (this.data.attribute) {
            let tempAns = false;
            for (const a of this.data.attribute) {
                tempAns = tempAns || this.checkProp(a, n => c.data.isAttribute(n));
            }
            ans = ans && tempAns;
        }
        if (this.data.category) {
            for (const a of this.data.category) {
                let tempAns = false;
                tempAns = tempAns || this.checkProp(a, n => c.data.isCategory(n));
                ans = ans && tempAns;
            }
        }
        if (this.data.ot) {
            let tempAns = false;
            for (const a of this.data.ot) {
                tempAns = tempAns || this.checkProp(a, n => c.data.isOT(n));
            }
            ans = ans && tempAns;
        }
        if (this.data.race) {
            let tempAns = false;
            for (const a of this.data.race) {
                tempAns = tempAns || this.checkProp(a, n => c.data.isRace(n));
            }
            ans = ans && tempAns;
        }
        if (this.data.type) {
            let tempAns = false;
            for (const a of this.data.type) {
                tempAns = tempAns || this.checkProp(a, n => c.data.isType(n));
            }
            ans = ans && tempAns;
        }
        if (this.data.setcode) {
            let tempAns = false;
            for (const a of this.data.setcode) {
                tempAns = tempAns || this.checkProp(a, n => c.data.isSetCode(n));
            }
            ans = ans && tempAns;
        }
        if (this.data.level) {
            if (!(c.data.level >= this.data.level.above && c.data.level <= this.data.level.below)) {
                return false;
            }
        }
        if (this.data.atk) {
            if (!(c.data.atk >= this.data.atk.above && c.data.atk <= this.data.atk.below)) {
                return false;
            }
        }
        if (this.data.def) {
            if (c.data.def === undefined) {
                return false;
            }
            if (!(c.data.def >= this.data.def.above && c.data.def <= this.data.def.below)) {
                return false;
            }
        }
        return ans;
    }

    private checkProp<T>(prop: IFilterProperty<T>, f: (n: T) => boolean): boolean {
        let ans: boolean | undefined;
        if (prop.yes && prop.yes.length > 0) {
            for (const y of prop.yes) {
                if (ans === undefined) {
                    ans = f(y);
                } else {
                    ans = ans && f(y);
                }
            }
        }
        if (prop.no && prop.no.length > 0) {
            for (const n of prop.no) {
                if (ans === undefined) {
                    ans = !f(n);
                } else {
                    ans = ans && !f(n);
                }
            }
        }
        if (ans === undefined) {
            return false;
        } else {
            return ans;
        }
    }
}
