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
}
