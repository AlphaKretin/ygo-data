export class Card {
    code: number;
    dbs: Array<string>;
    constructor(data, file) {
        this.code = data[0];
        this.dbs = file;
    }
}