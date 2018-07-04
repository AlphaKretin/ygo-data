# ygo-data

A Node.js module that handles Yu-Gi-Oh! card data using YGOPro's CDB format.

## Installation

```sh
npm install ygo-data --save
```

## Usage

### Javascript

```javascript
const ygoData = require("ygo-data");
const options = require("./options.json");
ygoData.build(options).then(data => {
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
import * as ygoData from "ygo-data";
const options = require("./options.json")
ygoData.build(options).then(data => {
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

All other fields should be Objects with numbers as keys, and the value the human-readable name for the corresponding constant in YGOPro with that number value.

```json
en: {
    "attributes": {
        1: "Dark"
    },
    "categories": {
        1: "Draw"
    },
    "ots": {
        1: "OCG"
    },
    "races": {
        1: "Dragon"
    },
    "types": {
        1: "Monster"
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
