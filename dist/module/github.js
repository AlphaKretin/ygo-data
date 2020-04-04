"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
let options = undefined;
// for travis
if (process.env.GITHUB_TOKEN) {
    options = {
        auth: process.env.GITHUB_TOKEN
    };
}
exports.github = new rest_1.Octokit(options);
//# sourceMappingURL=github.js.map