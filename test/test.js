"use strict";
require("dotenv").config();
const expect = require("chai").expect;
const ygoData = require("../dist/ygo-data.js");
const cardOpts = require("./cardOpts.json");
const transOpts = require("./transOpts.json");
const miscOpts = require("./miscOpts.json");
const index = new ygoData.YgoData(cardOpts, transOpts, miscOpts, __dirname + "/dbs/", process.env.GITHUB_TOKEN);
const filter = new ygoData.Filter({
	type: [{ yes: [ygoData.enums.type.TYPE_RITUAL, ygoData.enums.type.TYPE_MONSTER] }],
	attribute: [{ yes: [ygoData.enums.attribute.ATTRIBUTE_DARK] }, { yes: [ygoData.enums.attribute.ATTRIBUTE_LIGHT] }],
	atk: { above: 1600, below: 2400 },
	level: { above: 6, below: 6 },
	race: [{ no: [ygoData.enums.race.RACE_FAIRY] }]
});

describe("Testing loading order", function () {
	it("Underclock Taker should be TCG", async function () {
		const card = await index.getCard("Underclock Taker", "en");
		expect(card.data.isOT(ygoData.enums.ot.OT_TCG)).to.be.true;
	}); // tokenisation is no longer a used strategy
	/*it("Drain Time should be tokenised", async function() {
		const card = await index.getCard("Drain Time", "en");
		expect(card.data.isType(ygoData.enums.type.TYPE_TOKEN)).to.be.true;
	});*/ it("Divine Gate should use latest name", async function () {
		const card = await index.getCard(511002326);
		expect(card.text.en.name).to.equal("Divine Gate");
	});
	it("Odd-Eyes Pendulum Dragon's pendulum heading should be updated", async function () {
		const card = await index.getCard("Odd-Eyes Pendulum Dragon", "en");
		expect(card.text.en.desc.pendHead).to.equal("Pendulum Effect");
	});
});
describe("Testing searches", function () {
	it("Name should be Danger!? Jackalope? searching with ID", async function () {
		const card = await index.getCard(43694650);
		expect(card.text.en.name).to.equal("Danger!? Jackalope?");
	});
	it("Name should be Danger!? Jackalope? searching with name", async function () {
		const card = await index.getCard("Danger!? Jackalope?", "en");
		expect(card.text.en.name).to.equal("Danger!? Jackalope?");
	});
	it("Card should be undefined searching with nonsense name", async function () {
		const card = await index.getCard("aaaaaaaaaaaaaaaaaaaaaaaaaa", "en");
		expect(card).to.be.undefined;
	});
	it("Name search should work in Japanese", async function () {
		const card = await index.getCard("オッドアイズ・ペンデュラム・ドラゴン", "ja");
		expect(card.text.en.name).to.equal("Odd-Eyes Pendulum Dragon");
	});
});
describe("Testing utilities", function () {
	it("Language list should be [en, ja]", async function () {
		const langs = index.langs;
		expect(langs).to.deep.equal(["en", "ja"]);
	});
	it("Card list should be Object", async function () {
		const cardList = await index.getCardList("en");
		expect(cardList).to.be.a("object");
	});
});
describe("Testing basic properties", function () {
	it("OT should be OCG and TCG", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.names.en.ot).to.deep.equal(["OCG", "TCG"]);
	});
	it("Race should be Beast", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.names.en.race).to.deep.equal(["Beast"]);
	});
	it("Attribute should be DARK", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.names.en.attribute).to.deep.equal(["Dark"]);
	});
	it("ATK should be 500", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.atk).to.equal(500);
	});
	it("DEF should be 2000", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.def).to.equal(2000);
	});
	it("Archetypes should be [Danger!]", async function () {
		const card = await index.getCard(43694650);
		const names = await card.data.names.en.setcode;
		expect(names).to.deep.equal(["Danger!"]);
	});
	it("Types should be Monster/Effect", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.names.en.type).to.have.members(["Monster", "Effect"]);
	});
	it("Type string should be Beast/Effect", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.names.en.typeString).to.equal("Beast/Effect");
	});
	it("Categories should be an array", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.names.en.category).to.be.a("array");
	});
	it("List of databases should be [en/cards.cdb]", async function () {
		const card = await index.getCard(43694650);
		expect(card.dbs).to.deep.equal(["en/cards.cdb"]);
	});
});
describe("Testing banlist", function () {
	it("Unlimited legal card should be OCG: 3/TCG: 3", async function () {
		const card = await index.getCard("Centerfrog", "en");
		const status = await card.status;
		expect(status).to.equal("OCG: 3/TCG: 3");
	});
	// Anime banlist removed
	/*it("Illegal card should be Illegal: 3 for anime coercion", async function() {
		const card = await index.getCard("Noritoshi, in Darkest Rainment", "en");
		const status = await card.status;
		expect(status).to.equal("Illegal: 3");
	});*/
	it("TCG-Limited card should be OCG: 2/TCG: 1", async function () {
		const card = await index.getCard("Danger! Nessie!", "en");
		const status = await card.status;
		expect(status).to.equal("OCG: 2/TCG: 1");
	});
});
describe("Testing translation", function () {
	it("Centerfrog should be 寝ガエル", async function () {
		const card = await index.getCard("Centerfrog", "en");
		expect(card.text.ja.name).to.equal("寝ガエル");
	});
});
describe("Testing string dictionary", function () {
	const tl = ygoData.translations.getTrans("en");
	it("Testing straight type search", async function () {
		const race = tl.getType(ygoData.enums.type.TYPE_RITUAL);
		expect(race).to.equal("Ritual");
	});
	it("Testing reverse type search", async function () {
		const val = tl.reverseType("Ritual");
		expect(val).to.equal(ygoData.enums.type.TYPE_RITUAL);
	});
	it("Testing straight race search", async function () {
		const race = tl.getRace(ygoData.enums.race.RACE_FAIRY);
		expect(race).to.equal("Fairy");
	});
	it("Testing reverse race search", async function () {
		const val = tl.reverseRace("Fairy");
		expect(val).to.equal(ygoData.enums.race.RACE_FAIRY);
	});
	it("Testing straight att search", async function () {
		const race = tl.getAttribute(ygoData.enums.attribute.ATTRIBUTE_DARK);
		expect(race).to.equal("Dark");
	});
	it("Testing reverse att search", async function () {
		const val = tl.reverseAttribute("Dark");
		expect(val).to.equal(ygoData.enums.attribute.ATTRIBUTE_DARK);
	});
	it("Testing straight OT search", async function () {
		const race = tl.getOT(ygoData.enums.ot.OT_TCG);
		expect(race).to.equal("TCG");
	});
	it("Testing reverse OT search", async function () {
		const val = tl.reverseOT("TCG");
		expect(val).to.equal(ygoData.enums.ot.OT_TCG);
	});
	it("Testing straight category search", async function () {
		const race = tl.getCategory(ygoData.enums.category.CATEGORY_BANISH);
		expect(race).to.equal("Banish");
	});
	it("Testing reverse OT search", async function () {
		const val = tl.reverseCategory("Banish");
		expect(val).to.equal(ygoData.enums.category.CATEGORY_BANISH);
	});
});
describe("Testing image functions", function () {
	it("Image should be a buffer", async function () {
		const card = await index.getCard(47346782);
		const image = await card.image;
		expect(image).to.be.instanceof(Buffer);
	});
	it("URL should be a string", async function () {
		const card = await index.getCard(7852510, "en");
		expect(card.imageLink).to.be.a("string");
	});
});
describe("Testing alias list", function () {
	it("Normal art's alias list should be [7852509, 7852510]", async function () {
		const card = await index.getCard("Loop of Destruction", "en");
		const codes = card.data.aliasedCards;
		expect(codes).to.deep.equal([7852509, 7852510]);
	});
	it("Alt art's alias list should be [7852509, 7852510]", async function () {
		const card = await index.getCard(7852510);
		const codes = card.data.aliasedCards;
		expect(codes).to.deep.equal([7852509, 7852510]);
	});
	it("Ra's aliases should not include 513000134 because it's anime", async function () {
		const card = await index.getCard(10000010);
		const codes = card.data.aliasedCards;
		expect(codes).to.not.include(513000134);
	});
	it("Manga Ra's aliases should be only [513000134] ignoring OCG", async function () {
		const card = await index.getCard(513000134);
		const codes = card.data.aliasedCards;
		expect(codes).to.deep.equal([513000134]);
	});
	it("Harpie Lady's alias list should have only itself, because aliases are alt arts", async function () {
		const card = await index.getCard("Harpie Lady", "en");
		const codes = card.data.aliasedCards;
		expect(codes.length).to.equal(1);
	});
	it("Polymerizations's alias list should include the alt art in this special case", async function () {
		const card = await index.getCard("Polymerization", "en");
		const codes = card.data.aliasedCards;
		expect(codes).to.deep.equal([24094653, 27847700]);
	});
});
describe("Testing card.data.is functions", function () {
	it("Is Beast should be true", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isRace(ygoData.enums.race.RACE_BEAST)).to.be.equal(true);
	});
	it("Is DARK should be true", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_DARK)).to.be.equal(true);
	});
	it("Is monster should be true", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isType(ygoData.enums.type.TYPE_MONSTER)).to.be.equal(true);
	});
	it("Is TCG should be true", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isOT(ygoData.enums.ot.OT_TCG)).to.be.equal(true);
	});
	it("Is Dragon should be false", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isRace(ygoData.enums.race.RACE_DRAGON)).to.be.equal(false);
	});
	it("Is LIGHT should be false", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_LIGHT)).to.be.equal(false);
	});
	it("Is Spell should be false", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isType(ygoData.enums.type.TYPE_SPELL)).to.be.equal(false);
	});
	it("Is Anime should be false", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.isOT(ygoData.enums.ot.OT_ANIME)).to.be.equal(false);
	});
	it("Is HERO should be true", async function () {
		const card = await index.getCard("Elemental HERO Stratos", "en");
		expect(card.data.isSetCode(0x8)).to.be.equal(true);
	});
	it("Is E HERO should be true", async function () {
		const card = await index.getCard("Elemental HERO Stratos", "en");
		expect(card.data.isSetCode(0x3008)).to.be.equal(true);
	});
	it("Is D HERO should be false", async function () {
		const card = await index.getCard("Elemental HERO Stratos", "en");
		expect(card.data.isSetCode(0xc008)).to.be.equal(false);
	});
	it("Is Neos should be false", async function () {
		const card = await index.getCard("Elemental HERO Stratos", "en");
		expect(card.data.isSetCode(0x9)).to.be.equal(false);
	});
});
describe("Testing Link/Defense interactions", function () {
	it("Link Monster should have undefined defense", async function () {
		const card = await index.getCard(1861629);
		expect(card.data.def).to.be.undefined;
	});
	it("Main Deck monster should have undefined Link Rating", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.linkMarker).to.be.undefined;
	});
	it("Decode Talker's arrows should be [↙,↘,⬆]", async function () {
		const card = await index.getCard(1861629);
		expect(card.data.linkMarker).to.deep.equal(["↙", "↘", "⬆"]);
	});
});
describe("Testing prices", function () {
	it("Anime card should have no price", async function () {
		const card = await index.getCard(513000134);
		const price = await card.price;
		expect(price).to.be.undefined;
	});
	it("Price should be an object of numbers", async function () {
		const card = await index.getCard(43694650);
		const price = await card.price;
		expect(price.low).to.be.a("number");
		expect(price.avg).to.be.a("number");
		expect(price.hi).to.be.a("number");
	});
});
describe("Testing type string", function () {
	it("Effect should come after Synchro", async function () {
		const card = await index.getCard("Junk Warrior", "en");
		expect(card.data.names.en.typeString).to.equal("Warrior/Synchro/Effect");
	});
	it("Normal should come after Tuner", async function () {
		const card = await index.getCard("Tune Warrior", "en");
		expect(card.data.names.en.typeString).to.equal("Warrior/Tuner/Normal");
	});
	it("Tuner should come after Synchro", async function () {
		const card = await index.getCard("Coral Dragon", "en");
		expect(card.data.names.en.typeString).to.equal("Dragon/Synchro/Tuner/Effect");
	});
	it("Nomi Tuner should be Special Summon/Tuner/Effect", async function () {
		const card = await index.getCard("Blackwing - Gofu the Vague Shadow", "en");
		expect(card.data.names.en.typeString).to.equal("Winged Beast/Special Summon/Tuner/Effect");
	});
});
describe("Testing shortcuts", function () {
	it("mst should alias to Mystical Space Typhoon", async function () {
		const card = await index.getCard("mst", "en");
		expect(card.text.en.name).to.equal("Mystical Space Typhoon");
	});
	it("mst in middle of name should not alias", async function () {
		const card = await index.getCard("Doomstar Magician", "en");
		expect(card.text.en.name).to.equal("Doomstar Magician");
	});
});
describe("Testing Pendulum stats", function () {
	it("Non-pendulum should have undefined scales", async function () {
		const card = await index.getCard(43694650);
		expect(card.data.lscale).to.be.undefined;
		expect(card.data.rscale).to.be.undefined;
	});
	it("OEPD should be Level 7", async function () {
		const card = await index.getCard("Odd-Eyes Pendulum Dragon", "en");
		expect(card.data.level).to.equal(7);
	});
	it("OEPD should be Scale 4", async function () {
		const card = await index.getCard("Odd-Eyes Pendulum Dragon", "en");
		expect(card.data.lscale).to.equal(4);
		expect(card.data.rscale).to.equal(4);
	});
});
describe("Testing Pendulum text", function () {
	it("Non-pend should have just monsterBody", async function () {
		const card = await index.getCard(43694650);
		expect(card.text.en.desc.monsterHead).to.be.undefined;
		expect(card.text.en.desc.pendBody).to.be.undefined;
		expect(card.text.en.desc.pendHead).to.be.undefined;
		expect(card.text.en.desc.monsterBody.length).to.be.above(450);
	});
	it("Extra Deck non-pend should have just monsterBody", async function () {
		const card = await index.getCard(31833038);
		expect(card.text.en.desc.monsterHead).to.be.undefined;
		expect(card.text.en.desc.pendBody).to.be.undefined;
		expect(card.text.en.desc.pendHead).to.be.undefined;
		expect(card.text.en.desc.monsterBody.length).to.be.above(490);
	});
	it("Pendulum should have 4 properties", async function () {
		const card = await index.getCard("Odd-Eyes Pendulum Dragon", "en");
		expect(card.text.en.desc.pendHead).to.contain("Pendulum");
		expect(card.text.en.desc.monsterHead).to.equal("Monster Effect");
		expect(card.text.en.desc.pendBody.length).to.be.below(350);
		expect(card.text.en.desc.monsterBody.length).to.be.below(125);
	});
	it("Japanese Pendulum should have 4 properties", async function () {
		const card = await index.getCard("オッドアイズ・ペンデュラム・ドラゴン", "ja");
		expect(card.text.ja.desc.pendHead).to.equal("Ｐ効果");
		expect(card.text.ja.desc.monsterHead).to.equal("モンスター効果");
		expect(card.text.ja.desc.pendBody.length).to.be.below(200);
		expect(card.text.ja.desc.monsterBody.length).to.be.below(50);
	});
	it("Should handle missing Pendulum effect", async function () {
		const card = await index.getCard(511009641);
		expect(card.text.en.desc.pendBody).to.equal("[no card text]");
	});
	it("Should handle missing Monster text", async function () {
		const card = await index.getCard(511007001);
		expect(card.text.en.desc.monsterHead).to.equal("Card Text");
		expect(card.text.en.desc.monsterBody).to.equal("[no card text]");
	});
});
describe("Testing filter system", function () {
	it("Testing parse function", async function () {
		const obj = await ygoData.Filter.parse(
			"type:spell+ritual/trap+!counter attribute:fire/light atk:1000 level:2-5 set:hero",
			"en"
		);
		expect(obj).to.deep.equal({
			type: [
				{
					yes: [ygoData.enums.type.TYPE_SPELL, ygoData.enums.type.TYPE_RITUAL],
					no: []
				},
				{
					yes: [ygoData.enums.type.TYPE_TRAP],
					no: [ygoData.enums.type.TYPE_COUNTER]
				}
			],
			attribute: [
				{ yes: [ygoData.enums.attribute.ATTRIBUTE_FIRE], no: [] },
				{ yes: [ygoData.enums.attribute.ATTRIBUTE_LIGHT], no: [] }
			],
			atk: { above: 1000, below: 1000 },
			level: { above: 2, below: 5 },
			setcode: [{ yes: [0x8], no: [] }]
		});
	});
	it("Test for D/D error", async function () {
		const obj = await ygoData.Filter.parse("set:D/D/Tindangle", "en");
		const filter = new ygoData.Filter(obj);
		const cards = await index.getCardList();
		const finalCards = filter.filter(cards);
		expect(finalCards.find(c => c.data.isSetCode(0xaf))).to.not.be.undefined;
		expect(finalCards.find(c => c.data.isSetCode(0x10b))).to.not.be.undefined;
	});
	it("Should contain only non-Fairy cards", async function () {
		const cards = await index.getCardList();
		const finalCards = filter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(finalCards.find(c => c.data.isRace(ygoData.enums.race.RACE_FAIRY))).to.be.undefined;
	});
	it("Should contain only cards that are neither LIGHT nor DARK", async function () {
		const cards = await index.getCardList();
		const finalCards = filter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(
			finalCards.find(
				c =>
					!c.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_LIGHT) &&
					!c.data.isAttribute(ygoData.enums.attribute.ATTRIBUTE_DARK)
			)
		).to.be.undefined;
	});
	it("Should contain only cards that have between 1600 and 2400 ATK", async function () {
		const cards = await index.getCardList();
		const finalCards = filter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(finalCards.find(c => c.data.atk < 1600 || c.data.atk > 2400)).to.be.undefined;
	});
	it("Should contain only cards that are Level 6", async function () {
		const cards = await index.getCardList();
		const finalCards = filter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(finalCards.find(c => c.data.level !== 6)).to.be.undefined;
	});
	it("Should contain only Ritual monsters", async function () {
		const cards = await index.getCardList();
		const finalCards = filter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(
			finalCards.find(c => !c.data.isType(ygoData.enums.type.TYPE_RITUAL) && !c.isType(ygoData.enums.type.TYPE_MONSTER))
		).to.be.undefined;
	});
	it("Should contain only HERO monsters, including E HERO etc.", async function () {
		const cards = await index.getCardList();
		const newFilter = new ygoData.Filter({
			setcode: [{ yes: [0x8], no: [] }]
		});
		const finalCards = newFilter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(finalCards.find(c => !c.data.isSetCode(0x8))).to.be.undefined;
		expect(finalCards.filter(c => c.data.isSetCode(0x3008)).length).to.be.above(0);
	});
	it("Should filter for HEROes that aren't E HEROes", async function () {
		const newFilter = await ygoData.Filter.parse("set:hero+!elemental hero", "en");
		expect(newFilter).to.deep.equal({
			setcode: [{ yes: [0x8], no: [0x3008] }]
		});
	});
	it("Should contain only HERO monsters, that are not E HERO", async function () {
		const cards = await index.getCardList();
		const newFilter = new ygoData.Filter({
			setcode: [{ yes: [0x8], no: [0x3008] }]
		});
		const finalCards = newFilter.filter(cards);
		expect(finalCards.length).to.be.above(0);
		expect(finalCards.find(c => !c.data.isSetCode(0x8))).to.be.undefined;
		expect(finalCards.find(c => c.data.isSetCode(0x3008))).to.be.undefined;
		expect(finalCards.filter(c => c.data.isSetCode(0xc008)).length).to.be.above(0);
	});
	it("Should not exclude alises such as Pacifis", async function () {
		const cards = await index.getCardList();
		const newFilter = new ygoData.Filter({
			type: [
				{
					yes: [ygoData.enums.type.TYPE_SPELL, ygoData.enums.type.TYPE_FIELD],
					no: []
				}
			]
		});
		const finalCards = newFilter.filter(cards);
		expect(finalCards.find(c => c.id === 22702055)).to.exist;
		expect(finalCards.find(c => c.id === 2819435)).to.exist;
	});
});
describe("Testing setcodes", function () {
	it("Testing straight search", async function () {
		const arch = await ygoData.strings.getCode(0x1, "en");
		expect(arch).to.equal("Ally of Justice");
	});
	it("Testing reverse search", async function () {
		const code = await ygoData.strings.reverseCode("D/D", "en");
		expect(code).to.equal(0xaf);
	});
	it("Testing local/remote merge", async function () {
		const arch = await ygoData.strings.getCode(0x4f, "en");
		expect(arch).to.equal("Dark Lucius");
	});
});
describe("Testing counters", function () {
	it("Testing straight search", async function () {
		const ct = await ygoData.strings.getCounter(0x1, "en");
		expect(ct).to.equal("Spell Counter");
	});
	it("Testing reverse search", async function () {
		const ct = await ygoData.strings.reverseCounter("Spell Counter", "en");
		expect(ct).to.equal(0x1);
	});
});
describe("Testing strings", function () {
	it("Testing card with no strings", async function () {
		const card = await index.getCard(55144522);
		expect(card.text.en.strings.length).to.be.equal(16);
		expect(card.text.en.strings[0].trim().length).to.be.equal(0);
	});
	it("Testing card with strings", async function () {
		const card = await index.getCard(10000020);
		expect(card.text.en.strings.length).to.be.equal(16);
		expect(card.text.en.strings[0].trim().length).to.be.above(0);
	});
});
describe("Test anime shortcut", function () {
	it("Should find anime card", async function () {
		const card = await index.getCard("Tindangle Acute Cerberus (Anime)", "en", true, true);
		expect(card.data.isOT(ygoData.enums.ot.OT_ANIME)).to.be.true;
	});
	it("Should exclude anime card", async function () {
		const card = await index.getCard("Tindangle Acute Cerberus (Anime)", "en", false, false);
		expect(card).to.exist;
		expect(card.data.isOT(ygoData.enums.ot.OT_ANIME)).to.be.false;
	});
});
describe("Testing Skill values", async function () {
	it("Skill Card should be Skill type", async function () {
		const card = await index.getCard("Viral Infection", "en");
		expect(card.data.isType(ygoData.enums.type.TYPE_SKILL)).to.be.true;
		expect(card.data.names.en.type).to.include("Skill");
	});
	it("Skill Card should be Speed Duel OT", async function () {
		const card = await index.getCard("Viral Infection", "en");
		expect(card.data.isOT(ygoData.enums.ot.OT_SPEED)).to.be.true;
		expect(card.data.names.en.ot).to.include("Speed Duel");
	});
	it("Skill Card should have special Race", async function () {
		const card = await index.getCard("Viral Infection", "en");
		expect(card.data.isRace(ygoData.enums.skillRace.RACE_SKILL_KAIBA)).to.be.true;
		expect(card.data.names.en.race).to.include("Kaiba");
		expect(card.data.names.en.race).to.not.include("Fiend");
	});
	it("Skill Card's Type String should go Skill, Race, Other types", async function () {
		const card = await index.getCard("It's a Toon World!", "en");
		expect(card.data.isType(ygoData.enums.type.TYPE_SKILL)).to.be.true;
		expect(card.data.isType(ygoData.enums.type.TYPE_SPELL)).to.be.true;
		expect(card.data.isType(ygoData.enums.type.TYPE_CONTINUOUS)).to.be.true;
		expect(card.data.isRace(ygoData.enums.skillRace.RACE_SKILL_PEGASUS)).to.be.true;
		expect(card.data.names.en.typeString).to.equal("Skill/Pegasus/Spell/Continuous");
	});
	/*	it("Skill Text should have 4 fields like Pendulum", async function () {
		const card = await index.getCard("Viral Infection", "en");
		const desc = card.text.en.desc;
		expect(desc.pendHead).to.equal("Skill Activation");
		expect(desc.monsterHead).to.equal("Effect");
		expect(desc.pendBody.length).to.be.above(0);
		expect(desc.monsterBody.length).to.be.above(0);
	});*/
	it("Skill Race should filter properly", async function () {
		const filterData = await ygoData.Filter.parse("race:Kaiba", "en");
		const filter = new ygoData.Filter(filterData);
		const cards = await index.getCardList();
		const results = filter.filter(cards);
		expect(results.length).to.be.greaterThan(0);
		expect(results.filter(r => r.data.isRace(ygoData.enums.skillRace.RACE_SKILL_KAIBA)).length).to.be.greaterThan(0);
		expect(results.filter(r => !r.data.isRace(ygoData.enums.skillRace.RACE_SKILL_KAIBA)).length).to.be.equal(0);
		const kaibs = results.filter(r => r.data.names.en && r.data.names.en.race.includes("Kaiba"));
		expect(kaibs.length).to.be.greaterThan(0);
	});
});
