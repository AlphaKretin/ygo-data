import fetch from "node-fetch";

class Images {
	private link?: string;
	private ext?: string;

	public getLink(code: number): string {
		if (!this.link || !this.ext) {
			throw new Error("Image URL not loaded!");
		}
		return this.link + code + "." + this.ext;
	}

	public async getImage(code: number): Promise<Buffer | undefined> {
		if (!this.link || !this.ext) {
			throw new Error("Image URL not loaded!");
		}
		try {
			const image = await (await fetch(this.getLink(code))).buffer();
			return image;
		} catch (e) {
			return undefined;
		}
	}

	public update(link: string, ext: string): void {
		this.link = link;
		this.ext = ext;
	}
}

export const images = new Images();
