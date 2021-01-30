const mockGithub = jest.fn();
jest.mock('@actions/github', () => mockGithub());

const mockCore = { setFailed: jest.fn() };
jest.mock('@actions/core', () => mockCore);

const mockGithubClient = {
    getCollaboratorPermissionLevel: jest.fn(),
    postComment: jest.fn(),
};
jest.mock('../src/github-client', () => ({
    __esModule: true,
    default: mockGithubClient,
}));

const KEYWORD = '@github-actions eslint-remote-tester compare';
const createComment = (body: string) => ({ payload: { comment: { body } } });

async function runEntryPoint() {
    jest.resetModules();
    return require('../src/index').__handleForTests;
}

describe('entrypoint', () => {
    beforeEach(() => {
        mockCore.setFailed.mockClear();
        mockGithubClient.postComment.mockClear();
        mockGithubClient.getCollaboratorPermissionLevel.mockClear();

        mockGithubClient.postComment.mockResolvedValue(undefined);
        mockGithubClient.getCollaboratorPermissionLevel.mockResolvedValue(
            'admin'
        );

        mockGithub.mockReturnValue({
            context: {
                ...createComment(KEYWORD),
                eventName: 'issue_comment',
                actor: 'mock-user',
            },
        });
    });

    test('exits when comment does not start with keyword', async () => {
        mockGithub.mockReturnValue({ context: createComment('Hello world') });

        await runEntryPoint();
        expect(
            mockGithubClient.getCollaboratorPermissionLevel
        ).not.toHaveBeenCalledWith();
    });

    test('fails if event is not issue_comment', async () => {
        mockGithub.mockReturnValue({
            context: { ...createComment(KEYWORD), eventName: 'push' },
        });

        await runEntryPoint();

        expect(mockCore.setFailed).toHaveBeenCalledWith(
            'Event push is not supported.'
        );
    });

    test('posts comment when fails', async () => {
        mockGithub.mockReturnValue({
            context: { ...createComment(KEYWORD), eventName: 'push' },
        });

        await runEntryPoint();

        expect(mockGithubClient.postComment).toHaveBeenCalled();
    });

    test('fails if user lacks repository permission', async () => {
        mockGithubClient.getCollaboratorPermissionLevel.mockResolvedValue(
            'read'
        );

        await runEntryPoint();

        expect(mockCore.setFailed).toHaveBeenCalledWith(
            'mock-user does not have admin/write permission. Found permission: read'
        );
    });
});
