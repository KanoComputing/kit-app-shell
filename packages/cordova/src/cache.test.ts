/* globals suite, setup, test, teardown */
import * as mock from 'mock-require';
import * as mockFs from 'mock-fs';
import * as path from 'path';
import * as chai from 'chai';
import chaiFs = require('chai-fs');

chai.use(chaiFs);

const { assert } = chai;

const MOCK_DEFAULTS = { createCwd: false, createTmp: false };

function applyMockFs() {
    mockFs({
        '/test-homedir/.kit-app-shell-cordova/cache/test-1': JSON.stringify({ id: 'test-1' }),
        '/test-homedir/.kit-app-shell-cordova/cache/test-2': JSON.stringify({ id: 'test-2' }),
    }, MOCK_DEFAULTS);
}

suite('ProjectCacheManager', () => {
    setup(() => {
        mock('os', {
            homedir() {
                return '/test-homedir';
            },
        });
    });
    test('contructor', () => {
        const { ProjectCacheManager } = mock.reRequire('./cache');
        applyMockFs();

        const cache = new ProjectCacheManager('test-id');

        assert.equal(cache._dbPath, path.join('/test-homedir', '.kit-app-shell-cordova/cache', 'test-id'));
    });
    test('load', () => {
        const { ProjectCacheManager } = mock.reRequire('./cache');
        applyMockFs();

        const cache = new ProjectCacheManager('test-1');

        return cache.load()
            .then((data) => {
                assert.equal(data.id, 'test-1');
                assert.equal(cache._cache.id, 'test-1');
            });
    });
    test('save', () => {
        const { ProjectCacheManager } = mock.reRequire('./cache');
        applyMockFs();

        const cache = new ProjectCacheManager('test-save');

        cache._cache = { id: 'test-save' };

        return cache.save()
            .then(() => {
                assert.fileContent('/test-homedir/.kit-app-shell-cordova/cache/test-save', JSON.stringify(cache._cache));
            });
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
