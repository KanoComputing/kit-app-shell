/* globals suite, test, teardown */

const mock = require('mock-require');
const { assert } = require('chai');
const path = require('path');

suite('build', () => {
    test('copies extra dll', () => {
        mock('@kano/kit-app-shell-electron/lib/build', () => Promise.resolve());
        mock('electron-packager', () => Promise.resolve());
        mock('./innosetup', (_, cb) => cb());
        mock('@kano/kit-app-shell-core/lib/util', {
            fs: {
                copy(src, dest) {
                    assert.equal(path.join(__dirname, '../vccorlib140.dll'), src);
                    assert.equal(path.resolve('/test-tmp/kash-windows-build/build/vccorlib140.dll'), path.resolve(dest));
                },
            },
        });
        mock('os', {
            tmpdir() {
                return '/test-tmp';
            },
        });
        mock('mkdirp', (_, cb) => cb());
        mock('rimraf', (_, cb) => cb());

        const build = mock.reRequire('./build');

        return build({});
    });

    teardown(() => {
        mock.stopAll();
    });
});
