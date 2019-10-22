import { CardArray, SimpleCard, SimpleList } from "../module/cards";
import { CardAttribute, CardCategory, CardOT, CardRace, CardType } from "../module/enums";
import { Card } from "./Card";
interface FilterProperty<T> {
    yes?: T[];
    no?: T[];
}
interface FilterData {
    attribute?: Array<FilterProperty<CardAttribute>>;
    category?: Array<FilterProperty<CardCategory>>;
    ot?: Array<FilterProperty<CardOT>>;
    race?: Array<FilterProperty<CardRace>>;
    type?: Array<FilterProperty<CardType>>;
    setcode?: Array<FilterProperty<number>>;
    level?: FilterNumberProperty;
    atk?: FilterNumberProperty;
    def?: FilterNumberProperty;
}
interface FilterNumberProperty {
    above: number;
    below: number;
}
export declare class Filter {
    static parse(input: string, lang: string): Promise<FilterData>;
    private data;
    constructor(dat: FilterData);
    filter(list: CardArray | Card[]): Card[];
    simpleFilter(list: SimpleList | SimpleCard[]): Promise<Card[]>;
    private check;
    private checkProp;
}
export {};
