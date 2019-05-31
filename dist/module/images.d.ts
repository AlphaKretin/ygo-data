declare class Images {
    private link?;
    private ext?;
    getLink(code: number): string;
    getImage(code: number): Promise<Buffer | undefined>;
    update(link: string, ext: string): void;
}
export declare const images: Images;
export {};
