export enum CardOT {
    OT_OCG = 0x1,
    OT_TCG = 0x2,
    OT_ANIME = 0x4,
    OT_ILLEGAL = 0x8,
    OT_VIDEO_GAME = 0x10,
    OT_CUSTOM = 0x20
}

export enum CardType {
    TYPE_MONSTER = 0x1,
    TYPE_SPELL = 0x2,
    TYPE_TRAP = 0x4,
    TYPE_NORMAL = 0x10,
    TYPE_EFFECT = 0x20,
    TYPE_FUSION = 0x40,
    TYPE_RITUAL = 0x80,
    TYPE_TRAPMONSTER = 0x100,
    TYPE_SPIRIT = 0x200,
    TYPE_UNION = 0x400,
    TYPE_DUAL = 0x800,
    TYPE_TUNER = 0x1000,
    TYPE_SYNCHRO = 0x2000,
    TYPE_TOKEN = 0x4000,
    TYPE_QUICKPLAY = 0x10000,
    TYPE_CONTINUOUS = 0x20000,
    TYPE_EQUIP = 0x40000,
    TYPE_FIELD = 0x80000,
    TYPE_COUNTER = 0x100000,
    TYPE_FLIP = 0x200000,
    TYPE_TOON = 0x400000,
    TYPE_XYZ = 0x800000,
    TYPE_PENDULUM = 0x1000000,
    TYPE_SPSUMMON = 0x2000000,
    TYPE_LINK = 0x4000000,
    TYPE_ARMOR = 0x10000000,
    TYPE_PLUS = 0x20000000,
    TYPE_MINUS = 0x40000000
}
// TYPES_NORTUNER = 0x1011
// TYPES_EFFTUNER = 0x1021
// TYPES_EFFPEND = 0x1000021
// TYPES_EFFSYNC = 0x2021
// TYPES_TOKEN = 0x4011

export enum CardAttribute {
    ATTRIBUTE_EARTH = 0x01,
    ATTRIBUTE_WATER = 0x02,
    ATTRIBUTE_FIRE = 0x04,
    ATTRIBUTE_WIND = 0x08,
    ATTRIBUTE_LIGHT = 0x10,
    ATTRIBUTE_DARK = 0x20,
    ATTRIBUTE_DEVINE = 0x40, // YGOPro spelling
    ATTRIBUTE_LAUGH = 0x80
}

export enum CardRace {
    RACE_WARRIOR = 0x1,
    RACE_SPELLCASTER = 0x2,
    RACE_FAIRY = 0x4,
    RACE_FIEND = 0x8,
    RACE_ZOMBIE = 0x10,
    RACE_MACHINE = 0x20,
    RACE_AQUA = 0x40,
    RACE_PYRO = 0x80,
    RACE_ROCK = 0x100,
    RACE_WINDBEAST = 0x200, // YGOPro spelling
    RACE_PLANT = 0x400,
    RACE_INSECT = 0x800,
    RACE_THUNDER = 0x1000,
    RACE_DRAGON = 0x2000,
    RACE_BEAST = 0x4000,
    RACE_BEASTWARRIOR = 0x8000,
    RACE_DINOSAUR = 0x10000,
    RACE_FISH = 0x20000,
    RACE_SEASERPENT = 0x40000,
    RACE_REPTILE = 0x80000,
    RACE_PSYCHO = 0x100000, // YGOPro spelling
    RACE_DEVINE = 0x200000, // YGOPro spelling
    RACE_CREATORGOD = 0x400000,
    RACE_WYRM = 0x800000,
    RACE_CYBERSE = 0x1000000,
    RACE_YOKAI = 0x80000000,
    RACE_CHARISMA = 0x100000000
}

export enum CardLinkMarker {
    LINK_MARKER_BOTTOM_LEFT = 0x001,
    LINK_MARKER_BOTTOM = 0x002,
    LINK_MARKER_BOTTOM_RIGHT = 0x004,
    LINK_MARKER_LEFT = 0x008,
    LINK_MARKER_RIGHT = 0x020,
    LINK_MARKER_TOP_LEFT = 0x040,
    LINK_MARKER_TOP = 0x080,
    LINK_MARKER_TOP_RIGHT = 0x100
}

// Database categories, not the effect categories in constant.lua
export enum CardCategory {
    CATEGORY_DESTROY_SPELL_TRAP = 0x1,
    CATEGORY_DESTROY_MONSTER = 0x2,
    CATEGORY_BANISH = 0x4,
    CATEGORY_GRAVEYARD = 0x8,
    CATEGORY_TO_HAND = 0x10,
    CATEGORY_TO_DECK = 0x20,
    CATEGORY_DISCARD = 0x40,
    CATEGORY_MILL = 0x80,
    CATEGORY_DRAW = 0x100,
    CATEGORY_SEARCH = 0x200,
    CATEGORY_RECOVER_CARD = 0x400,
    CATEGORY_BATTLE_POSITION = 0x800,
    CATEGORY_CHANGE_CONTROL = 0x1000,
    CATEGORY_CHANGE_ATK_DEF = 0x2000,
    CATEGORY_PIERCING = 0x4000,
    CATEGORY_MULTIPLE_ATTACK = 0x8000,
    CATEGORY_LIMIT_ATTACK = 0x10000,
    CATEGORY_DIRECT_ATTACK = 0x20000,
    CATEGORY_SPECIAL_SUMMON = 0x40000,
    CATEGORY_TOKEN = 0x80000,
    CATEGORY_TYPE_RELATED = 0x100000,
    CATEGORY_PROPERTY_RELATED = 0x200000,
    CATEGORY_DAMAGE_LP = 0x400000,
    CATEGORY_RECOVER_LP = 0x800000,
    CATEGORY_DESTROY = 0x1000000,
    CATEGORY_TARGET = 0x2000000,
    CATEGORY_COUNTER = 0x4000000,
    CATEGORY_GAMBLE = 0x8000000,
    CATEGORY_FUSION_RELATED = 0x10000000,
    CATEGORY_TUNER_RELATED = 0x20000000,
    CATEGORY_XYZ_RELATED = 0x40000000,
    CATEGORY_NEGATE = 0x80000000
}
