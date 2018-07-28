"use strict";
const expect = require("chai").expect;
const ygoData = require("../dist/Driver.js").Driver;
const ygoSettings = require("./conf.json");
let index = "fart";
async function getCard(query) {
    if (index === "fart") {
        index = await ygoData.build(ygoSettings);
    }
    const card = index.getCard(query, "en");
    return card;
}

describe("Testing with ID", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const card = await getCard(43694650);
        expect(card.name).to.equal("Danger!? Jackalope?");
    });
});
describe("Testing with name", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const card = await getCard("Danger!? Jackalope?");
        expect(card.name).to.equal("Danger!? Jackalope?");
    });
});
describe("Testing language list", function() {
    it("Should return [en]", async function() {
        if (index === "fart") {
            index = await ygoData.build(ygoSettings);
        }
        expect(index.langs).to.deep.equal(["en"]);
    });
});
describe("Testing card list", function() {
    it("Should return an Object", async function() {
        if (index === "fart") {
            index = await ygoData.build(ygoSettings);
        }
        const cardList = await index.getCardList("en");
        expect(cardList).to.be.a("object");
    });
});
describe("Testing OT", function() {
    it("Should be TCG", async function() {
        const card = await getCard(43694650);
        expect(card.otNames).to.deep.equal(["TCG"]);
    });
});
describe("Testing race", function() {
    it("Should be Beast", async function() {
        const card = await getCard(43694650);
        expect(card.raceNames).to.deep.equal(["Beast"]);
    });
});
describe("Testing attribute", function() {
    it("Should be DARK", async function() {
        const card = await getCard(43694650);
        expect(card.attributeNames).to.deep.equal(["Dark"]);
    });
});
describe("Testing ATK", function() {
    it("Should be 500", async function() {
        const card = await getCard(43694650);
        expect(card.atk).to.equal(500);
    });
});
describe("Testing DEF", function() {
    it("Should be 2000", async function() {
        const card = await getCard(43694650);
        expect(card.def).to.equal(2000);
    });
});
describe("Testing Setcodes", function() {
    it("Should be [Danger!]", async function() {
        const card = await getCard(43694650);
        expect(card.setNames).to.deep.equal(["Danger!"]);
    });
});
describe("Testing types", function() {
    it("Should be Monster/Effect", async function() {
        const card = await getCard(43694650);
        expect(card.typeNames).to.have.members(["Monster", "Effect"]);
    });
});
describe("Testing categories", function() {
    it("Should be an array", async function() {
        const card = await getCard(43694650);
        expect(card.categoryNames).to.be.a("array");
    });
});
