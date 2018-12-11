import * as Fuse from "fuse.js";
import { Card } from "./class/Card";
import { ISimpleCard } from "./module/cards";
declare const _default: {
    new (configPath: string, savePath: string): {
        readonly langs: string[];
        fuseOpts: Fuse.FuseOptions<ISimpleCard>;
        fuses: {
            [lang: string]: Fuse<ISimpleCard, Fuse.FuseOptions<ISimpleCard>>;
        };
        getCard(id: string | number, lang?: string | undefined): Promise<Card | undefined>;
        getCardList(): Promise<{
            [id: number]: Card;
        }>;
        getFuse(lang: string): Promise<Fuse<ISimpleCard, Fuse.FuseOptions<ISimpleCard>>>;
    };
};
export = _default;
