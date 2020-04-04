import { Octokit } from "@octokit/rest";

let options: Octokit.Options | undefined = undefined;
// for travis
if (process.env.GITHUB_TOKEN) {
	options = {
		auth: process.env.GITHUB_TOKEN
	};
}
export const github = new Octokit(options);
