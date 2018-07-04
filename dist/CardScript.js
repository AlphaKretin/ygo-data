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
    update() {
        return new Promise((resolve, reject) => {
            if (this.data) {
                return resolve();
            }
            GitHub.repos
                .getContent(this.source)
                .then(content => {
                for (const key in content.data) {
                    if (content.data.hasOwnProperty(key)) {
                        const file = content.data[key];
                        if (file.name === "c" + this.code + ".lua") {
                            this.data = file;
                            return resolve();
                        }
                    }
                }
                reject("Could not find script for " + this.code + "!");
            })
                .catch(e => reject(e));
        });
    }
    get url() {
        return new Promise((resolve, reject) => {
            this.update()
                .then(() => resolve(this.data.data.html_url))
                .catch(e => reject(e));
        });
    }
    get content() {
        return new Promise((resolve, reject) => {
            this.update()
                .then(() => resolve(this.data.data.content))
                .catch(e => reject(e));
        });
    }
    get contentLines() {
        return new Promise((resolve, reject) => {
            this.update()
                .then(() => {
                const lines = this.data.data.content.split(/\R/);
                const len = lines.length.toString().length;
                const script = lines.map((l, i) => (i + 1).toString().padStart(len, " ") + "|" + l).join("\n");
                resolve(script);
            })
                .catch(e => reject(e));
        });
    }
}
exports.CardScript = CardScript;
//# sourceMappingURL=CardScript.js.map