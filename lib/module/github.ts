import { Octokit } from "@octokit/rest";

let github: Octokit;

export function getGithub(auth?: string): Octokit {
	if (github) {
		return github;
	}
	let options: Octokit.Options | undefined = undefined;
	if (auth) {
		options = {
			auth: process.env.GITHUB_TOKEN
		};
	}
	github = new Octokit(options);
	return github;
}
