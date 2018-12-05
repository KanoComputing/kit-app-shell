const mock = require('mock-require');
const path = require('path');
const ConfigLoader = require('./config');
const { assert } = require('chai');

function mockConfig(appDir, files, version) {
    const mocks = Object.keys(files).map((fileName) => {
        const filePath = path.join(appDir, `config/${fileName}.json`);
        const fileData = files[fileName];
        mock(filePath, fileData);
        return filePath;
    });

    const pkgPath = path.join(appDir, 'package.json');
    mock(pkgPath, { version });
    mocks.push(pkgPath);

    return {
        files,
        dispose() {
            mocks.forEach((p) => mock.stop(p));
        },
    };
}

suite('ConfigLoader', () => {
    const fakeAppDir = '/test-app';
    suite('load', () => {
        test('fails on missing default', () => {
            const mocker = mockConfig(fakeAppDir, {}, '1.0.0');
            assert.throw(() => ConfigLoader.load(fakeAppDir));
            mocker.dispose();
        });
        test('fails on missing env', () => {
            const mocker = mockConfig(fakeAppDir, {
                default: {},
            }, '1.0.0');
            assert.throw(() => ConfigLoader.load(fakeAppDir, 'staging'));
            mocker.dispose();
        });
        test('load development by default', () => {
            const mocker = mockConfig(fakeAppDir, {
                default: { _defaultId: Symbol() },
                development: { _envId: Symbol },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir);
            assert.equal(result.ENV, 'development');
            assert.equal(result._defaultId, mocker.files.default._defaultId);
            assert.equal(result._envId, mocker.files.development._envId);
            mocker.dispose();
        });
        test('load specified environment', () => {
            const mocker = mockConfig(fakeAppDir, {
                default: { _defaultId: Symbol() },
                staging: { _envId: Symbol },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir, 'staging');
            assert.equal(result.ENV, 'staging');
            assert.equal(result._defaultId, mocker.files.default._defaultId);
            assert.equal(result._envId, mocker.files.staging._envId);
            mocker.dispose();
        });
    });
});
