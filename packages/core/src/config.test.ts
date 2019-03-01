/* globals suite, teardown, test */
import * as mockFS from 'mock-fs';
import * as path from 'path';
import { ConfigLoader } from './config';
import { assert } from 'chai';
import 'mocha';

const MOCK_DEFAULTS = { createCwd: false, createTmp: false };

function mockConfig(appDir : string, files : any, version : string) {
    const mocks = {} as any;
    Object.keys(files).forEach((fileName) => {
        const filePath = path.join(appDir, `config/${fileName}.json`);
        const fileData = files[fileName];
        mocks[filePath] = JSON.stringify(fileData);
    });

    const pkgPath = path.join(appDir, 'package.json');
    mocks[pkgPath] = JSON.stringify({ version });

    mockFS(mocks, MOCK_DEFAULTS);

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
                default: { APP_NAME: 'default' },
                development: { APP_ID: 'dev' },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir);
            assert.equal(result.ENV, 'development');
            assert.equal(result.APP_NAME, mocker.files.default.APP_NAME);
            assert.equal(result.APP_ID, mocker.files.development.APP_ID);
        });
        test('load specified environment', () => {
            const mocker = mockConfig(fakeAppDir, {
                default: { APP_NAME: 'default' },
                staging: { APP_ID: 'staging' },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir, 'staging');
            assert.equal(result.ENV, 'staging');
            assert.equal(result.APP_NAME, mocker.files.default.APP_NAME);
            assert.equal(result.APP_ID, mocker.files.staging.APP_ID);
        });
        test('override existing key', () => {
            mockConfig(fakeAppDir, {
                default: { APP_NAME: 'default' },
                staging: { APP_ID: 'staging', FOO: { BAR: 5 } },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir, 'staging', { FOO: { BAR: 6 } });
            assert.equal(result.FOO.BAR, 6);
        });
        test('override new key', () => {
            mockConfig(fakeAppDir, {
                default: { APP_NAME: 'default' },
                staging: { APP_ID: 'staging' },
            }, '1.0.0');
            const result = ConfigLoader.load(fakeAppDir, 'staging', { FOO: { BAR: 7 } });
            assert.equal(result.FOO.BAR, 7);
        });
    });
    teardown(() => {
        mockFS.restore();
    });
});
