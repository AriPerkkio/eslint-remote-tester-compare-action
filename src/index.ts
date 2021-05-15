import fs from 'fs';
import path from 'path';
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import {
    ComparisonResults,
    Config,
} from 'eslint-remote-tester/dist/exports-for-compare-action';

import GithubClient from './github-client';
import { parseConfigFromComment } from './comment-parser';
import runTester, { COMPARISON_RESULTS_TMP } from './run-tester';
import { COMMENT_TEMPLATE, ERROR_TEMPLATE } from './comment-templates';
import { requirePeerDependency } from './peer-dependencies';

const TRIGGER_KEYWORD = '@github-actions eslint-remote-tester compare';

async function run() {
    try {
        // Run only for pull request comments
        if (!isPullRequest()) return;

        // Ignore comments which do not start with trigger keyword
        const comment = getComment();
        if (!comment.startsWith(TRIGGER_KEYWORD)) return;

        // Currently only issue_comment is supported. More event types could be supported in future.
        if (context.eventName !== 'issue_comment') {
            throw new Error(`Event ${context.eventName} is not supported.`);
        }

        await checkPermission();

        const repositoryInitializeCommand = core.getInput(
            'repository-initialize-command'
        );
        const usersEslintRemoteTesterConfig = core.getInput(
            'eslint-remote-tester-config'
        );

        const {
            maxResultCount,
            ...configurationFromComment
        } = await core.group(`Parsing comment`, async () => {
            const config = parseConfigFromComment(comment);
            core.info(
                'Parsed configuration from comment: ' +
                    stringifyCommentConfig(config)
            );

            return config;
        });

        const pullRequest = await GithubClient.getPullRequest();

        const baseRepository = [
            context.issue.owner,
            context.issue.repo,
            getBaseBranch(),
        ].join('/');

        await core.group(
            `Initializing base repository ${baseRepository}`,
            async () => {
                for (const command of repositoryInitializeCommand.split('\n')) {
                    await exec(command);
                }
            }
        );

        // Peer dependencies are now available
        const {
            RESULT_COMPARISON_CACHE,
            RESULTS_COMPARISON_CACHE_LOCATION,
        } = requirePeerDependency('eslint-remote-tester');

        await core.group('#1 run of eslint-remote-tester', () =>
            runTester(
                usersEslintRemoteTesterConfig,
                configurationFromComment,
                false
            )
        );

        // Save cache from git checkout
        const CACHE_TEMP_LOCATION = `/tmp/${RESULT_COMPARISON_CACHE}`;
        fs.renameSync(
            path.resolve(RESULTS_COMPARISON_CACHE_LOCATION),
            path.resolve(CACHE_TEMP_LOCATION)
        );

        await core.group(
            `Checkout to ${pullRequest.cloneUrl} - ${pullRequest.branch}`,
            async () => {
                // Would be ideal to use actions/checkout but "action in action" is not supported
                await exec('git clean -fd -e .cache-eslint-remote-tester');
                await exec(`git remote add downstream ${pullRequest.cloneUrl}`);
                await exec('git fetch downstream');
                await exec(`git checkout downstream/${pullRequest.branch}`);
            }
        );

        await core.group(
            `Initializing PR repository ${pullRequest.repository}/${pullRequest.branch}`,
            async () => {
                for (const command of repositoryInitializeCommand.split('\n')) {
                    await exec(command);
                }
            }
        );

        console.log('CACHE_TEMP_LOCATION', CACHE_TEMP_LOCATION);
        console.log(
            'RESULTS_COMPARISON_CACHE_LOCATION',
            RESULTS_COMPARISON_CACHE_LOCATION
        );

        await exec(`ls -la /tmp/.comparison-cache.json`);
        await exec('pwd');
        await exec('ls -la node_modules');
        await exec('ls -la node_modules/eslint-remote-tester');
        await exec(
            'ls -la node_modules/eslint-remote-tester/.cache-eslint-remote-tester'
        );

        // Restore cache
        fs.renameSync(
            path.resolve(CACHE_TEMP_LOCATION),
            path.resolve(RESULTS_COMPARISON_CACHE_LOCATION)
        );

        await core.group('#2 run of eslint-remote-tester', () =>
            runTester(
                usersEslintRemoteTesterConfig,
                configurationFromComment,
                true
            )
        );

        const comparisonResults = fs.readFileSync(
            COMPARISON_RESULTS_TMP,
            'utf8'
        );
        const { added, removed }: ComparisonResults = JSON.parse(
            comparisonResults
        );

        const resultsComment = COMMENT_TEMPLATE(
            added,
            removed,
            maxResultCount || parseInt(core.getInput('max-result-count')),
            baseRepository,
            `${pullRequest.repository}/${pullRequest.branch}`
        );

        await GithubClient.postComment(resultsComment);
    } catch (error) {
        core.setFailed(error.message);
        await GithubClient.postComment(ERROR_TEMPLATE(error));
    }
}

/**
 * Parse current branch from environment variable
 */
function getBaseBranch() {
    return (process.env.GITHUB_REF || '').split('/').slice(2).join('/');
}

/**
 * Parse comment from payload safely
 */
function getComment(): string {
    if (!context.payload.comment) return '';

    return context.payload.comment.body || '';
}

/**
 * Check whether event is from pull request
 */
function isPullRequest(): boolean {
    if (!context.payload.issue) return false;

    return Boolean(context.payload.issue.pull_request);
}

/**
 * Reqire comment author to have
 * - admin or write permission to repository
 * - association matching configured allowed-associations
 *
 * Implementation is mostly from actions-comment-run
 */
async function checkPermission() {
    // Require comment author to have admin or write permission to repository
    const permission = await GithubClient.getCollaboratorPermissionLevel();
    if (permission !== 'admin' && permission !== 'write') {
        throw new Error(
            `${context.actor} does not have admin/write permission. Found permission: ${permission}`
        );
    }

    const allowedAssociations = core.getInput('allowed-associations');

    let allowed: string[];
    try {
        allowed = JSON.parse(allowedAssociations);
    } catch (e) {
        throw new Error(
            `Unable to parse allowed-associations. Expected JSON array: ${allowedAssociations}`
        );
    }

    const current = (context.payload.comment as any).author_association;

    if (!allowed.includes(current)) {
        throw new Error(
            `Author association ${current} is not allowed. Allowed values are ${allowed}`
        );
    }
}

/**
 * Convert `Config` to readable JSON string
 */
function stringifyCommentConfig(config: Partial<Config>) {
    return JSON.stringify(
        config,
        (_, value) => (typeof value === 'function' ? value.toString() : value),
        4
    );
}

export const __handleForTests = run();
