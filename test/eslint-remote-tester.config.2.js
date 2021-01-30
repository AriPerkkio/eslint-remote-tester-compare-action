module.exports = {
    repositories: ['AriPerkkio/eslint-remote-tester-integration-test-target'],
    extensions: ['.js'],
    pathIgnorePattern: '(expected-to-be-excluded)',
    rulesUnderTesting: [
        'no-unreachable',
        'no-undef',
        'no-empty',
        'getter-return',
        'no-compare-neg-zero',
    ],
    eslintrc: {
        root: true,
        extends: ['eslint:recommended'],
    },
    onComplete: async function onComplete() {
        console.log('Hello world');
    },
};
