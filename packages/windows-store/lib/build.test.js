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

        const sample = {
            config: {
                WINDOWS_STORE: {},
            },
        };

        const build = mock.reRequire('./build');

        return build(sample);
    });
    teardown(() => {
        mock.stopAll();
    });
});
