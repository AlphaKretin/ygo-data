import * as octokit from "@octokit/rest";
const GitHub = new octokit();

export class CardScript {
    private data: any;
    private source: octokit.ReposGetContentParams;
    private code: number;
    constructor(code: number) {
        this.code = code;
        this.source = {
            owner: "placeholder",
            path: "placeholder",
            repo: "placeholder"
        };
    }

    private async update(): Promise<void> {
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

    get url(): Promise<string> {
        return new Promise(async resolve => {
            await this.update();
            resolve(this.data.data.html_url);
        });
    }

    get content(): Promise<string> {
        return new Promise(async resolve => {
            await this.update();
            resolve(this.data.data.content);
        });
    }

    get contentLines(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            await this.update();
            const lines: string[] = this.data.data.content.split(/\R/);
            const len = lines.length.toString().length;
            const script = lines.map((l, i) => (i + 1).toString().padStart(len, " ") + "|" + l).join("\n");
            resolve(script);
        });
    }
}
