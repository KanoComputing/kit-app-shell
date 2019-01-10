/* globals suite, test, teardown */
import * as path from 'path';
import * as chai from 'chai';
import chaiFs = require('chai-fs');
import * as mock from 'mock-require';
import * as mockFs from 'mock-fs';

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
        mock('@kano/kit-app-shell-electron/lib/build', {
            default: (opts) => {
                assert.equal(opts.app, '/app');
                return Promise.resolve('/build');
            },
        });
        // Will resolve if a warning is sent using processState
        const didReceiveWarning = new Promise((resolve) => {
            mock('@kano/kit-app-shell-core/lib/process-state', {
                processState: {
                    setStep() {},
                    setWarning(m) {
                        assert.equal(m, '\'APP_NAME\' missing in config, will use \'App\' as name');
                        resolve();
                    },
                    setSuccess() {},
                    setInfo() {},
                }
            });
        });
        const build = mock.reRequire('./build');
        return Promise.all([
            didReceiveWarning,
            build.default({ app: '/app', out: '/out', config: {} }),
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
        mock('@kano/kit-app-shell-electron/lib/build', {
            default: (opts) => {
                assert.equal(opts.app, '/app');
                assert.equal(opts.config, config);
                assert.equal(opts.bundleOnly, true);
                return Promise.resolve('/build');
            },
        });
        mock('@kano/kit-app-shell-core/lib/process-state', {
            processState: {
                setStep() {},
                setWarning() {
                    throw new Error('Should not have triggered a warning');
                },
                setSuccess() {},
                setInfo() {},
            },
        });
        const build = mock.reRequire('./build');
        return build.default({
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