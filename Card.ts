export class Card {
    public code: number;
    public dbs: string[];
    public name: string;
    constructor(data, file) {
        this.code = data[0];
        this.dbs = file;
    }
}
