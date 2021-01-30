const { build } = require('esbuild');

/** @type {import('esbuild/lib/main').BuildOptions} */
const options = {
    entryPoints: ['./src/index.ts'],
    bundle: true,
    external: [
        // Do not bundle eslint-remote-tester. Its modules should be required
        // runtime from users eslint-remote-tester in order to avoid updating action.
        'eslint-remote-tester',
    ],
    platform: 'node',
    outdir: 'dist',
    outbase: 'src',
};

build(options).catch(err => {
    process.stderr.write(err.stderr);
    process.exit(1);
});
