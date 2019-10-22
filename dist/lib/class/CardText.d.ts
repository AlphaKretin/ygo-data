export interface ICardTextRaw {
	name: string;
	desc: string;
	string1: string;
	string2: string;
	string3: string;
	string4: string;
	string5: string;
	string6: string;
	string7: string;
	string8: string;
	string9: string;
	string10: string;
	string11: string;
	string12: string;
	string13: string;
	string14: string;
	string15: string;
	string16: string;
}
export declare class CardText {
	readonly name: string;
	readonly desc: string;
	readonly strings: string[];
	constructor(dbData: ICardTextRaw);
}
