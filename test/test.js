"use strict";
const expect = require("chai").expect;
const ygoData = require("../dist/Driver.js").Driver;
const ygoSettings = require("./conf.json");
let index = new ygoData(ygoSettings);

describe("Testing with ID", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.name).to.equal("Danger!? Jackalope?");
    });
});
describe("Testing with name", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const card = await index.getCard("Danger!? Jackalope?", "en");
        expect(card.name).to.equal("Danger!? Jackalope?");
    });
});
describe("Testing invalid name", function() {
    it("Should return undefined", async function() {
        const card = await index.getCard("aaaaaaaaaaaaaaaaaaaaaaaaaa", "en");
        expect(card).to.be.undefined;
    });
});
describe("Testing language list", function() {
    it("Should return [en, ja]", async function() {
        const langs = await index.langs;
        expect(langs).to.deep.equal(["en", "ja"]);
    });
});
describe("Testing card list", function() {
    it("Should return an Object", async function() {
        const cardList = await index.getCardList("en");
        expect(cardList).to.be.a("object");
    });
});
describe("Testing OT", function() {
    it("Should be TCG", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.otNames).to.deep.equal(["TCG"]);
    });
});
describe("Testing race", function() {
    it("Should be Beast", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.raceNames).to.deep.equal(["Beast"]);
    });
});
describe("Testing attribute", function() {
    it("Should be DARK", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.attributeNames).to.deep.equal(["Dark"]);
    });
});
describe("Testing ATK", function() {
    it("Should be 500", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.atk).to.equal(500);
    });
});
describe("Testing DEF", function() {
    it("Should be 2000", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.def).to.equal(2000);
    });
});
describe("Testing Setcodes", function() {
    it("Should be [Danger!]", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.setNames).to.deep.equal(["Danger!"]);
    });
});
describe("Testing types", function() {
    it("Should be Monster/Effect", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.typeNames).to.have.members(["Monster", "Effect"]);
    });
});
describe("Testing type string", function() {
    it("Should be Beast/Effect", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.typeString).to.equal("Beast/Effect");
    });
});
describe("Testing categories", function() {
    it("Should be an array", async function() {
        const card = await index.getCard(43694650, "en");
        expect(card.categoryNames).to.be.a("array");
    });
});
describe("Testing banlist", function() {
    it("Should be OCG: 3/TCG: 3", async function() {
        const card = await index.getCard("Centerfrog", "en");
        expect(card.status).to.equal("OCG: 3/TCG: 3");
    });
});
describe("Testing anime banlist coercion", function() {
    it("Should be Illegal: 3", async function() {
        const card = await index.getCard("Noritoshi, in Darkest Rainment", "en");
        expect(card.status).to.equal("Illegal: 3");
    });
});
describe("Testing translation", function() {
    it("Should be 寝ガエル", async function() {
        const card = await index.getCard("Centerfrog", "en");
        const card2 = await index.getCard(card.code, "ja");
        expect(card2.name).to.equal("寝ガエル");
    });
});
