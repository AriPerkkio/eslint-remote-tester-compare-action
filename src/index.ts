import fs from 'fs';
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';

import runTester from './run-tester';

const TRIGGER_KEYWORD = '@github-actions eslint-remote-tester compare';

const CACHE_TEMP_LOCATION = '/tmp/.comparison-cache.json';
const CACHE_ORIGINAL_LOCATION =
    '.cache-eslint-remote-tester/.comparison-cache.json';

async function run() {
    try {
        const githubToken = core.getInput('github-token', { required: true });
        const repositoryInitializeCommand = core.getInput(
            'repository-initialize-command',
            { required: true }
        );
        const usersEslintRemoteTesterConfig = core.getInput(
            'eslint-remote-tester-config',
            { required: true }
        );

        if (context.eventName !== 'issue_comment') {
            throw new Error(`invalid eventName: (${context.eventName})`);
        }

        const comment = getComment();
        if (!comment.startsWith(TRIGGER_KEYWORD)) return;

        core.info('Parse PR repository');
        const octokit = getOctokit(githubToken);
        const pullRequest = await octokit.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.issue.number,
        });
        const prCloneUrl = pullRequest.data.head.repo.clone_url;
        const prBranch = pullRequest.data.head.ref;
        core.info(`PR repository ${prCloneUrl} - ${prBranch}`);

        core.info('Initializing repository');
        await exec(repositoryInitializeCommand);

        core.info('#1 run of eslint-remote-tester');
        await runTester(usersEslintRemoteTesterConfig);

        core.info('Save eslint-remote-tester cache');
        fs.renameSync(CACHE_ORIGINAL_LOCATION, CACHE_TEMP_LOCATION);
        await exec(`ls -lh ${CACHE_TEMP_LOCATION}`);
        await exec('pwd');

        // Would be great to use actions/checkout but "action in action" is not supported
        core.info(`Checkout to ${prCloneUrl} - ${prBranch}`);
        await exec('git clean -df');
        await exec(`git remote add pr ${prCloneUrl}`);
        await exec('git fetch pr');
        await exec(`git checkout pr/${prBranch}`);

        core.info('Initializing PR repository');
        await exec(repositoryInitializeCommand);

        core.info('Restoring eslint-remote-tester cache');
        fs.renameSync(CACHE_TEMP_LOCATION, CACHE_ORIGINAL_LOCATION);
        await exec(`ls -lh ${CACHE_ORIGINAL_LOCATION}`);
        await exec('pwd');

        core.info('#2 run of eslint-remote-tester');
        await runTester(usersEslintRemoteTesterConfig);

        core.info('Post results');
        const comparisonResults = core.getInput('comparisonResults');
        const { added, removed } = JSON.parse(comparisonResults || '{}');

        const body = COMMENT_TEMPLATE(added, removed);

        await octokit.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

// TODO Export fromt eslint-remote-tester
// prettier-ignore
// eslint-disable-next-line
const { RESULT_PARSER_TO_COMPARE_TEMPLATE } = require('eslint-remote-tester/dist/file-client/result-templates.js');

// prettier-ignore
const COMMENT_TEMPLATE = (added: string | null, removed: string | null) =>
`Comparison results:

<details>
    <summary>Click to expand</summary>

${added || '# Added \nNo changes.'}
${removed || '# Removed \nNo changes.'}

</details>
`;

/**
 * Parse comment from payload safely
 */
function getComment(): string {
    if (!context.payload.comment) return '';

    return context.payload.comment.body || '';
}

run();
