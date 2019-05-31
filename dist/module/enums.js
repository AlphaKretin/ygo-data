"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CardOT;
(function (CardOT) {
    CardOT[CardOT["OT_OCG"] = 1] = "OT_OCG";
    CardOT[CardOT["OT_TCG"] = 2] = "OT_TCG";
    CardOT[CardOT["OT_ANIME"] = 4] = "OT_ANIME";
    CardOT[CardOT["OT_ILLEGAL"] = 8] = "OT_ILLEGAL";
    CardOT[CardOT["OT_VIDEO_GAME"] = 16] = "OT_VIDEO_GAME";
    CardOT[CardOT["OT_CUSTOM"] = 32] = "OT_CUSTOM";
})(CardOT = exports.CardOT || (exports.CardOT = {}));
var CardType;
(function (CardType) {
    CardType[CardType["TYPE_MONSTER"] = 1] = "TYPE_MONSTER";
    CardType[CardType["TYPE_SPELL"] = 2] = "TYPE_SPELL";
    CardType[CardType["TYPE_TRAP"] = 4] = "TYPE_TRAP";
    CardType[CardType["TYPE_NORMAL"] = 16] = "TYPE_NORMAL";
    CardType[CardType["TYPE_EFFECT"] = 32] = "TYPE_EFFECT";
    CardType[CardType["TYPE_FUSION"] = 64] = "TYPE_FUSION";
    CardType[CardType["TYPE_RITUAL"] = 128] = "TYPE_RITUAL";
    CardType[CardType["TYPE_TRAPMONSTER"] = 256] = "TYPE_TRAPMONSTER";
    CardType[CardType["TYPE_SPIRIT"] = 512] = "TYPE_SPIRIT";
    CardType[CardType["TYPE_UNION"] = 1024] = "TYPE_UNION";
    CardType[CardType["TYPE_DUAL"] = 2048] = "TYPE_DUAL";
    CardType[CardType["TYPE_TUNER"] = 4096] = "TYPE_TUNER";
    CardType[CardType["TYPE_SYNCHRO"] = 8192] = "TYPE_SYNCHRO";
    CardType[CardType["TYPE_TOKEN"] = 16384] = "TYPE_TOKEN";
    CardType[CardType["TYPE_QUICKPLAY"] = 65536] = "TYPE_QUICKPLAY";
    CardType[CardType["TYPE_CONTINUOUS"] = 131072] = "TYPE_CONTINUOUS";
    CardType[CardType["TYPE_EQUIP"] = 262144] = "TYPE_EQUIP";
    CardType[CardType["TYPE_FIELD"] = 524288] = "TYPE_FIELD";
    CardType[CardType["TYPE_COUNTER"] = 1048576] = "TYPE_COUNTER";
    CardType[CardType["TYPE_FLIP"] = 2097152] = "TYPE_FLIP";
    CardType[CardType["TYPE_TOON"] = 4194304] = "TYPE_TOON";
    CardType[CardType["TYPE_XYZ"] = 8388608] = "TYPE_XYZ";
    CardType[CardType["TYPE_PENDULUM"] = 16777216] = "TYPE_PENDULUM";
    CardType[CardType["TYPE_SPSUMMON"] = 33554432] = "TYPE_SPSUMMON";
    CardType[CardType["TYPE_LINK"] = 67108864] = "TYPE_LINK";
    CardType[CardType["TYPE_ARMOR"] = 268435456] = "TYPE_ARMOR";
    CardType[CardType["TYPE_PLUS"] = 536870912] = "TYPE_PLUS";
    CardType[CardType["TYPE_MINUS"] = 1073741824] = "TYPE_MINUS";
})(CardType = exports.CardType || (exports.CardType = {}));
// TYPES_NORTUNER = 0x1011
// TYPES_EFFTUNER = 0x1021
// TYPES_EFFPEND = 0x1000021
// TYPES_EFFSYNC = 0x2021
// TYPES_TOKEN = 0x4011
var CardAttribute;
(function (CardAttribute) {
    CardAttribute[CardAttribute["ATTRIBUTE_EARTH"] = 1] = "ATTRIBUTE_EARTH";
    CardAttribute[CardAttribute["ATTRIBUTE_WATER"] = 2] = "ATTRIBUTE_WATER";
    CardAttribute[CardAttribute["ATTRIBUTE_FIRE"] = 4] = "ATTRIBUTE_FIRE";
    CardAttribute[CardAttribute["ATTRIBUTE_WIND"] = 8] = "ATTRIBUTE_WIND";
    CardAttribute[CardAttribute["ATTRIBUTE_LIGHT"] = 16] = "ATTRIBUTE_LIGHT";
    CardAttribute[CardAttribute["ATTRIBUTE_DARK"] = 32] = "ATTRIBUTE_DARK";
    CardAttribute[CardAttribute["ATTRIBUTE_DEVINE"] = 64] = "ATTRIBUTE_DEVINE";
    CardAttribute[CardAttribute["ATTRIBUTE_LAUGH"] = 128] = "ATTRIBUTE_LAUGH";
})(CardAttribute = exports.CardAttribute || (exports.CardAttribute = {}));
var CardRace;
(function (CardRace) {
    CardRace[CardRace["RACE_WARRIOR"] = 1] = "RACE_WARRIOR";
    CardRace[CardRace["RACE_SPELLCASTER"] = 2] = "RACE_SPELLCASTER";
    CardRace[CardRace["RACE_FAIRY"] = 4] = "RACE_FAIRY";
    CardRace[CardRace["RACE_FIEND"] = 8] = "RACE_FIEND";
    CardRace[CardRace["RACE_ZOMBIE"] = 16] = "RACE_ZOMBIE";
    CardRace[CardRace["RACE_MACHINE"] = 32] = "RACE_MACHINE";
    CardRace[CardRace["RACE_AQUA"] = 64] = "RACE_AQUA";
    CardRace[CardRace["RACE_PYRO"] = 128] = "RACE_PYRO";
    CardRace[CardRace["RACE_ROCK"] = 256] = "RACE_ROCK";
    CardRace[CardRace["RACE_WINDBEAST"] = 512] = "RACE_WINDBEAST";
    CardRace[CardRace["RACE_PLANT"] = 1024] = "RACE_PLANT";
    CardRace[CardRace["RACE_INSECT"] = 2048] = "RACE_INSECT";
    CardRace[CardRace["RACE_THUNDER"] = 4096] = "RACE_THUNDER";
    CardRace[CardRace["RACE_DRAGON"] = 8192] = "RACE_DRAGON";
    CardRace[CardRace["RACE_BEAST"] = 16384] = "RACE_BEAST";
    CardRace[CardRace["RACE_BEASTWARRIOR"] = 32768] = "RACE_BEASTWARRIOR";
    CardRace[CardRace["RACE_DINOSAUR"] = 65536] = "RACE_DINOSAUR";
    CardRace[CardRace["RACE_FISH"] = 131072] = "RACE_FISH";
    CardRace[CardRace["RACE_SEASERPENT"] = 262144] = "RACE_SEASERPENT";
    CardRace[CardRace["RACE_REPTILE"] = 524288] = "RACE_REPTILE";
    CardRace[CardRace["RACE_PSYCHO"] = 1048576] = "RACE_PSYCHO";
    CardRace[CardRace["RACE_DEVINE"] = 2097152] = "RACE_DEVINE";
    CardRace[CardRace["RACE_CREATORGOD"] = 4194304] = "RACE_CREATORGOD";
    CardRace[CardRace["RACE_WYRM"] = 8388608] = "RACE_WYRM";
    CardRace[CardRace["RACE_CYBERSE"] = 16777216] = "RACE_CYBERSE";
    CardRace[CardRace["RACE_YOKAI"] = 2147483648] = "RACE_YOKAI";
    CardRace[CardRace["RACE_CHARISMA"] = 4294967296] = "RACE_CHARISMA";
})(CardRace = exports.CardRace || (exports.CardRace = {}));
var CardLinkMarker;
(function (CardLinkMarker) {
    CardLinkMarker[CardLinkMarker["LINK_MARKER_BOTTOM_LEFT"] = 1] = "LINK_MARKER_BOTTOM_LEFT";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_BOTTOM"] = 2] = "LINK_MARKER_BOTTOM";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_BOTTOM_RIGHT"] = 4] = "LINK_MARKER_BOTTOM_RIGHT";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_LEFT"] = 8] = "LINK_MARKER_LEFT";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_RIGHT"] = 32] = "LINK_MARKER_RIGHT";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_TOP_LEFT"] = 64] = "LINK_MARKER_TOP_LEFT";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_TOP"] = 128] = "LINK_MARKER_TOP";
    CardLinkMarker[CardLinkMarker["LINK_MARKER_TOP_RIGHT"] = 256] = "LINK_MARKER_TOP_RIGHT";
})(CardLinkMarker = exports.CardLinkMarker || (exports.CardLinkMarker = {}));
// Database categories, not the effect categories in constant.lua
var CardCategory;
(function (CardCategory) {
    CardCategory[CardCategory["CATEGORY_DESTROY_SPELL_TRAP"] = 1] = "CATEGORY_DESTROY_SPELL_TRAP";
    CardCategory[CardCategory["CATEGORY_DESTROY_MONSTER"] = 2] = "CATEGORY_DESTROY_MONSTER";
    CardCategory[CardCategory["CATEGORY_BANISH"] = 4] = "CATEGORY_BANISH";
    CardCategory[CardCategory["CATEGORY_GRAVEYARD"] = 8] = "CATEGORY_GRAVEYARD";
    CardCategory[CardCategory["CATEGORY_TO_HAND"] = 16] = "CATEGORY_TO_HAND";
    CardCategory[CardCategory["CATEGORY_TO_DECK"] = 32] = "CATEGORY_TO_DECK";
    CardCategory[CardCategory["CATEGORY_DISCARD"] = 64] = "CATEGORY_DISCARD";
    CardCategory[CardCategory["CATEGORY_MILL"] = 128] = "CATEGORY_MILL";
    CardCategory[CardCategory["CATEGORY_DRAW"] = 256] = "CATEGORY_DRAW";
    CardCategory[CardCategory["CATEGORY_SEARCH"] = 512] = "CATEGORY_SEARCH";
    CardCategory[CardCategory["CATEGORY_RECOVER_CARD"] = 1024] = "CATEGORY_RECOVER_CARD";
    CardCategory[CardCategory["CATEGORY_BATTLE_POSITION"] = 2048] = "CATEGORY_BATTLE_POSITION";
    CardCategory[CardCategory["CATEGORY_CHANGE_CONTROL"] = 4096] = "CATEGORY_CHANGE_CONTROL";
    CardCategory[CardCategory["CATEGORY_CHANGE_ATK_DEF"] = 8192] = "CATEGORY_CHANGE_ATK_DEF";
    CardCategory[CardCategory["CATEGORY_PIERCING"] = 16384] = "CATEGORY_PIERCING";
    CardCategory[CardCategory["CATEGORY_MULTIPLE_ATTACK"] = 32768] = "CATEGORY_MULTIPLE_ATTACK";
    CardCategory[CardCategory["CATEGORY_LIMIT_ATTACK"] = 65536] = "CATEGORY_LIMIT_ATTACK";
    CardCategory[CardCategory["CATEGORY_DIRECT_ATTACK"] = 131072] = "CATEGORY_DIRECT_ATTACK";
    CardCategory[CardCategory["CATEGORY_SPECIAL_SUMMON"] = 262144] = "CATEGORY_SPECIAL_SUMMON";
    CardCategory[CardCategory["CATEGORY_TOKEN"] = 524288] = "CATEGORY_TOKEN";
    CardCategory[CardCategory["CATEGORY_TYPE_RELATED"] = 1048576] = "CATEGORY_TYPE_RELATED";
    CardCategory[CardCategory["CATEGORY_PROPERTY_RELATED"] = 2097152] = "CATEGORY_PROPERTY_RELATED";
    CardCategory[CardCategory["CATEGORY_DAMAGE_LP"] = 4194304] = "CATEGORY_DAMAGE_LP";
    CardCategory[CardCategory["CATEGORY_RECOVER_LP"] = 8388608] = "CATEGORY_RECOVER_LP";
    CardCategory[CardCategory["CATEGORY_DESTROY"] = 16777216] = "CATEGORY_DESTROY";
    CardCategory[CardCategory["CATEGORY_TARGET"] = 33554432] = "CATEGORY_TARGET";
    CardCategory[CardCategory["CATEGORY_COUNTER"] = 67108864] = "CATEGORY_COUNTER";
    CardCategory[CardCategory["CATEGORY_GAMBLE"] = 134217728] = "CATEGORY_GAMBLE";
    CardCategory[CardCategory["CATEGORY_FUSION_RELATED"] = 268435456] = "CATEGORY_FUSION_RELATED";
    CardCategory[CardCategory["CATEGORY_TUNER_RELATED"] = 536870912] = "CATEGORY_TUNER_RELATED";
    CardCategory[CardCategory["CATEGORY_XYZ_RELATED"] = 1073741824] = "CATEGORY_XYZ_RELATED";
    CardCategory[CardCategory["CATEGORY_NEGATE"] = 2147483648] = "CATEGORY_NEGATE";
})(CardCategory = exports.CardCategory || (exports.CardCategory = {}));
//# sourceMappingURL=enums.js.map