/* globals suite, test, teardown */

const mock = require('mock-require');
const { assert } = require('chai');

suite('build', () => {
    test('Disables updater', () => {
        mock('@kano/kit-app-shell-windows/lib/build', (opts) => {
            assert.equal(opts.config.UPDATER_DISABLED, true);
            return Promise.resolve('/');
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

        return build(sample);
    });
    teardown(() => {
        mock.stopAll();
    });
});
