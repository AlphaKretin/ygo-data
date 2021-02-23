import { Octokit } from "@octokit/rest";
declare let github: Octokit;
export declare type ReposGetContentParams = Parameters<typeof github.repos.getContent>[0];
declare type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
declare type Unpacked<T> = T extends (infer U)[] ? U : T;
export declare type ReposGetContentResponse = Unpacked<ThenArg<ReturnType<typeof github.repos.getContent>>["data"]>;
export declare function getGithub(auth?: string): Octokit;
export {};
