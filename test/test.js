"use strict";
let expect = require("chai").expect;
let ygoData = require("../dist/Driver.js").Driver;
describe("Driver function test", function() {
    it("should return Pot of Greed", function() {
        return new Promise(function(resolve, reject) {
            ygoData
                .build({
                    en: {
                        attributes: {
                            1: "Dark"
                        },
                        categories: {
                            1: "Draw"
                        },
                        ots: {
                            1: "OCG"
                        },
                        races: {
                            1: "Dragon"
                        },
                        types: {
                            1: "Monster"
                        },
                        stringsConf:
                            "https://raw.githubusercontent.com/moecube/ygopro-database/master/locales/en-US/strings.conf",
                        remoteDBs: [
                            {
                                owner: "Ygoproco",
                                repo: "Live2017Links",
                                path: ""
                            }
                        ]
                    }
                })
                .then(index => {
                    index
                        .getCard("101005085", "en")
                        .then(function(card) {
                            expect(card.name).to.equal("Danger!? Jackalope?");
                            resolve();
                        })
                        .catch(function(e) {
                            reject(e);
                        });
                })
                .catch(function(e) {
                    console.dir(e);
                    reject(e);
                });
        });
    });
});
