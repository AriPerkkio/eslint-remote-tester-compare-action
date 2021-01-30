import GithubAPI from './__mocks__/GithubAPI.mock';

jest.mock('@actions/core', () => ({
    getInput: jest.fn().mockReturnValue('input value'),
}));

jest.mock(
    '@actions/github',
    jest.fn().mockImplementation(() => ({
        context: {
            actor: 'mock-comment-actor',
            repo: { owner: 'mock-owner', repo: 'mock-repo' },
            issue: { number: 123 },
        },
        getOctokit: jest.requireActual('@actions/github').getOctokit,
    }))
);

beforeAll(() => GithubAPI.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => GithubAPI.resetHandlers());
afterAll(() => GithubAPI.close());
