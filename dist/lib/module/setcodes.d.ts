interface ISetcodesConf {
	[lang: string]: string;
}
declare class Setcodes {
	private codes?;
	getCode(code: number, lang: string): Promise<string | undefined>;
	update(conf: ISetcodesConf): void;
	private loadConf;
	private load;
}
export declare const setcodes: Setcodes;
export {};
