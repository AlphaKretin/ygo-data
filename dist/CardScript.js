"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const octokit = require("@octokit/rest");
const GitHub = new octokit();
class CardScript {
    constructor(code) {
        this.code = code;
        this.source = {
            owner: "placeholder",
            path: "placeholder",
            repo: "placeholder"
        };
    }
    async update() {
        if (this.data) {
            return;
        }
        const content = await GitHub.repos.getContent(this.source);
        for (const key in content.data) {
            if (content.data.hasOwnProperty(key)) {
                const file = content.data[key];
                if (file.name === "c" + this.code + ".lua") {
                    this.data = file;
                    return;
                }
                throw new Error("Could not find script for " + this.code + "!");
            }
        }
    }
    get url() {
        return new Promise(async (resolve) => {
            await this.update();
            resolve(this.data.data.html_url);
        });
    }
    get content() {
        return new Promise(async (resolve) => {
            await this.update();
            resolve(this.data.data.content);
        });
    }
    get contentLines() {
        return new Promise(async (resolve, reject) => {
            await this.update();
            const lines = this.data.data.content.split(/\R/);
            const len = lines.length.toString().length;
            const script = lines.map((l, i) => (i + 1).toString().padStart(len, " ") + "|" + l).join("\n");
            resolve(script);
        });
    }
}
exports.CardScript = CardScript;
//# sourceMappingURL=CardScript.js.map