import { Card } from "./Card";
import * as octokit from "@octokit/rest";
import * as sqlite from "sqlite";
import * as request from "request";
import * as fs from "fs";
const GitHub = new octokit();

const reflect = p => p.then(v => ({v, status: true}), e => ({e, status: false}));

function loadDB(file: string): Promise<any> {
    return new Promise ((resolve, reject) => {
        sqlite.open(file).then(db => {
            db.all("select * from datas,texts where datas.id=texts.id").then(data => {
                resolve(data);
            }, err => reject(err));
        }, err => reject(err));
    });
}

function downloadDB(file, name) {
    return new Promise((resolve, reject) => {
        let path = "dbs/" + name + "/" + file.name;
        request(file.download_url, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                fs.writeFile(path, body, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

function downloadRepo(repo: string, name: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        let arr: Array<string> = repo.split("/");
        let arg: any = {
            owner: arr[0],
            repo: arr[1]
        }
        if (arr.length > 2) {
            arg["path"] = arr.slice(2).join("/");
        }
        GitHub.repos.getContent(arg).then(res => {        
            let filenames = [];
			let promises = [];
			for (let key in res.data)  {
                let file = res.data[key];
				if (file.name.endsWith(".cdb")) {
					promises.push(downloadDB(file, name).then(() => filenames.push(file.name)));
				}
			}
			Promise.all(promises.map(reflect)).then(results => {
                results.forEach(result => {
                    if (!result.status) {
                        console.error("Error downloading database from repo " + repo + "!");
                        console.error(result);
                    }
                });
                resolve(filenames);
            }).catch(e => reject(e));
        }).catch(e => reject(e));
    });
}

export class Language {
    cards: { [ n : number ] : Card };
    setcodes: { [ s: string ] : string };
    constructor(name, config) {
        let path = "dbs/" + name + "/";
        if ("setcodeSource" in config) {
            
        }
        if ("localDBs" in config) {
            config.localDBs.forEach(file => loadDB(path + file).then(data => {
                for (let cardData of data) {
                    let card = new Card(cardData, [ file ]);
                    if (card.code in this.cards) {
                        let dbs = card.dbs;
                        dbs.push(file);
                        card.dbs = dbs;
                    }
                    this.cards[card.code] = card;
                }
            }, err => {
                console.error("Could not load database " + file + "!");
                console.error(err);
            }));
        }
        if ("remoteDBs" in config) {
            config.remoteDBs.forEach(repo => {
                downloadRepo(repo, name).then(files => {
                    files.forEach(file => loadDB(path + file).then(data => {
                        for (let cardData of data) {
                            let card = new Card(cardData, [ file ]);
                            if (card.code in this.cards) {
                                let dbs = card.dbs;
                                dbs.push(file);
                                card.dbs = dbs;
                            }
                            this.cards[card.code] = card;
                        }
                    }, err => {
                        console.error("Could not load database " + file + "!");
                        console.error(err);
                    }));
                    //delete unused databases
                    fs.readdir("dbs/" + name, (err, res) => {
                        if (err) {
                            console.error(err);
                        } else {
                            res.filter(f => !files.includes(f)).forEach(f => {
                                fs.unlinkSync("dbs/" + name + "/" + f);
                            });
                        }
                    });
                });
            });
        }
    }
}