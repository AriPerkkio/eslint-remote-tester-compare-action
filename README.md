# eslint-remote-tester-compare-action

> Github action for testing pull requests of ESLint plugins

[Usage](#usage) | [Requirements](#requirements) | [Configuration](#configuration) | [See also](#see-also)

`eslint-remote-tester-compare-action` is a pre-configured Github workflow action for running [`eslint-remote-tester`](https://github.com/AriPerkkio/eslint-remote-tester) in comparison mode.
It compares the changes of the PR with main branch and displays the changes of ESLint reports.
Check out the use case description from eslint-remote-tester's documentation: [Plugin maintainer making sure new PRs don't introduce new false positives](https://github.com/AriPerkkio/eslint-remote-tester#plugin-maintainer-making-sure-new-prs-dont-introduce-new-false-positives).

<p align="center">
  <img width="640" src="https://raw.githubusercontent.com/AriPerkkio/eslint-remote-tester-compare-action/HEAD/docs/demo.png">
</p>

## Usage:

Action can be activated by commenting `@github-actions eslint-remote-tester compare` in the pull request issue.

Comment may contain optional parameters for `eslint-remote-tester.config.js`. See all available arguments from [Configuration options](https://github.com/AriPerkkio/eslint-remote-tester#configuration-options).

````
@github-actions eslint-remote-tester compare

```js
{
    rulesUnderTesting: [ 'my-rule' ],
    eslintrc: { rules: { 'my-rule': 'error' } },
}
```

Any text below configuration is ignored. Feel free to use this for discussion.
````

### Additional configuration arguments

| Name             | Description                                                                                             | Required | Default | Example                |
| :--------------- | :------------------------------------------------------------------------------------------------------ | :------: | :------ | :--------------------- |
| `maxResultCount` | Maximum result count to be posted in result comment. Overrides the value set in workflow configuration. |   :x:    | `50`    | `{maxResultCount:100}` |

## Requirements

`eslint-remote-tester` is required as peer dependency.

| eslint-remote-tester-compare-action | eslint-remote-tester |
| :---------------------------------: | :------------------: |
|                `v1`                 |   `1.0.1` or above   |

## Configuration:

Create new workflow `.github/workflows/compare-pr.yml`.

```yml
name: Compare PR

on:
    issue_comment:
        types: [created, edited]

jobs:
    compare:
        runs-on: ubuntu-latest
        if: contains(github.event.comment.body, '@github-actions eslint-remote-tester compare')
        steps:
            - uses: actions/checkout@v2
            - uses: actions/setup-node@v1
              with:
                  node-version: 12.11
            - uses: AriPerkkio/eslint-remote-tester-compare-action@v1
              with:
                  github-token: ${{ secrets.GITHUB_TOKEN }}
                  allowed-associations: '["OWNER", "COLLABORATOR"]'
                  max-result-count: 100
                  eslint-remote-tester-config: test/compare-pr/eslint-remote-tester.config.js
                  repository-initialize-command: |
                      npm install
                      npm link
                      npm link eslint-plugin-custom
```

### Action parameters

| Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description                                                                                                                                                                      |      Required      |              Default               | Example                                                         |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------: | :--------------------------------: | :-------------------------------------------------------------- |
| `github-token`                                                                                                                                                                           | Token for Github Authentication. See [About the `GITHUB_TOKEN` secret](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#about-the-github_token-secret). | :white_check_mark: |                :x:                 | `${{secrets.GITHUB_TOKEN}}`                                     |
| `allowed-associations`                                                                                                                                                                   | Comment author associations allowed. See [CommentAuthorAssociation](https://docs.github.com/en/graphql/reference/enums#commentauthorassociation).                                |        :x:         |           `'["OWNER"]'`            | `'["OWNER","COLLABORATOR"]'`                                    |
| `repository-initialize-command`                                                                                                                                                          | Command(s) used to initialize project after checkout. Multiple commands are split from line breaks.                                                                              |        :x:         |          `'yarn install'`          | `'yarn install \n yarn link \n yarn link eslint-plugin-custom'` |
| `eslint-remote-tester-config`                                                                                                                                                            | Path to project's `eslint-remote-tester.config.js`                                                                                                                               |        :x:         | `'eslint-remote-tester.config.js'` | `./path/to/custom.config.js`                                    |
| `max-result-count`                                                                                                                                                                       | Maximum result count to be posted in result comment. Can be override with `maxResultCount` option in comment.                                                                    |        :x:         |                `50`                | `100`                                                           |

## See also

Most of the comment handling logic is from [`nwtgck/actions-comment-run`](https://github.com/nwtgck/actions-comment-run). Check out their README for comment related tips, e.g. [TIPS: Saved replies](https://github.com/nwtgck/actions-comment-run#tips-saved-replies).
