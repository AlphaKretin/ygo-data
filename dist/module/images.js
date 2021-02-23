"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.images = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class Images {
    getLink(code) {
        if (!this.link || !this.ext) {
            throw new Error("Image URL not loaded!");
        }
        return this.link + code + "." + this.ext;
    }
    async getImage(code) {
        if (!this.link || !this.ext) {
            throw new Error("Image URL not loaded!");
        }
        try {
            const image = await (await node_fetch_1.default(this.getLink(code))).buffer();
            return image;
        }
        catch (e) {
            return undefined;
        }
    }
    update(link, ext) {
        this.link = link;
        this.ext = ext;
    }
}
exports.images = new Images();
//# sourceMappingURL=images.js.map