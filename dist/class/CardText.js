"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardText = void 0;
class CardText {
    constructor(dbData) {
        this.name = dbData.name;
        this.literalDesc = dbData.desc;
        this.strings = [];
        this.strings.push(dbData.string1, dbData.string2, dbData.string3, dbData.string4, dbData.string5, dbData.string6, dbData.string7, dbData.string8, dbData.string9, dbData.string10, dbData.string11, dbData.string12, dbData.string13, dbData.string14, dbData.string15, dbData.string16);
    }
    getPText() {
        // english regex from https://github.com/247321453/DataEditorX/blob/master/DataEditorX/data/mse_English.txt#L25
        const ENG_PEND_REG = /\[ (Pendulum Effect|Skill Activation) \]\s*[\r\n|\r|\n](?:-n\/a-)*([\S\s]*?)[\r\n|\r|\n]---/;
        const ENG_MON_REG = /\[ (Monster Effect|Flavor Text|Effect) \]\s*[\r\n|\r|\n]([\S\s]*)/;
        const engPendResult = ENG_PEND_REG.exec(this.literalDesc);
        if (engPendResult) {
            const pendHead = engPendResult[1].trim();
            let pendEff = engPendResult[2].trim();
            if (pendEff.length < 1) {
                pendEff = "[no card text]";
            }
            let monHead = "";
            let monText = "";
            const engMonResult = ENG_MON_REG.exec(this.literalDesc);
            if (engMonResult) {
                monHead = engMonResult[1].trim();
                monText = engMonResult[2].trim();
            }
            if (monHead.length < 1) {
                monHead = "Card Text";
            }
            if (monText.length < 1) {
                monText = "[no card text]";
            }
            return [pendHead, pendEff, monHead, monText];
        }
        // jpn regex from https://github.com/247321453/DataEditorX/blob/master/DataEditorX/data/mse_Japanese.txt#L27
        const JPN_PEND_REG = /】[\s\S]*?[\r\n|\r|\n]([\S\s]*?)[\r\n|\r|\n]【/;
        const JPN_MON_REG = /[\r\n|\r|\n]【([\S\s]*?[果|介|述|報])】[\r\n|\r|\n]([\S\s]*)/;
        const jpnPendResult = JPN_PEND_REG.exec(this.literalDesc);
        if (jpnPendResult) {
            let pendEff = jpnPendResult[1].trim();
            if (pendEff.length < 1) {
                pendEff = "テキストなし";
            }
            let monHead = "";
            let monText = "";
            const jpnMonResult = JPN_MON_REG.exec(this.literalDesc);
            if (jpnMonResult) {
                monHead = jpnMonResult[1].trim();
                monText = jpnMonResult[2].trim();
            }
            if (monHead.length < 1) {
                monHead = "テキスト";
            }
            if (monText.length < 1) {
                monText = "テキストなし";
            }
            return ["Ｐ効果", pendEff, monHead, monText];
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