/* globals suite, teardown, test */
const mockFS = require('mock-fs');
const path = require('path');
const ConfigLoader = require('./config');
const { assert } = require('chai');

function mockConfig(appDir, files, version) {
    const mocks = {};
    Object.keys(files).forEach((fileName) => {
        const filePath = path.join(appDir, `config/${fileName}.json`);
        const fileData = files[fileName];
        mocks[filePath] = JSON.stringify(fileData);
    });

    const pkgPath = path.join(appDir, 'package.json');
    mocks[pkgPath] = JSON.stringify({ version });

    mockFS(mocks);

    return {
        files,
    };
}

suite('ConfigLoader', () => {
    const fakeAppDir = '/test-app';
    suite('load', () => {
        test('succeeds on missing files', () => {
            mockConfig(fakeAppDir, {}, '1.0.0');
            const value = ConfigLoader.load(fakeAppDir);
            assert.equal(value.UI_VERSION, '1.0.0');
        });
        test('load development by default', () => {
            const mocker = mockConfig(fakeAppDir, {
                default: { _defaultId: 'default' },
                development: { _envId: 'dev' },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir);
            assert.equal(result.ENV, 'development');
            assert.equal(result._defaultId, mocker.files.default._defaultId);
            assert.equal(result._envId, mocker.files.development._envId);
        });
        test('load specified environment', () => {
            const mocker = mockConfig(fakeAppDir, {
                default: { _defaultId: 'default' },
                staging: { _envId: 'staging' },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir, 'staging');
            assert.equal(result.ENV, 'staging');
            assert.equal(result._defaultId, mocker.files.default._defaultId);
            assert.equal(result._envId, mocker.files.staging._envId);
        });
    });
    teardown(() => {
        mockFS.restore();
    });
});
