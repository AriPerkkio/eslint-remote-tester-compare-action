import fs from 'fs';
import { Config } from 'eslint-remote-tester/dist/exports-for-compare-action';

// Regexp for parsing options out of the comment
const CONFIG_REGEXP = new RegExp(
    [
        '`{3}', // starts with ```
        '\\w*', // may contain any characters on first row, e.g. syntax highlighters ```js, ```json
        '[\n|\r\n]', // line break starting the capture group. Github uses \r\n, tests use \n.
        '([\\s|\\S]*)', // Capture group for multiple characters
        '`{3}', // ``` ending the capture group
    ].join('')
);

let counter = 0;
const TMP_FILE_PATH = (count: number) => `/tmp/config-from-comment-${count}.js`;
const TMP_TEMPLATE = (configFromComment: string | undefined) =>
    `module.exports=${configFromComment || '{}'}`;

/**
 * Parse `eslint-remote-tester` configuration from PR comment
 */
export function parseConfigFromComment(
    comment: string
): Partial<Config> & { maxResultCount?: number } {
    const matches = comment.match(CONFIG_REGEXP);
    const config = (matches || [])[1];
    const filename = TMP_FILE_PATH(counter++);

    try {
        // Write content to file and read it back. Config is not JSON. It may contain JS functions etc.
        fs.writeFileSync(filename, TMP_TEMPLATE(config));
        const content = require(filename);
        fs.unlinkSync(filename);

        return content;
    } catch (e) {
        throw new Error(
            `Unable to parse configuration from comment \n${config}\nError ${e.message}`
        );
    }
}
