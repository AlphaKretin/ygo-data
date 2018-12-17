"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CardText {
    constructor(dbData) {
        this.name = dbData.name;
        this.literalDesc = dbData.desc;
        this.strings = [];
    }
    getPText() {
        const lines = this.literalDesc.split("\r\n");
        if (lines.length > 1) {
            let ind = lines.findIndex(l => l.indexOf("---") > -1);
            if (ind === -1) {
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (lines[i].indexOf("【") > -1) {
                        ind = i;
                        break;
                    }
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