import { ICardList } from "../module/cards";
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
    level?: IFilterNumberProperty;
    atk?: IFilterNumberProperty;
    def?: IFilterNumberProperty;
}
interface IFilterNumberProperty {
    above: number;
    below: number;
}
export declare class Filter {
    static parse(input: string, lang: string): IFilterData;
    private data;
    constructor(dat: IFilterData);
    filter(i: ICardList | Card[]): ICardList;
    private check;
    private checkProp;
}
export {};
