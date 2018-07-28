"use strict";
const expect = require("chai").expect;
const ygoData = require("../dist/Driver.js").Driver;
const ygoSettings = {
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
        stringsConf: "https://raw.githubusercontent.com/moecube/ygopro-database/master/locales/en-US/strings.conf",
        remoteDBs: [
            {
                owner: "Ygoproco",
                repo: "Live2017Links",
                path: ""
            }
        ],
        fuseSettings: {
            keys: ["name"]
        }
    }
};
describe("Testing with ID", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const index = await ygoData.build(ygoSettings);
        const card = await new Promise((resolve, reject) => {
            index
                .getCard(43694650, "en")
                .then(function(card) {
                    resolve(card);
                })
                .catch(function(e) {
                    reject(e);
                });
        });
        expect(card.name).to.equal("Danger!? Jackalope?");
    });
});
describe("Testing with name", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const index = await ygoData.build(ygoSettings);
        const card = await new Promise((resolve, reject) => {
            index
                .getCard("Danger!? Jackalope?", "en")
                .then(function(card) {
                    resolve(card);
                })
                .catch(function(e) {
                    reject(e);
                });
        });
        expect(card.name).to.equal("Danger!? Jackalope?");
    });
});
