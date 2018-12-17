export interface ICardTextRaw {
    name: string;
    desc: string;
    string1: string;
    string2: string;
    string3: string;
    string4: string;
    string5: string;
    string6: string;
    string7: string;
    string8: string;
    string9: string;
    string10: string;
    string11: string;
    string12: string;
    string13: string;
    string14: string;
    string15: string;
    string16: string;
}

interface ICardDesc {
    pendHead?: string;
    pendBody?: string;
    monsterHead?: string;
    monsterBody: string;
}

export class CardText {
    public readonly name: string;
    public readonly strings: string[];
    private literalDesc: string;
    constructor(dbData: ICardTextRaw) {
        this.name = dbData.name;
        this.literalDesc = dbData.desc;
        this.strings = [];
    }

    private getPText(): string[] {
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

    get desc(): ICardDesc {
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
