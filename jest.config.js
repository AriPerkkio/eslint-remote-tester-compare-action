module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['test'],
    setupFilesAfterEnv: ['./test/jest.setup.ts'],
};
