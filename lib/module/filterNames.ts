interface IFilterNames {
    attribute: string[];
    category: string[];
    ot: string[];
    race: string[];
    type: string[];
    level: string[];
    atk: string[];
    def: string[];
}

export let filterNames: IFilterNames = {
    atk: [],
    attribute: [],
    category: [],
    def: [],
    level: [],
    ot: [],
    race: [],
    type: []
};

export function updateFilterNames(input: IFilterNames): void {
    filterNames = input;
}
