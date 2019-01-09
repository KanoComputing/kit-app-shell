/* globals suite, test */
import { loadPlatformKey } from './platform';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as mock from 'mock-require';

chai.use(chaiAsPromised);

const { assert } = chai;

suite('resolve-platform', () => {
    suite('loadPlatformKey', () => {
        test('reserved names', () => {
            return assert.isRejected(loadPlatformKey('cli', '_'))
                .then(() => assert.isRejected(loadPlatformKey('common', '_')));
        });
        test('Explicit message when platform doesn\'t exist', () => {
            return assert.isRejected(loadPlatformKey('_', '_'), 'Could not load platform: \'_\' was not installed');
        });
        test('load correctly', () => {
            const mod = {};
            mock('@kano/kit-app-shell-test-platform/lib/_', { default: mod });
            return loadPlatformKey('test-platform', '_')
                .then((loadedModule) => {
                    assert.equal(loadedModule, mod);
                });
            });
    });
    teardown(() => {
        mock.stopAll();
    });
});
