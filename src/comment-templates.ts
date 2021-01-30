import { Result } from 'eslint-remote-tester/dist/exports-for-compare-action';
import { requirePeerDependency } from './peer-dependencies';

/**
 * Template for building github issue comment when action run into error
 */
// prettier-ignore
export const ERROR_TEMPLATE = (error: Error): string =>
`Something went wrong.


<details>
    <summary>Click to expand</summary>

\`\`\`
${error.stack}
\`\`\`

</details>
`;

/**
 * Template used to build github issue comment for successful action run
 */
export const COMMENT_TEMPLATE = (
    added: Result[],
    removed: Result[],
    maxResultCount: number,
    baseRepository: string,
    prRepository: string
): string => {
    const { RESULT_PARSER_TO_COMPARE_TEMPLATE } = requirePeerDependency(
        'eslint-remote-tester'
    );

    const hasResults = added.length + removed.length > 0;
    const limitReached = (added.length + removed.length) / 2 > maxResultCount;
    const limitedAdded = added.slice(0, maxResultCount);
    const limitedRemoved = removed.slice(0, maxResultCount);

    // prettier-ignore
    return '' +
`## Comparison results

Compared branches:

- Base: \`${baseRepository}\`
- PR: \`${prRepository}\`

${hasResults ?
`Detected ${added.length} new ESLint reports and ${removed.length} reports to be not present.` : 'No changes detected.'}
${limitReached ?
`
Reached maximum result count ${maxResultCount}.
Showing ${limitedAdded.length}/${added.length} added and ${limitedRemoved.length}/${removed.length} removed results.` : ''}
${hasResults ?
`
<details>
<summary>Click to expand</summary>

${RESULT_PARSER_TO_COMPARE_TEMPLATE.markdown('added', limitedAdded)}
${RESULT_PARSER_TO_COMPARE_TEMPLATE.markdown('removed', limitedRemoved)}

</details>
` : ''}`;
};
