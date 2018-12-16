"use strict";
const expect = require("chai").expect;
const ygoData = require("../dist/ygo-data.js");
const index = new ygoData.YgoData(__dirname + "/conf.json", __dirname + "/dbs/");

describe("Testing searches", function() {
    it("Name should be Danger!? Jackalope? searching with ID", async function() {
        const card = await index.getCard(43694650);
        expect(card.text.en.name).to.equal("Danger!? Jackalope?");
    });
    it("Name should be Danger!? Jackalope? searching with name", async function() {
        const card = await index.getCard("Danger!? Jackalope?", "en");
        expect(card.text.en.name).to.equal("Danger!? Jackalope?");
    });
    it("Card should be undefined searching with nonsense name", async function() {
        const card = await index.getCard("aaaaaaaaaaaaaaaaaaaaaaaaaa", "en");
        expect(card).to.be.undefined;
    });
});
describe("Testing utilities", function() {
    it("Language list should be [en, ja]", async function() {
        const langs = await index.langs;
        expect(langs).to.deep.equal(["en", "ja"]);
    });
    it("Card list should be Object", async function() {
        const cardList = await index.getCardList("en");
        expect(cardList).to.be.a("object");
    });
});
describe("Testing basic properties", function() {
    it("OT should be TCG", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.ot).to.deep.equal(["TCG"]);
    });
    it("Race should be Beast", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.race).to.deep.equal(["Beast"]);
    });
    it("Attribute should be DARK", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.attribute).to.deep.equal(["Dark"]);
    });
    it("ATK should be 500", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.atk).to.equal(500);
    });
    it("DEF should be 2000", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.def).to.equal(2000);
    });
    it("Archetypes should be [Danger!]", async function() {
        const card = await index.getCard(43694650);
        const names = await card.data.names.en.setcode;
        expect(names).to.deep.equal(["Danger!"]);
    });
    it("Types should be Monster/Effect", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.type).to.have.members(["Monster", "Effect"]);
    });
    it("Type string should be Beast/Effect", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.typeString).to.equal("Beast/Effect");
    });
    it("Categories should be an array", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.names.en.category).to.be.a("array");
    });
    it("List of databases should be [prerelease-cyho.cdb]", async function() {
        const card = await index.getCard(43694650);
        expect(card.dbs).to.deep.equal(["prerelease-cyho.cdb"]);
    });
});
describe("Testing banlist", function() {
    it("Unlimited legal card should be OCG: 3/TCG: 3", async function() {
        const card = await index.getCard("Centerfrog", "en");
        const status = await card.status;
        expect(status).to.equal("OCG: 3/TCG: 3");
    });
    it("Illegal card should be Illegal: 3 for anime coercion", async function() {
        const card = await index.getCard("Noritoshi, in Darkest Rainment", "en");
        const status = await card.status;
        expect(status).to.equal("Illegal: 3");
    });
    it("OCG-Banned card should be OCG: 0/TCG: 3", async function() {
        const card = await index.getCard("Summon Sorceress", "en");
        const status = await card.status;
        expect(status).to.equal("OCG: 0/TCG: 3");
    });
});
describe("Testing translation", function() {
    it("Centerfrog should be 寝ガエル", async function() {
        const card = await index.getCard("Centerfrog", "en");
        expect(card.text.ja.name).to.equal("寝ガエル");
    });
});
describe("Testing image functions", function() {
    it("Image should be a buffer", async function() {
        const card = await index.getCard(47346782);
        const image = await card.image;
        expect(image).to.be.instanceof(Buffer);
    });
    it("URL should be a string", async function() {
        const card = await index.getCard(7852510, "en");
        expect(card.imageLink).to.be.a("string");
    });
});
describe("Testing alias list", function() {
    it("Normal art's alias list should be [7852509, 7852510]", async function() {
        const card = await index.getCard("Loop of Destruction", "en");
        const codes = await card.aliasIDs;
        expect(codes).to.deep.equal([7852509, 7852510]);
    });
    it("Alt art's alias list should be [7852509, 7852510]", async function() {
        const card = await index.getCard(7852510);
        const codes = await card.aliasIDs;
        expect(codes).to.deep.equal([7852509, 7852510]);
    });
    it("Ra's aliases should not include 513000134 because it's anime", async function() {
        const card = await index.getCard(10000010);
        const codes = await card.aliasIDs;
        expect(codes).to.not.include(513000134);
    });
    it("Manga Ra's aliases should be only [513000134] ignoring OCG", async function() {
        const card = await index.getCard(513000134);
        const codes = await card.aliasIDs;
        expect(codes).to.deep.equal([513000134]);
    });
});
describe("Testing card.data.is functions", function() {
    it("Is Beast should be true", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isRace(ygoData.enums.race.RACE_BEAST)).to.be.equal(true);
    });
    it("Is DARK should be true", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_DARK)).to.be.equal(true);
    });
    it("Is monster should be true", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isType(ygoData.enums.type.TYPE_MONSTER)).to.be.equal(true);
    });
    it("Is TCG should be true", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isOT(ygoData.enums.ot.OT_TCG)).to.be.equal(true);
    });
    it("Is Dragon should be false", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isRace(ygoData.enums.race.RACE_DRAGON)).to.be.equal(false);
    });
    it("Is LIGHT should be false", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_LIGHT)).to.be.equal(false);
    });
    it("Is Spell should be false", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isType(ygoData.enums.type.TYPE_SPELL)).to.be.equal(false);
    });
    it("Is Anime should be false", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.isOT(ygoData.enums.ot.OT_ANIME)).to.be.equal(false);
    });
});
describe("Testing Link/Defense interactions", function() {
    it("Link Monster should have undefined defense", async function() {
        const card = await index.getCard(1861629);
        expect(card.data.def).to.be.undefined;
    });
    it("Main Deck monster should have undefined Link Rating", async function() {
        const card = await index.getCard(43694650);
        expect(card.data.linkMarker).to.be.undefined;
    });
    it("Decode Talker's arrows should be [↙,↘,⬆]", async function() {
        const card = await index.getCard(1861629);
        expect(card.data.linkMarker).to.deep.equal(["↙", "↘", "⬆"]);
    });
});
describe("Testing prices", function() {
    it("Anime card should have no price", async function() {
        const card = await index.getCard(513000134);
        const price = await card.price;
        expect(price).to.be.undefined;
    });
    it("Price should be an object of numbers", async function() {
        const card = await index.getCard(43694650);
        const price = await card.price;
        expect(price.low).to.be.a("number");
        expect(price.avg).to.be.a("number");
        expect(price.hi).to.be.a("number");
    });
});
describe("Testing type string", function() {
    it("Effect should come after Synchro", async function() {
        const card = await index.getCard("Junk Warrior", "en");
        expect(card.data.names.en.typeString).to.equal("Warrior/Synchro/Effect");
    });
    it("Normal should come after Tuner", async function() {
        const card = await index.getCard("Tune Warrior", "en");
        expect(card.data.names.en.typeString).to.equal("Warrior/Tuner/Normal");
    });
    it("Tuner should come after Synchro", async function() {
        const card = await index.getCard("Coral Dragon", "en");
        expect(card.data.names.en.typeString).to.equal("Dragon/Synchro/Tuner/Effect");
    });
    it("Nomi Tuner should be Special Summon/Tuner/Effect", async function() {
        const card = await index.getCard("Blackwing - Gofu the Vague Shadow", "en");
        expect(card.data.names.en.typeString).to.equal("Winged Beast/Special Summon/Tuner/Effect");
    });
});
