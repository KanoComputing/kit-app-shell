/* globals suite, test, teardown */
const path = require('path');
const chai = require('chai');
const chaiFs = require('chai-fs');
const mock = require('mock-require');
const mockFs = require('mock-fs');

chai.use(chaiFs);

const { assert } = chai;

suite('macOS build', () => {
    test('default values', () => {
        mock('electron-packager', (opts) => {
            assert.equal(opts.dir, '/build');
            assert.equal(opts.icon, path.join(__dirname, '../icons/1024.png.icns'));
            assert.equal(opts.out, '/out');
            assert.equal(opts.name, 'App');
            return Promise.resolve('/out');
        });
        mock('@kano/kit-app-shell-electron', {
            build: (opts) => {
                assert.equal(opts.app, '/app');
                return Promise.resolve('/build');
            },
        });
        // Will resolve if a warning is sent using processState
        const didReceiveWarning = new Promise((resolve) => {
            mock('@kano/kit-app-shell-core', {
                processState: {
                    setStep() {},
                    setWarning(m) {
                        assert.equal(m, '\'APP_NAME\' missing in config, will use \'App\' as name');
                        resolve();
                    },
                    setSuccess() {},
                },
            });
        });
        const build = mock.reRequire('./build');
        return Promise.all([
            didReceiveWarning,
            build({ app: '/app', out: '/out' }),
        ]);
    });
    test('provided', () => {
        const config = {
            APP_NAME: 'Test',
            ICONS: {
                MACOS: 'assets/test-icons.png.icns',
            },
        };
        mock('electron-packager', (opts) => {
            assert.equal(opts.dir, '/build');
            assert.equal(opts.icon, path.join('/app', 'assets/test-icons.png.icns'));
            assert.equal(opts.out, '/out');
            assert.equal(opts.name, 'Test');
            return Promise.resolve('/out');
        });
        mock('@kano/kit-app-shell-electron', {
            build: (opts) => {
                assert.equal(opts.app, '/app');
                assert.equal(opts.config, config);
                assert.equal(opts.bundleOnly, true);
                return Promise.resolve('/build');
            },
        });
        mock('@kano/kit-app-shell-core', {
            processState: {
                setStep() {},
                setWarning() {
                    throw new Error('Should not have triggered a warning');
                },
                setSuccess() {},
            },
        });
        const build = mock.reRequire('./build');
        return build({
            app: '/app',
            out: '/out',
            config,
            bundleOnly: true,
        });
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
