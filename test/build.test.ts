import fs from 'fs';
import { execSync } from 'child_process';

const BUNDLE = './dist/index.js';

function readBuild(): string {
    return fs.readFileSync(BUNDLE, 'utf8');
}

describe('build', () => {
    if (!process.env.CI) {
        test.only('skipping build test in local environment', () => undefined);
    }

    test('committed build is not tampered', () => {
        const actual = readBuild();

        fs.unlinkSync(BUNDLE);
        expect(fs.existsSync(BUNDLE)).toBe(false);

        execSync('yarn build');
        const expected = readBuild();

        expect(actual).toBe(expected);
    });
});
