import { Result } from 'eslint-remote-tester/dist/exports-for-compare-action';

import { COMMENT_TEMPLATE, ERROR_TEMPLATE } from '../src/comment-templates';
import { mockError } from './utils';

const BASE_REPOSITORY = 'owner/repository/master';
const PR_REPOSITORY = 'contributor/repository/pr';

const added: Result[] = [generateResult(1), generateResult(2)];
const removed: Result[] = [
    generateResult(3),
    generateResult(4),
    generateResult(5),
];

function generateResult(postfix: number): Result {
    return {
        repository: `repository-${postfix}`,
        repositoryOwner: `repositoryOwner-${postfix}`,
        rule: `rule-${postfix}`,
        message: `message-${postfix}`,
        path: `path-${postfix}`,
        link: `link-${postfix}`,
        extension: `extension-${postfix}`,
        source: `source-${postfix}`,
        error: `error-${postfix}`,
        __internalHash: `__internalHash-${postfix}` as Result['__internalHash'],
    };
}

describe('COMMENT_TEMPLATE', () => {
    test('details are not shown when 0 results', () => {
        const comment = COMMENT_TEMPLATE(
            [],
            [],
            1,
            BASE_REPOSITORY,
            PR_REPOSITORY
        );

        expect(comment).toMatchInlineSnapshot(`
            "## Comparison results

            Compared branches:

            - Base: \`owner/repository/master\`
            - PR: \`contributor/repository/pr\`

            No changes detected.

            "
        `);
    });

    test('"no changes" is shown when one only comparison type has data', () => {
        const comment = COMMENT_TEMPLATE(
            [],
            removed.slice(0, 1),
            1,
            BASE_REPOSITORY,
            PR_REPOSITORY
        );

        expect(comment).toMatchInlineSnapshot(`
            "## Comparison results

            Compared branches:

            - Base: \`owner/repository/master\`
            - PR: \`contributor/repository/pr\`

            Detected 0 new ESLint reports and 1 reports to be not present.


            <details>
            <summary>Click to expand</summary>

            # Added:
            No changes

            # Removed:
            ## Rule: rule-3

            -   Message: \`message-3\`
            -   Path: \`path-3\`
            -   [Link](link-3)

            \`\`\`extension-3
            source-3
            \`\`\`

            \`\`\`
            error-3
            \`\`\`

            </details>
            "
        `);
    });

    test('details are shown when results', () => {
        const comment = COMMENT_TEMPLATE(
            added,
            removed,
            10,
            BASE_REPOSITORY,
            PR_REPOSITORY
        );

        expect(comment).toMatchInlineSnapshot(`
            "## Comparison results

            Compared branches:

            - Base: \`owner/repository/master\`
            - PR: \`contributor/repository/pr\`

            Detected 2 new ESLint reports and 3 reports to be not present.


            <details>
            <summary>Click to expand</summary>

            # Added:
            ## Rule: rule-1

            -   Message: \`message-1\`
            -   Path: \`path-1\`
            -   [Link](link-1)

            \`\`\`extension-1
            source-1
            \`\`\`

            \`\`\`
            error-1
            \`\`\`

            ## Rule: rule-2

            -   Message: \`message-2\`
            -   Path: \`path-2\`
            -   [Link](link-2)

            \`\`\`extension-2
            source-2
            \`\`\`

            \`\`\`
            error-2
            \`\`\`

            # Removed:
            ## Rule: rule-3

            -   Message: \`message-3\`
            -   Path: \`path-3\`
            -   [Link](link-3)

            \`\`\`extension-3
            source-3
            \`\`\`

            \`\`\`
            error-3
            \`\`\`

            ## Rule: rule-4

            -   Message: \`message-4\`
            -   Path: \`path-4\`
            -   [Link](link-4)

            \`\`\`extension-4
            source-4
            \`\`\`

            \`\`\`
            error-4
            \`\`\`

            ## Rule: rule-5

            -   Message: \`message-5\`
            -   Path: \`path-5\`
            -   [Link](link-5)

            \`\`\`extension-5
            source-5
            \`\`\`

            \`\`\`
            error-5
            \`\`\`

            </details>
            "
        `);
    });

    test('results are limited based on maxResultCount', () => {
        const comment = COMMENT_TEMPLATE(
            added,
            removed,
            2,
            BASE_REPOSITORY,
            PR_REPOSITORY
        );

        expect(comment).toMatchInlineSnapshot(`
            "## Comparison results

            Compared branches:

            - Base: \`owner/repository/master\`
            - PR: \`contributor/repository/pr\`

            Detected 2 new ESLint reports and 3 reports to be not present.

            Reached maximum result count 2.
            Showing 2/2 added and 2/3 removed results.

            <details>
            <summary>Click to expand</summary>

            # Added:
            ## Rule: rule-1

            -   Message: \`message-1\`
            -   Path: \`path-1\`
            -   [Link](link-1)

            \`\`\`extension-1
            source-1
            \`\`\`

            \`\`\`
            error-1
            \`\`\`

            ## Rule: rule-2

            -   Message: \`message-2\`
            -   Path: \`path-2\`
            -   [Link](link-2)

            \`\`\`extension-2
            source-2
            \`\`\`

            \`\`\`
            error-2
            \`\`\`

            # Removed:
            ## Rule: rule-3

            -   Message: \`message-3\`
            -   Path: \`path-3\`
            -   [Link](link-3)

            \`\`\`extension-3
            source-3
            \`\`\`

            \`\`\`
            error-3
            \`\`\`

            ## Rule: rule-4

            -   Message: \`message-4\`
            -   Path: \`path-4\`
            -   [Link](link-4)

            \`\`\`extension-4
            source-4
            \`\`\`

            \`\`\`
            error-4
            \`\`\`

            </details>
            "
        `);
    });
});

describe('ERROR_TEMPLATE', () => {
    test('error stack is shown', () => {
        const comment = ERROR_TEMPLATE(mockError);

        expect(comment).toMatchInlineSnapshot(`
            "Something went wrong.


            <details>
                <summary>Click to expand</summary>

            \`\`\`
            Error: mock error
                at Object.<anonymous> (<removed>/test/utils.ts:2:26)
                at Runtime._execModule (<removed>/node_modules/jest-runtime/build/index.js:1299:24)
                at Runtime._loadModule (<removed>/node_modules/jest-runtime/build/index.js:898:12)
                at Runtime.requireModule (<removed>/node_modules/jest-runtime/build/index.js:746:10)
                at Runtime.requireModuleOrMock (<removed>/node_modules/jest-runtime/build/index.js:919:21)
                at Object.<anonymous> (<removed>/test/comment-templates.test.ts:4:1)
                at Runtime._execModule (<removed>/node_modules/jest-runtime/build/index.js:1299:24)
                at Runtime._loadModule (<removed>/node_modules/jest-runtime/build/index.js:898:12)
                at Runtime.requireModule (<removed>/node_modules/jest-runtime/build/index.js:746:10)
                at jasmine2 (<removed>/node_modules/jest-jasmine2/build/index.js:230:13)
            \`\`\`

            </details>
            "
        `);
    });
});
