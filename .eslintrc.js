module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['node', '@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:node/recommended',
        'prettier/@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'prettier/prettier': 'error',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-import': [
            'error',
            {
                tryExtensions: ['.ts', '.d.ts'],
                allowModules: ['semver'],
            },
        ],
        'node/no-unpublished-import': [
            'error',
            { tryExtensions: ['.js', '.d.ts'] },
        ],
        'node/no-missing-require': ['error', { tryExtensions: ['.ts'] }],
        '@typescript-eslint/no-var-requires': 'off',
    },
    overrides: [
        {
            files: ['esbuild.config.js'],
            rules: {
                'node/no-unpublished-require': 'off',
                'no-process-exit': 'off',
            },
        },
        {
            files: ['*.test.ts*', '*.mock.ts*'],
            rules: {
                '@typescript-eslint/no-non-null-assertion': 'off',
                'node/no-missing-import': 'off',
                'node/no-unpublished-import': 'off',
            },
        },
    ],
};
