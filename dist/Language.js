"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const octokit = require("@octokit/rest");
const fs = require("fs");
const mkdirp = require("mkdirp");
const request = require("request");
const sqlite = require("sqlite");
const Card_1 = require("./Card");
const GitHub = new octokit();
function loadDB(file) {
    return new Promise((resolve, reject) => {
        sqlite.open(file).then(db => {
            db.all("select * from datas,texts where datas.id=texts.id").then(data => {
                resolve(data);
            }, err => reject(err));
        }, err => reject(err));
    });
}
function downloadDB(file, filePath) {
    return new Promise((resolve, reject) => {
        const fullPath = filePath + "/" + file.name;
        mkdirp(filePath, err => {
            if (err) {
                reject(err);
            }
            else {
                request({
                    encoding: null,
                    url: file.download_url
                }, (er, _, body) => {
                    if (er) {
                        reject(er);
                    }
                    else {
                        fs.writeFile(fullPath, body, e => {
                            if (e) {
                                reject(e);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                });
            }
        });
    });
}
function downloadRepo(repo, filePath) {
    return new Promise((resolve, reject) => {
        GitHub.repos
            .getContent(repo)
            .then(res => {
            const filenames = [];
            const promises = [];
            for (const key in res.data) {
                if (res.data.hasOwnProperty(key)) {
                    const file = res.data[key];
                    if (file.name.endsWith(".cdb")) {
                        promises.push(downloadDB(file, filePath).then(() => filenames.push(file.name)));
                    }
                }
            }
            Promise.all(promises)
                .then(() => {
                resolve(filenames);
            })
                .catch(e => reject(e));
        })
            .catch(e => reject(e));
    });
}
function loadSetcodes(filePath) {
    return new Promise((resolve, reject) => {
        request(filePath, (err, _, body) => {
            if (err) {
                reject(err);
            }
            else {
                const data = { setcodes: {}, counters: {} };
                for (const line of body.split(/\R/)) {
                    if (line.startsWith("!setname")) {
                        const code = line.split(" ")[1];
                        const name = line.slice(line.indexOf(code) + code.length + 1);
                        data.setcodes[code] = name;
                    }
                    if (line.startsWith("!counter")) {
                        const code = line.split(" ")[1];
                        const name = line.slice(line.indexOf(code) + code.length + 1);
                        data.counters[code] = name;
                    }
                }
                resolve(data);
            }
        });
    });
}
function loadDBs(files, filePath, lang) {
    return new Promise((resolve, reject) => {
        const cards = {};
        const proms = files.map(file => loadDB(filePath + "/" + file).then(dat => {
            for (const cardData of dat) {
                const card = new Card_1.Card(cardData, [file], lang);
                if (card.code in cards) {
                    const dbs = card.dbs;
                    dbs.push(file);
                    card.dbs = dbs;
                }
                cards[card.code] = card;
            }
        }));
        Promise.all(proms)
            .then(() => resolve(cards))
            .catch(e => reject(e));
    });
}
function downloadDBs(repos, filePath, lang) {
    return new Promise((resolve, reject) => {
        repos.forEach(repo => {
            downloadRepo(repo, filePath)
                .then(files => {
                loadDBs(files, filePath, lang)
                    .then(resolve)
                    .catch(e => reject(e));
            })
                .catch(e => reject(e));
        });
    });
}
class Language {
    // preparing the data for a language must be done asynchronously, so the intended use is to call this function,
    // then instantiate a Language object with its resolution
    static prepareData(name, config, path) {
        return new Promise((resolve, reject) => {
            const data = {
                attributes: config.attributes,
                cards: {},
                categories: config.categories,
                counters: {},
                ots: config.ots,
                races: config.races,
                setcodes: {},
                types: config.types
            };
            const filePath = path + "/dbs/" + name;
            const proms = [];
            proms.push(loadSetcodes(config.stringsConf).then(res => {
                data.counters = res.counters;
                data.setcodes = res.setcodes;
            }));
            if (config.localDBs) {
                proms.push(loadDBs(config.localDBs, filePath, data).then((cs) => {
                    for (const key in cs) {
                        if (cs.hasOwnProperty(key)) {
                            data.cards[key] = cs[key];
                        }
                    }
                }));
            }
            if (config.remoteDBs) {
                proms.push(downloadDBs(config.remoteDBs, filePath, data).then((cs) => {
                    for (const key in cs) {
                        if (cs.hasOwnProperty(key)) {
                            data.cards[key] = cs[key];
                        }
                    }
                }));
            }
            Promise.all(proms)
                .then(() => resolve(data))
                .catch(e => reject(e));
        });
    }
    static build(name, config, path) {
        return new Promise((resolve, reject) => Language.prepareData(name, config, path)
            .then(data => resolve(new Language(name, data)))
            .catch(e => reject(e)));
    }
    constructor(name, data) {
        this.name = name;
        this.cards = data.cards;
        this.setcodes = data.setcodes;
        this.counters = data.counters;
        this.ots = data.ots;
        this.types = data.types;
        this.races = data.races;
        this.attributes = data.attributes;
        this.categories = data.categories;
    }
    getCardByCode(code) {
        return new Promise((resolve, reject) => {
            if (code in this.cards) {
                resolve(this.cards[code]);
            }
            else {
                reject(new Error("Could not find card for code " + code + " in Language " + this.name + "!"));
            }
        });
    }
    getCardByName(name) {
        return new Promise((resolve, reject) => {
            const card = Object.values(this.cards).find(c => c.name.toLowerCase() === name.toLowerCase());
            if (card) {
                resolve(card);
            }
            else {
                // TODO: fuse stuff
                reject(new Error("Could not find card for query " + name + " in Language " + this.name + "!"));
            }
        });
    }
}
exports.Language = Language;
//# sourceMappingURL=Language.js.map