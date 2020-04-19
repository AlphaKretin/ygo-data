"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
let github;
function getGithub(auth) {
    if (github) {
        return github;
    }
    let options = undefined;
    console.log(auth);
    if (auth) {
        options = {
            auth: process.env.GITHUB_TOKEN
        };
    }
    github = new rest_1.Octokit(options);
    return github;
}
exports.getGithub = getGithub;
//# sourceMappingURL=github.js.map