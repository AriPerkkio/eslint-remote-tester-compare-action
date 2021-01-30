import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';

interface PullRequest {
    cloneUrl: string;
    repository: string;
    branch: string;
}

let githubToken: string;

try {
    githubToken = core.getInput('github-token', { required: true });
} catch (error) {
    core.setFailed(error.message);
}

/**
 * Client for handling `octokit` requests.
 * Provides easier API for response data.
 */
class GithubClient {
    private octokit: ReturnType<typeof getOctokit>;

    constructor() {
        this.octokit = getOctokit(githubToken);
    }

    async getPullRequest(): Promise<PullRequest> {
        const pullRequest = await this.octokit.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.issue.number,
        });

        return {
            cloneUrl: pullRequest.data.head.repo.clone_url,
            repository: pullRequest.data.head.repo.full_name,
            branch: pullRequest.data.head.ref,
        };
    }

    async getCollaboratorPermissionLevel(): Promise<string> {
        const level = await this.octokit.repos.getCollaboratorPermissionLevel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            username: context.actor,
        });

        return level.data.permission;
    }

    async postComment(comment: string): Promise<void> {
        await this.octokit.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body: comment,
        });
    }
}

export default new GithubClient();
