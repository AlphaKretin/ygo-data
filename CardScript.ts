import * as octokit from "@octokit/rest";
const GitHub = new octokit();

export class CardScript {
    private data;
    private source: octokit.ReposGetContentParams;
    private code;
    constructor(code) {
        this.code = code;
    }

    private update(): Promise<null> {
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

    get url(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.update()
                .then(() => resolve(this.data.data.html_url))
                .catch(e => reject(e));
        });
    }

    get content(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.update()
                .then(() => resolve(this.data.data.content))
                .catch(e => reject(e));
        });
    }

    get contentLines(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.update()
                .then(() => {
                    const lines: string[] = this.data.data.content.split(/\R/);
                    const len = lines.length.toString().length;
                    const script = lines.map((l, i) => (i + 1).toString().padStart(len, " ") + "|" + l).join("\n");
                    resolve(script);
                })
                .catch(e => reject(e));
        });
    }
}
