import { ICardList, ISimpleCard, ISimpleList } from "../module/cards";
import { CardAttribute, CardCategory, CardOT, CardRace, CardType } from "../module/enums";
import { Card } from "./Card";
interface IFilterProperty<T> {
    yes?: T[];
    no?: T[];
}
interface IFilterData {
    attribute?: Array<IFilterProperty<CardAttribute>>;
    category?: Array<IFilterProperty<CardCategory>>;
    ot?: Array<IFilterProperty<CardOT>>;
    race?: Array<IFilterProperty<CardRace>>;
    type?: Array<IFilterProperty<CardType>>;
    setcode?: Array<IFilterProperty<number>>;
    level?: IFilterNumberProperty;
    atk?: IFilterNumberProperty;
    def?: IFilterNumberProperty;
}
interface IFilterNumberProperty {
    above: number;
    below: number;
}
export declare class Filter {
    static parse(input: string, lang: string): Promise<IFilterData>;
    private data;
    constructor(dat: IFilterData);
    filter(list: ICardList | Card[]): Card[];
    simpleFilter(list: ISimpleList | ISimpleCard[]): Promise<Card[]>;
    private check;
    private checkProp;
}
export {};
