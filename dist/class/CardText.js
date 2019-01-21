"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CardText {
    constructor(dbData) {
        this.name = dbData.name;
        this.literalDesc = dbData.desc;
        this.strings = [];
        this.strings.push(dbData.string1, dbData.string2, dbData.string3, dbData.string4, dbData.string5, dbData.string6, dbData.string7, dbData.string8, dbData.string9, dbData.string10, dbData.string11, dbData.string12, dbData.string13, dbData.string14, dbData.string15, dbData.string16);
    }
    getPText() {
        const lines = this.literalDesc.split(/\r\n|\n|\r/);
        if (lines.length > 1) {
            let ind = lines.findIndex(l => l.indexOf("---") > -1);
            if (ind === -1) {
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (lines[i].indexOf("【") > -1) {
                        ind = i;
                        break;
                    }
                }
                if (ind === -1) {
                    return [this.literalDesc];
                }
                lines.splice(ind, 0, "---");
            }
            const bracketReg = /\[|\]|【|】/g;
            const head1 = lines[0].replace(bracketReg, "").trim();
            const head2 = lines
                .slice(ind + 1, ind + 2)[0]
                .replace(bracketReg, "")
                .trim();
            // a few lines are skipped because each section has headings
            return [head1, lines.slice(1, ind).join("\n"), head2, lines.slice(ind + 2).join("\n")];
        }
        return [this.literalDesc];
    }
    get desc() {
        const text = this.getPText();
        if (text.length === 1) {
            return { monsterBody: text[0] };
        }
        return {
            monsterBody: text[3],
            monsterHead: text[2],
            pendBody: text[1],
            pendHead: text[0]
        };
    }
}
exports.CardText = CardText;
//# sourceMappingURL=CardText.js.map