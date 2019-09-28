"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../module/enums");
class Translation {
    constructor(name, raw) {
        this.lang = name;
        this.type = raw.type;
        this.race = raw.race;
        this.skillRace = raw.skillRace;
        this.attribute = raw.attribute;
        this.ot = raw.ot;
        this.category = raw.category;
    }
    getType(t) {
        return this.type[t];
    }
    reverseType(s) {
        const maxType = enums_1.CardType.TYPE_MINUS;
        const q = s.toLowerCase().trim();
        let t = 1;
        while (t <= maxType) {
            const name = this.getType(t);
            if (name && name.toLowerCase().trim() === q) {
                return t;
            }
            t = t * 2;
        }
    }
    getRace(r, isSkill = false) {
        if (isSkill) {
            const sr = r;
            return this.skillRace[sr];
        }
        return this.race[r];
    }
    reverseRace(s, isSkill = false) {
        const maxRace = enums_1.CardRace.RACE_CHARISMA;
        const q = s.toLowerCase().trim();
        let r = 1;
        while (r <= maxRace) {
            const name = this.getRace(r, isSkill);
            if (name && name.toLowerCase().trim() === q) {
                return r;
            }
            r = r * 2;
        }
    }
    getAttribute(a) {
        return this.attribute[a];
    }
    reverseAttribute(s) {
        const maxAttribute = enums_1.CardAttribute.ATTRIBUTE_LAUGH;
        const q = s.toLowerCase().trim();
        let a = 1;
        while (a <= maxAttribute) {
            const name = this.getAttribute(a);
            if (name && name.toLowerCase().trim() === q) {
                return a;
            }
            a = a * 2;
        }
    }
    getOT(o) {
        return this.ot[o];
    }
    reverseOT(s) {
        const maxOT = enums_1.CardOT.OT_CUSTOM;
        const q = s.toLowerCase().trim();
        let o = 1;
        while (o <= maxOT) {
            const name = this.getOT(o);
            if (name && name.toLowerCase().trim() === q) {
                return o;
            }
            o = o * 2;
        }
    }
    getCategory(c) {
        return this.category[c];
    }
    reverseCategory(s) {
        const maxCategory = enums_1.CardCategory.CATEGORY_NEGATE;
        const q = s.toLowerCase().trim();
        let c = 1;
        while (c <= maxCategory) {
            const name = this.getCategory(c);
            if (name && name.toLowerCase().trim() === q) {
                return c;
            }
            c = c * 2;
        }
    }
}
exports.Translation = Translation;
//# sourceMappingURL=Translation.js.map