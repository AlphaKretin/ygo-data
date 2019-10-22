"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cards_1 = require("../module/cards");
const filterNames_1 = require("../module/filterNames");
const setcodes_1 = require("../module/setcodes");
const ygo_data_1 = require("../ygo-data");
function previousIndexOf(s, char, index) {
    let i = index - 1;
    while (s[i] !== char && i > -1) {
        i--;
    }
    return i;
}
function nextIndexOf(s, char, index) {
    let i = index + 1;
    while (s[i] !== char && i < s.length) {
        i++;
    }
    return i >= s.length ? -1 : i;
}
function propSplit(input) {
    const out = [];
    let i = input.indexOf(":");
    while (i > -1) {
        let preIndex = previousIndexOf(input, " ", i);
        if (preIndex === -1) {
            preIndex = 0;
        }
        let postIndex;
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
function checkName(name, names) {
    for (const n of names) {
        if (n === name) {
            return true;
        }
    }
    return false;
}
const FILLER_CHAR = "Φ"; // any string that shouldn't appear in a query, for temporary find-replacing
async function parseProperty(query, f) {
    const out = [];
    // special case for D/D breaking the OR notation
    const cleanQuery = query
        .replace(/d\/d\/d/g, `d${FILLER_CHAR}d${FILLER_CHAR}d`)
        .replace(/d\/d/g, `d${FILLER_CHAR}d`);
    const ands = cleanQuery.split("/");
    for (const temp of ands) {
        // convert back from D/D special case
        const and = temp.replace(new RegExp(FILLER_CHAR, "g"), "/");
        const a = { yes: [], no: [] };
        const props = and.split("+");
        for (const prop of props) {
            if (prop.startsWith("!")) {
                const p = await f(prop.slice(1));
                if (p && a.no) {
                    a.no.push(p);
                }
            }
            else {
                const p = await f(prop);
                if (p && a.yes) {
                    a.yes.push(p);
                }
            }
        }
        out.push(a);
    }
    return out;
}
function parseNumberProperty(query) {
    const nums = query.split("-");
    if (nums.length === 1) {
        const l = parseInt(nums[0], 10);
        return { above: l, below: l };
    }
    else if (nums.length === 2) {
        return { above: parseInt(nums[0], 10), below: parseInt(nums[1], 10) };
    }
}
class Filter {
    constructor(dat) {
        this.data = dat;
    }
    static async parse(input, lang) {
        const dat = {};
        const raws = propSplit(input.toLowerCase());
        const trans = ygo_data_1.translations.getTrans(lang);
        for (const raw of raws) {
            const a = raw.split(":");
            const name = a[0];
            const query = a[1];
            if (checkName(name, filterNames_1.filterNames.attribute)) {
                dat.attribute = await parseProperty(query, s => trans.reverseAttribute(s));
            }
            if (checkName(name, filterNames_1.filterNames.category)) {
                dat.category = await parseProperty(query, s => trans.reverseCategory(s));
            }
            if (checkName(name, filterNames_1.filterNames.ot)) {
                dat.ot = await parseProperty(query, s => trans.reverseOT(s));
            }
            if (checkName(name, filterNames_1.filterNames.race)) {
                dat.race = await parseProperty(query, s => trans.reverseRace(s));
            }
            if (checkName(name, filterNames_1.filterNames.type)) {
                dat.type = await parseProperty(query, s => trans.reverseType(s));
            }
            if (checkName(name, filterNames_1.filterNames.setcode)) {
                dat.setcode = await parseProperty(query, async (s) => await setcodes_1.setcodes.reverseCode(s, lang));
            }
            if (checkName(name, filterNames_1.filterNames.level)) {
                dat.level = parseNumberProperty(query);
            }
            if (checkName(name, filterNames_1.filterNames.atk)) {
                dat.atk = parseNumberProperty(query);
            }
            if (checkName(name, filterNames_1.filterNames.def)) {
                dat.def = parseNumberProperty(query);
            }
        }
        return dat;
    }
    filter(list) {
        const output = [];
        const input = Object.values(list);
        for (const card of input) {
            if (this.check(card)) {
                output.push(card);
            }
        }
        return output;
    }
    async simpleFilter(list) {
        const output = [];
        const input = Object.values(list);
        for (const c of input) {
            const card = await cards_1.cards.getCard(c.id);
            if (card && this.check(card)) {
                output.push(card);
            }
        }
        return output;
    }
    check(c) {
        let ans = true;
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
    checkProp(prop, f) {
        let ans;
        if (prop.yes && prop.yes.length > 0) {
            for (const y of prop.yes) {
                if (ans === undefined) {
                    ans = f(y);
                }
                else {
                    ans = ans && f(y);
                }
            }
        }
        if (prop.no && prop.no.length > 0) {
            for (const n of prop.no) {
                if (ans === undefined) {
                    ans = !f(n);
                }
                else {
                    ans = ans && !f(n);
                }
            }
        }
        if (ans === undefined) {
            return false;
        }
        else {
            return ans;
        }
    }
}
exports.Filter = Filter;
//# sourceMappingURL=Filter.js.map