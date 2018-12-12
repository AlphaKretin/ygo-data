"use strict";
const expect = require("chai").expect;
const ygoData = require("../dist/ygo-data.js");
const index = new ygoData.YgoData(__dirname + "/conf.json", __dirname + "/dbs/");

describe("Testing searches", function() {
    it("Should return Danger!? Jackalope? with ID", async function() {
        const card = await index.getCard(43694650);
        expect(card.text.en.name).to.equal("Danger!? Jackalope?");
    });
    it("Should return Danger!? Jackalope? with name", async function() {
        const card = await index.getCard("Danger!? Jackalope?", "en");
        expect(card.text.en.name).to.equal("Danger!? Jackalope?");
    });
    it("Should return undefined for nonsense name", async function() {
        const card = await index.getCard("aaaaaaaaaaaaaaaaaaaaaaaaaa", "en");
        expect(card).to.be.undefined;
    });
});
describe("Testing utilities", function() {
    it("Should return [en, ja] for language list", async function() {
        const langs = await index.langs;
        expect(langs).to.deep.equal(["en", "ja"]);
    });
    it("Should return an Object for card list", async function() {
        const cardList = await index.getCardList("en");
        expect(cardList).to.be.a("object");
    });
});
describe("Testing basic properties", function() {
    it("Should be TCG", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.ot).to.deep.equal(["TCG"]);
    });
    it("Should be Beast", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.race).to.deep.equal(["Beast"]);
    });
    it("Should be DARK", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.attribute).to.deep.equal(["Dark"]);
    });
    it("Should be 500 ATK", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.atk).to.equal(500);
    });
    it("Should be 2000 DEF", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.def).to.equal(2000);
    });
    it("Should be [Danger!]", async function() {
        const card = await index.getCard(43694650);
        const names = await card.data.names.en.setcode;
        expect(names).to.deep.equal(["Danger!"]);
    });
    it("Should be Monster/Effect", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.type).to.have.members(["Monster", "Effect"]);
    });
    it("Should be Beast/Effect", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.typeString).to.equal("Beast/Effect");
    });
    it("Should be an array of categories", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.category).to.be.a("array");
    });
});
describe("Testing banlist", function() {
    it("Should be OCG: 3/TCG: 3", async function() {
        const card = await index.getCard("Centerfrog", "en");
        const status = await card.status;
        expect(status).to.equal("OCG: 3/TCG: 3");
    });
    it("Should be Illegal: 3 for anime coercion", async function() {
        const card = await index.getCard("Noritoshi, in Darkest Rainment", "en");
        const status = await card.status;
        expect(status).to.equal("Illegal: 3");
    });
});
describe("Testing translation", function() {
    it("Should be 寝ガエル", async function() {
        const card = await index.getCard("Centerfrog", "en");
        expect(card.text.ja.name).to.equal("寝ガエル");
    });
});
describe("Testing image functions", function() {
    it("Should be a buffer for image", async function() {
        const card = await index.getCard(47346782);
        const image = await card.image;
        expect(image).to.be.instanceof(Buffer);
    });
    it("Should be a string for URL", async function() {
        const card = await index.getCard(7852510, "en");
        expect(card.imageLink).to.be.a("string");
    });
});
describe("Testing alias list", function() {
    it("Should be [7852509, 7852510] normally", async function() {
        const card = await index.getCard("Loop of Destruction", "en");
        const codes = await card.aliasIDs;
        expect(codes).to.deep.equal([7852509, 7852510]);
    });
    it("Should be [7852509, 7852510] from alt art's code", async function() {
        const card = await index.getCard(7852510);
        const codes = await card.aliasIDs;
        expect(codes).to.deep.equal([7852509, 7852510]);
    });
    it("Should not include 513000134 because it's anime", async function() {
        const card = await index.getCard(10000010);
        const codes = await card.aliasIDs;
        expect(codes).to.not.include(513000134);
    });
    it("Should be only [513000134] from anime version", async function() {
        const card = await index.getCard(513000134);
        const codes = await card.aliasIDs;
        expect(codes).to.deep.equal([513000134]);
    });
});
describe("Testing card.data.is functions", function() {
    it("Should be a Beast", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isRace(ygoData.enums.race.RACE_BEAST)).to.be.equal(true);
    });
    it("Should be a DARK", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_DARK)).to.be.equal(true);
    });
    it("Should be a Monster", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isType(ygoData.enums.type.TYPE_MONSTER)).to.be.equal(true);
    });
    it("Should be TCG", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isOT(ygoData.enums.ot.OT_TCG)).to.be.equal(true);
    });
});
