import * as octokit from "@octokit/rest";
import * as fs from "fs";
import * as request from "request";
import * as sqlite from "sqlite";
import { Card } from "./Card";
const GitHub = new octokit();

const reflect = (p) => p.then((v) => ({ v, status: true }), (e) => ({ e, status: false }));

function loadDB(file: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        sqlite.open(file).then((db) => {
            db.all("select * from datas,texts where datas.id=texts.id").then((data) => {
                resolve(data);
            }, (err) => reject(err));
        }, (err) => reject(err));
    });
}

function downloadDB(file, name): Promise<null> {
    return new Promise((resolve, reject) => {
        const path = "dbs/" + name + "/" + file.name;
        request(file.download_url, (err, _, body) => {
            if (err) {
                reject(err);
            } else {
                fs.writeFile(path, body, er => {
                    if (er) {
                        reject(er);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

function downloadRepo(repo: string, name: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const arr: string[] = repo.split("/");
        const arg: any = {
            owner: arr[0],
            repo: arr[1],
        };
        if (arr.length > 2) {
            arg.path = arr.slice(2).join("/");
        }
        GitHub.repos.getContent(arg).then((res) => {
            const filenames = [];
            const promises = [];
            for (const key in res.data) {
                if (res.data.hasOwnProperty(key)) {
                    const file = res.data[key];
                    if (file.name.endsWith(".cdb")) {
                        promises.push(downloadDB(file, name).then(() => filenames.push(file.name)));
                    }
                }

            }
            Promise.all(promises.map(reflect)).then((results) => {
                results.forEach((result) => {
                    if (!result.status) {
                        console.error("Error downloading database from repo " + repo + "!");
                        console.error(result);
                    }
                });
                resolve(filenames);
            }).catch((e) => reject(e));
        }).catch((e) => reject(e));
    });
}

interface ILanguageDataPayload {
    cards: { [n: number]: Card };
    setcodes: { [s: string]: string };
    counters: { [s: string]: string };
}

export class Language {
    public static prepareData(name, config): Promise<ILanguageDataPayload> {
        return new Promise((resolve, reject) => {
            const data: ILanguageDataPayload = {
                cards: {},
                counters: {},
                setcodes: {},
            };
            const path = "dbs/" + name + "/";
            if ("stringsConf" in config) {
                request(config.stringsConf, (err, _, body) => {
                    if (err) {
                        console.error("Error downloading setcodes and counters!");
                        console.error(err);
                    } else {
                        for (const line of body.split(/\R/)) {
                            if (line.startsWith("!setname")) {
                                const code = line.split(" ")[1];
                                const nam = line.slice(line.indexOf(code) + code.length + 1);
                                data.setcodes[code] = nam;
                            }
                            if (line.startsWith("!counter")) {
                                const code = line.split(" ")[1];
                                const nam = line.slice(line.indexOf(code) + code.length + 1);
                                data.counters[code] = nam;
                            }
                        }
                    }
                });
            }
            if ("localDBs" in config) {
                config.localDBs.forEach((file) => loadDB(path + file).then(dat => {
                    for (const cardData of dat) {
                        const card = new Card(cardData, [file]);
                        if (card.code in data.cards) {
                            const dbs = card.dbs;
                            dbs.push(file);
                            card.dbs = dbs;
                        }
                        data.cards[card.code] = card;
                    }
                }, (err) => {
                    console.error("Could not load database " + file + "!");
                    console.error(err);
                }));
            }
            if ("remoteDBs" in config) {
                config.remoteDBs.forEach((repo) => {
                    downloadRepo(repo, name).then((files) => {
                        files.forEach((file) => loadDB(path + file).then(dat => {
                            for (const cardData of dat) {
                                const card = new Card(cardData, [file]);
                                if (card.code in data.cards) {
                                    const dbs = card.dbs;
                                    dbs.push(file);
                                    card.dbs = dbs;
                                }
                                data.cards[card.code] = card;
                            }
                        }, err => {
                            console.error("Could not load database " + file + "!");
                            console.error(err);
                        }));
                        // delete unused databases
                        fs.readdir("dbs/" + name, (err, res) => {
                            if (err) {
                                console.error(err);
                            } else {
                                res.filter((f) => !files.includes(f)).forEach((f) => {
                                    fs.unlinkSync("dbs/" + name + "/" + f);
                                });
                            }
                        });
                    });
                });
            }
        });
    }
    public cards: { [n: number]: Card };
    public setcodes: { [s: string]: string };
    public counters: { [s: string]: string };
    constructor(name, data) {
        "";
    }
}
