"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Translation {
	constructor(name, raw) {
		this.lang = name;
		this.type = raw.type;
		this.race = raw.race;
		this.attribute = raw.attribute;
		this.ot = raw.ot;
		this.category = raw.category;
	}
	getType(t) {
		return this.type[t];
	}
	getRace(r) {
		return this.race[r];
	}
	getAttribute(a) {
		return this.attribute[a];
	}
	getOT(o) {
		return this.ot[o];
	}
	getCategory(c) {
		return this.category[c];
	}
}
exports.Translation = Translation;
//# sourceMappingURL=Translation.js.map