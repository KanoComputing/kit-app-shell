/* globals suite, test, teardown */

import * as mock from 'mock-require';
import * as mockFs from 'mock-fs';
import { assert } from 'chai';
import * as path from 'path';

suite('build', () => {
    test('copies extra dll', () => {
        mock('@kano/kit-app-shell-electron/lib/build', {
            default: () => Promise.resolve(),
        });
        mock('electron-packager', () => Promise.resolve());
        mock('./innosetup', {
            buildWin32Setup: (_, cb) => cb(),
        });
        mock('@kano/kit-app-shell-core/lib/util/fs', {
            copy(src, dest) {
                assert.equal(path.join(__dirname, '../vccorlib140.dll'), src);
                assert.equal(path.resolve('/test-tmp/kash-windows-build/app/TEST-win32-x64/vccorlib140.dll'), path.resolve(dest));
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

        mockFs({
            [path.resolve('/test-tmp/kash-windows-build/app/TEST-win32-x64/resources/app')]: {
                'snapshot_blob.bin': '',
                'v8_context_snapshot.bin': '',
            },
        });

        return build.default({ config: { APP_NAME: 'TEST' } });
    });

    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
