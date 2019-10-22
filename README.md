# ygopro-data

[![Build Status](https://travis-ci.org/AlphaKretin/ygo-data.svg?branch=master)](https://travis-ci.org/AlphaKretin/ygo-data) [![Coverage Status](https://coveralls.io/repos/github/AlphaKretin/ygo-data/badge.svg?branch=master)](https://coveralls.io/github/AlphaKretin/ygo-data?branch=master&service=github)

A Node.js module that handles Yu-Gi-Oh! card data using YGOPro's CDB format.

## Installation

```sh
npm install ygopro-data --save
```

## Usage

### Javascript

```javascript
const ygoData = require("ygopro-data");
const options = require("./options.json");
const data = new ygoData.YgoData(options);
data.getCard("Pot of Greed", "en").then(card => {
	console.log(card.text["en"].name);
});
```

```sh
Output should be "Pot of Greed"
```

### TypeScript

```typescript
// exports other useful tools like the Card class, translations module, and enums module
import { YgoData } from "ygopro-data";
const options = require("./options.json");
const data = new ygoData(options);
data.getCard(55144522).then(card => {
	console.log(card.text["en"].name);
});
```

```sh
Output should be "Pot of Greed"
```

## Test

```sh
npm run test
```

## Options

The options file should be a JSON Object, with string keys representing different segments of the config.

-   `cardOpts` will control where cards are downloaded. Its value should be another object, with string keys representing languages. The value of each language will be an object that currently only has one key, `remoteDBs`, an array of Objects representing GitHub API repository download settings for repos that contain databases you want to download. Databases on the hard drive will be loaded automatically from the same location remote databases are downloaded to.

-   `stringOpts` will control where YGOPro `strings.conf` files are downloaded from, for archetypes (and in the future, counters). Its value should be an object with language keys, and URLs as string values.

-   `transOpts` will control translations of various game terms in different languages. Its value should be another language-keyed object, and language value should be an object with the following keys: `attribute`, `category`, `ot`, `race`, `type`. Each of these values will be another object, with the hexadecimal values for each property as the keys and the corresponding translation as the value.

-   `filterNames` will control what valid property names are for filter parsing. Its value should be an object with the following keys: `attribute`, `category`, `ot`, `race`, `type`, `setcode`, `level`, `atk`, `def`. The value of each of those keys should be an array of lower-case strings, filled with names for the property in any and all desired languages.

-   `shortcuts` is an optional field that contains abbreviations you want to recognise as card names. Its value is, again, a language-keyed object, and the values of that object should be an object with abbreviations in lower case as keys and the full name as values.

-   `banlist` should be a string of a URL to a YGOPro lflist.conf file, `imageLink` should be a string of a URL to which card IDs can be appended to download card images, ending in a slash, and `imageExt` should be the file extension of the images expected to be found at the `imageLink`, without the dot.

```json
{
	"cardOpts": {
		"langs": {
			"en": {
				"remoteDBs": [
					{
						"owner": "Ygoproco",
						"repo": "Live2017Links",
						"path": ""
					}
				]
			}
		}
	},
	"stringOpts": {
		"en": "https://raw.githubusercontent.com/Ygoproco/Live2017Links/master/strings.conf"
	},
	"transOpts": {
		"en": {
			"attribute": {
				"0x1": "Earth"
			},
			"category": {
				"0x1": "Destroy Spell/Trap"
			},
			"ot": {
				"0x1": "OCG"
			},
			"race": {
				"0x1": "Warrior"
			},
			"type": {
				"0x1": "Monster"
			}
		}
	},
	"shortcuts": {
		"en": {
			"mst": "Mystical Space Typhoon"
		}
	},
	"filterNames": {
		"attribute": ["att", "attribute"],
		"category": ["cat", "category"],
		"ot": ["ot", "status", "region"],
		"race": ["race", "mtype", "monstertype"],
		"type": ["type", "ctype", "cardtype"],
		"level": ["lvl", "level", "rank", "link"],
		"atk": ["atk", "attack"],
		"def": ["def", "defense", "defence"],
		"setcode": ["set", "setcode", "archetype", "series", "theme", "arch"]
	},
	"banlist": "https://raw.githubusercontent.com/Ygoproco/Live2017Links/master/lflist.conf",
	"imageLink": "https://cdn.exampleimagesite.fake/images/",
	"imageExt": "png"
}
```
