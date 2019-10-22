interface FilterNames {
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

export let filterNames: FilterNames = {
	atk: [],
	attribute: [],
	category: [],
	def: [],
	level: [],
	ot: [],
	race: [],
	setcode: [],
	type: []
};

export function updateFilterNames(input: FilterNames): void {
	filterNames = input;
}
