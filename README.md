# ygopro-data

[![Build Status](https://travis-ci.org/AlphaKretin/ygo-data.svg?branch=master)](https://travis-ci.org/AlphaKretin/ygo-data) [![Coverage Status](https://coveralls.io/repos/github/AlphaKretin/ygo-data/badge.svg)](https://coveralls.io/github/AlphaKretin/ygo-data)

A Node.js module that handles Yu-Gi-Oh! card data using YGOPro's CDB format.

## Installation

```sh
npm install ygopro-data --save
```

## Usage

### Javascript

```javascript
const ygoData = require("ygopro-data").Driver;
const options = require("./options.json");
ygoData.build(options, __dirname).then(data => {
    data.getCard("Pot of Greed").then(card => {
        console.log(card.name);
    });
});
```

```sh
Output should be "Pot of Greed"
```

### TypeScript

```typescript
import { Driver as ygoData } from "ygopro-data";
const options = require("./options.json")
ygoData.build(options, __dirname).then(data => {
    data.getCard(55144522).then(card => {
        console.log(card.name);
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

The options file should be a JSON Object, with string keys representing different languages you want to support.

-   stringsConf should be a link to a YGOPro strings.conf file online that will be downloaded to name setcodes and counters.
-   localDBs should be an array of strings that are CDB files on the hard drive to load.
-   remoteDBs should be an array of Objects that are GitHub API repository paths which contain CDBs to be downloaded and remotely updated.
-   fuseOptions is an optional Object that is a valid configuration for [fuse.js](http://fusejs.io/). Note that the fuse is built from a simplified list of codes and names, so the `keys` field should only be `["name"]`.

All other fields should be Objects with numbers as keys, and the value the human-readable name for the corresponding constant in YGOPro with that number value.

```json
en: {
    "attributes": {
        "0x1": "Earth",
    },
    "categories": {
        "0x1": "Destroy Spell/Trap"
    },
    "ots": {
        "0x1": "OCG"
    },
    "races": {
        "0x1": "Warrior"
    },
    "types": {
        "0x1": "Monster"
    },
    "stringsConf": "https://raw.githubusercontent.com/Ygoproco/Live2017Links/master/strings.conf",
    "localDBs": [ "cards.cdb" ],
    "remoteDBs": [
        {
            "owner": "Ygoproco",
            "repo": "Live2017Links",
            "path": ""
        }
    ]
};
```
