/* globals suite, test, teardown */

import * as mock from 'mock-require';
import { assert } from 'chai';

suite('build', () => {
    test('Disables updater', () => {
        mock('@kano/kit-app-shell-windows/lib/build', {
            default: (opts) => {
                assert.equal(opts.config.UPDATER_DISABLED, true);
                return Promise.resolve('/');
            },
        });
        mock('electron-windows-store', () => Promise.resolve());
        mock('rimraf', (_, cb) => cb());
        mock('mkdirp', (_, cb) => cb());

        const sample = {
            config: {
                WINDOWS_STORE: {
                    PUBLISHER: 'CN=TEST',
                },
            },
            certificates: {
                'CN=TEST': '/cert.pfx',
            },
            windowsKit: '/',
        };

        const build = mock.reRequire('./build');

        return build.default(sample);
    });
    teardown(() => {
        mock.stopAll();
    });
});
