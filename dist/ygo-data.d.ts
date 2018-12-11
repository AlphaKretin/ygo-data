import { Card } from "./class/Card";
export default class YgoData {
    readonly langs: string[];
    private fuseOpts;
    private fuses;
    constructor(configPath: string, savePath: string);
    getCard(id: number | string, lang?: string): Promise<Card | undefined>;
    getCardList(): Promise<{
        [id: number]: Card;
    }>;
    private getFuse;
}
