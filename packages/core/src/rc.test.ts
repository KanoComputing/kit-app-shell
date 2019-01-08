/* globals suite, test, teardown */
import * as path from 'path';
import * as mockFs from 'mock-fs';
import * as mock from 'mock-require';
import { RcLoader } from './rc';
import { assert } from 'chai';

const MOCK_DEFAULTS = { createCwd: false, createTmp: false };

suite('RcLoader', () => {
    test('check', () => {
        mockFs({
            '/file.txt': '',
        }, MOCK_DEFAULTS);
        return RcLoader.check('/file.txt')
            .then(exists => assert.equal(exists, true))
            .then(() => RcLoader.check('/nope.txt'))
            .then(exists => assert.equal(exists, false));
    });
    suite('findAll', () => {
        test('all files', () => {
            mock('os', {
                homedir() {
                    return '/homedir';
                },
                tmpdir() {
                    return '/test-tmp';
                },
            });
            const { RcLoader } = mock.reRequire('./rc');
            const allFiles = [
                '/kit-app-shell.conf.js',
                '/.kit-app-shell.conf.js',
                '/kash.conf.js',
                '/.kash.conf.js',
                '/homedir/.kashrc.json',
            ];
            mockFs(allFiles.reduce((acc, file) => {
                acc[file] = '';
                return acc;
            }, {}), MOCK_DEFAULTS);
            return RcLoader.findAll('/')
                .then((files) => {
                    allFiles.forEach((f) => {
                        assert.include(files, path.normalize(f));
                    });
                });
        });
        test('missing file', () => {
            mock('os', {
                homedir() {
                    return '/homedir';
                },
                tmpdir() {
                    return '/test-tmp';
                },
            });
            const { RcLoader } = mock.reRequire('./rc');
            return RcLoader.findAll('/')
                .then((files) => {
                    assert.equal(files.length, 0);
                });
        });
    });
    test('load', () => {
        mock('os', {
            homedir() {
                return '/homedir';
            },
            tmpdir() {
                return '/test-tmp';
            },
        });
        const allFiles = [
            '/kit-app-shell.conf.js',
            '/.kit-app-shell.conf.js',
            '/kash.conf.js',
            '/.kash.conf.js',
            '/homedir/.kashrc.json',
        ];
        allFiles.forEach((file) => {
            mock(file, {
                [file]: true,
            });
        });
        const { RcLoader } = mock.reRequire('./rc');
        mockFs(allFiles.reduce((acc, file) => {
            acc[file] = '';
            return acc;
        }, {}), MOCK_DEFAULTS);
        return RcLoader.load('/')
            .then((data) => {
                assert.containsAllKeys(data, allFiles);
            });
    });
    teardown(() => {
        mockFs.restore();
        mock.stopAll();
    });
});

