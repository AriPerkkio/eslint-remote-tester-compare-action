import GithubClient from '../src/github-client';
import { onComment } from './__mocks__/GithubAPI.mock';

describe('github-client', () => {
    test('getPullRequest', () => {
        return expect(GithubClient.getPullRequest()).resolves
            .toMatchInlineSnapshot(`
                    Object {
                      "branch": "mock-branch",
                      "cloneUrl": "clone/url/for/mock-owner/mock-repo/123",
                      "repository": "mock-owner/mock-repo",
                    }
                `);
    });

    test('getCollaboratorPermissionLevel', () => {
        return expect(
            GithubClient.getCollaboratorPermissionLevel()
        ).resolves.toMatchInlineSnapshot(
            `"mock permission for mock-comment-actor at mock-owner/mock-repo"`
        );
    });

    test('postComment', async () => {
        await GithubClient.postComment('Hello world');

        expect(onComment).toBeCalledWith({
            body: { body: 'Hello world' },
            issueNumber: '123',
            owner: 'mock-owner',
            repo: 'mock-repo',
        });
    });
});
