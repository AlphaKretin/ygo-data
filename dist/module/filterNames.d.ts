interface IFilterNames {
    attribute: string[];
    category: string[];
    ot: string[];
    race: string[];
    type: string[];
    level: string[];
    atk: string[];
    def: string[];
    setcode: string[];
}
export declare let filterNames: IFilterNames;
export declare function updateFilterNames(input: IFilterNames): void;
export {};
