"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
class Images {
    async getImage(code) {
        if (!this.link || !this.ext) {
            throw new Error("Image URL not loaded!");
        }
        try {
            const image = await request(this.link + code + "." + this.ext, { encoding: null });
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