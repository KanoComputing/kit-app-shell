/* globals suite, test */
const { loadPlatform } = require('./platform');
const { assert } = require('chai');
const mock = require('mock-require');

suite('resolve-platform', () => {
    suite('loadPlatform', () => {
        test('reserved names', () => {
            assert.throws(() => loadPlatform('cli'));
            assert.throws(() => loadPlatform('common'));
        });
        test('Explicit message when platform doesn\'t exist', () => {
            assert.throws(() => loadPlatform('_'), 'Could load platform: \'_\' was not installed');
        });
        test('load correctly', () => {
            const mod = Symbol('module');
            mock('@kano/kit-app-shell-test-platform', mod);
            const loadedModule = loadPlatform('test-platform');
            assert.equal(loadedModule, mod);
            mock.stop('@kano/kit-app-shell-test-platform');
        });
    });
});
