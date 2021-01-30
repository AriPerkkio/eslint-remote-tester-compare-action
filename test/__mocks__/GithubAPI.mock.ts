import { setupServer } from 'msw/node';
import { rest } from 'msw';

const API_URL = 'https://api.github.com';
export const onComment = jest.fn();

export default setupServer(
    rest.get(
        `${API_URL}/repos/:owner/:repo/pulls/:pullNumber`,
        (req, res, ctx) => {
            const { owner, repo, pullNumber } = req.params;

            return res(
                ctx.json({
                    head: {
                        repo: {
                            clone_url: `clone/url/for/${owner}/${repo}/${pullNumber}`,
                            full_name: `${owner}/${repo}`,
                        },
                        ref: 'mock-branch',
                    },
                })
            );
        }
    ),
    rest.get(
        `${API_URL}/repos/:owner/:repo/collaborators/:username/permission`,
        (req, res, ctx) => {
            const { owner, repo, username } = req.params;

            return res(
                ctx.json({
                    permission: `mock permission for ${username} at ${owner}/${repo}`,
                })
            );
        }
    ),
    rest.post(
        `${API_URL}/repos/:owner/:repo/issues/:issueNumber/comments`,
        (req, res, ctx) => {
            const { owner, repo, issueNumber } = req.params;
            const body = req.body;

            // Void endpoint tested via additional assertion
            onComment({ owner, repo, issueNumber, body });

            return res(ctx.json({}));
        }
    )
);
