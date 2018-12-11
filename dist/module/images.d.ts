/// <reference types="node" />
declare class Images {
    private link?;
    private ext?;
    getImage(code: number): Promise<Buffer | undefined>;
    update(link: string, ext: string): void;
}
export declare const images: Images;
export {};
