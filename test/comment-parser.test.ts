import { parseConfigFromComment } from '../src/comment-parser';

describe('parseConfigFromComment', () => {
    test('rules are parsed', () => {
        const result = parseConfigFromComment(`
@github-actions eslint compare

\`\`\`
{
    'rulesUnderTesting': ['node/no-unpublished-import'],
}
\`\`\``);
        expect(result).toEqual({
            rulesUnderTesting: ['node/no-unpublished-import'],
        });
    });

    test('codeblock syntax is supported', () => {
        const result = parseConfigFromComment(`
@github-actions eslint compare

\`\`\`json
{
    "rules": {
        "node/no-unpublished-import": [
            "error",
            { "tryExtensions": [".js", ".d.ts"] }
        ]
    }
}
\`\`\`

some unrelated text.
`);
        expect(result).toEqual({
            rules: {
                'node/no-unpublished-import': [
                    'error',
                    { tryExtensions: ['.js', '.d.ts'] },
                ],
            },
        });
    });

    test('carriage return is supported', () => {
        const result = parseConfigFromComment(
            `
@github-actions eslint compare

\`\`\`json` +
                '\r\n' +
                `{
    "rules": {
        "node/no-unpublished-import": [
            "error",
            { "tryExtensions": [".js", ".d.ts"] }
        ]
    }
}
\`\`\`

some unrelated text.
`
        );
        expect(result).toEqual({
            rules: {
                'node/no-unpublished-import': [
                    'error',
                    { tryExtensions: ['.js', '.d.ts'] },
                ],
            },
        });
    });

    test('functions are supported', async () => {
        const result = parseConfigFromComment(
            `
@github-actions eslint compare

\`\`\`js
{
    onComplete: async function onComplete() {
        return 2;
    }
}
\`\`\`
`
        );
        expect(result.onComplete).toBeDefined();
        return expect(result.onComplete!([], null)).resolves.toBe(2);
    });

    test('configuration is optional', () => {
        const result = parseConfigFromComment(`
@github-actions eslint compare

some unrelated text.
`);
        expect(result).toEqual({});
    });

    test('throws when configuration cannot be parsed', () => {
        const onParse = () =>
            parseConfigFromComment(`
@github-actions eslint compare

\`\`\`js
{
    "rulesUnderTesting: "invalid format,
    eslintrc; { 2 },
}
\`\`\`
`);
        expect(onParse).toThrowErrorMatchingInlineSnapshot(`
            "Unable to parse configuration from comment 
            {
                \\"rulesUnderTesting: \\"invalid format,
                eslintrc; { 2 },
            }

            Error Unexpected identifier"
        `);
    });
});
