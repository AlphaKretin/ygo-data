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
        // english regex from https://github.com/247321453/DataEditorX/blob/master/DataEditorX/data/mse_English.txt#L25
        const ENG_PEND_REG = /\[ Pendulum Effect \]\s*\n(?:-n\/a-)*([\S\s]*?)\n---/;
        const ENG_MON_REG = /(Monster Effect|Flavor Text) \]\s*\n([\S\s]*)/;
        const engPendResult = ENG_PEND_REG.exec(this.literalDesc);
        if (engPendResult) {
            const engMonResult = ENG_MON_REG.exec(this.literalDesc);
            if (engMonResult) {
                // we expect the monster text should always exist
                // if it doesn't just continue as if not a pend and figure it out later
                return ["Pendulum Effect", engPendResult[1], engMonResult[1], engMonResult[2]];
            }
            console.error("Malformed Pend Monster text in English for %s!", this.name);
        }
        // jpn regex from https://github.com/247321453/DataEditorX/blob/master/DataEditorX/data/mse_Japanese.txt#L27
        const JPN_PEND_REG = /】[\s\S]*?\n([\S\s]*?)\n【/;
        const JPN_MON_REG = /【([\S\s]*?[果|介|述|報])】\n([\S\s]*)/;
        const jpnPendResult = JPN_PEND_REG.exec(this.literalDesc);
        if (jpnPendResult) {
            const jpnMonResult = JPN_MON_REG.exec(this.literalDesc);
            if (jpnMonResult) {
                return ["Ｐ効果", jpnPendResult[1], jpnMonResult[1], jpnMonResult[2]];
            }
            console.error("Malformed Pend Monster text in Japanese or Chinese for %s!", this.name);
        }
        // chinese regexes appear to be the same, but for posterity:
        // trad: https://github.com/247321453/DataEditorX/blob/master/DataEditorX/data/mse_Chinese-Traditional.txt#L29
        // simple: https://github.com/247321453/DataEditorX/blob/master/DataEditorX/data/mse_Chinese-Simplified.txt#L29
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