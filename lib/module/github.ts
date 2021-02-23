import { Octokit } from "@octokit/rest";

let github: Octokit;

export type ReposGetContentParams = Parameters<typeof github.repos.getContent>[0];
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
type Unpacked<T> = T extends (infer U)[] ? U : T;
export type ReposGetContentResponse = Unpacked<ThenArg<ReturnType<typeof github.repos.getContent>>["data"]>;

export function getGithub(auth?: string): Octokit {
	if (github) {
		return github;
	}
	let options: ConstructorParameters<typeof Octokit>[0] | undefined = undefined;
	if (auth) {
		options = {
			auth: process.env.GITHUB_TOKEN
		};
	}
	github = new Octokit(options);
	return github;
}
