"use strict";
const expect = require("chai").expect;
const ygoData = require("../dist/ygo-data.js");
let index = new ygoData(__dirname + "/conf.json", __dirname + "/dbs/");

describe("Testing with ID", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const card = await index.getCard(43694650);
        expect(card.text.en.name).to.equal("Danger!? Jackalope?");
    });
});
describe("Testing with name", function() {
    it("Should return Danger!? Jackalope?", async function() {
        const card = await index.getCard("Danger!? Jackalope?", "en");
        expect(card.text.en.name).to.equal("Danger!? Jackalope?");
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
        const card = await index.getCard(43694650);
        expect(card.data.names.ot).to.deep.equal(["TCG"]);
    });
});
describe("Testing race", function() {
    it("Should be Beast", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.race).to.deep.equal(["Beast"]);
    });
});
describe("Testing attribute", function() {
    it("Should be DARK", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.attribute).to.deep.equal(["Dark"]);
    });
});
describe("Testing ATK", function() {
    it("Should be 500", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.atk).to.equal(500);
    });
});
describe("Testing DEF", function() {
    it("Should be 2000", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.def).to.equal(2000);
    });
});
describe("Testing Setcodes", function() {
    it("Should be [Danger!]", async function() {
        const card = await index.getCard(43694650);
        expect(card.setNames).to.deep.equal(["Danger!"]);
    });
});
describe("Testing types", function() {
    it("Should be Monster/Effect", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.type).to.have.members(["Monster", "Effect"]);
    });
});
describe("Testing type string", function() {
    it("Should be Beast/Effect", async function() {
        const card = await index.getCard(43694650);
        expect(card.typeString).to.equal("Beast/Effect");
    });
});
describe("Testing categories", function() {
    it("Should be an array", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.name.category).to.be.a("array");
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
describe("Testing image download", function() {
    it("Should be a buffer", async function() {
        const card = await index.getCard(47346782);
        const image = await card.image;
        expect(image).to.be.instanceof(Buffer);
    });
});
describe("Testing alias check with name", function() {
    it("Should be [7852509, 7852510]", async function() {
        const card = await index.getCard("Loop of Destruction", "en");
        const codes = await card.codes;
        expect(codes).to.deep.equal([7852509, 7852510]);
    });
});
describe("Testing alias check with alt art's code", function() {
    it("Should be [7852509, 7852510]", async function() {
        const card = await index.getCard(7852510, "en");
        const codes = await card.codes;
        expect(codes).to.deep.equal([7852509, 7852510]);
    });
});
