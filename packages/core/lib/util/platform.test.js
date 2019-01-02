/* globals suite, test */
const { loadPlatformKey } = require('./platform');
const { assert } = require('chai');
const mock = require('mock-require');

suite('resolve-platform', () => {
    suite('loadPlatformKey', () => {
        test('reserved names', () => {
            assert.throws(() => loadPlatformKey('cli', '_'));
            assert.throws(() => loadPlatformKey('common', '_'));
        });
        test('Explicit message when platform doesn\'t exist', () => {
            assert.throws(() => loadPlatformKey('_', '_'), 'Could load platform: \'_\' was not installed');
        });
        test('load correctly', () => {
            const mod = Symbol('module');
            mock('@kano/kit-app-shell-test-platform/lib/_', mod);
            const loadedModule = loadPlatformKey('test-platform', '_');
            assert.equal(loadedModule, mod);
            mock.stopAll();
        });
    });
});
