const path = require('path');
const mockFs = require('mock-fs');
const mock = require('mock-require');
const RcLoader = require('./rc');
const { assert } = require('chai');

suite('RcLoader', () => {
    test('check', () => {
        mockFs({
            '/file.txt': '',
        });
        return RcLoader.check('/file.txt')
            .then((exists) => assert.equal(exists, true))
            .then(() => RcLoader.check('/nope.txt'))
            .then((exists) => assert.equal(exists, false));
    });
    suite('findAll', () => {
        test('all files', () => {
            mock('os', {
                homedir() {
                    return '/homedir';
                },
            });
            const RcLoader = mock.reRequire('./rc');
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
            }, {}));
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
            });
            const RcLoader = mock.reRequire('./rc');
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
        });
        const allFiles = [
            '/kit-app-shell.conf.js',
            '/.kit-app-shell.conf.js',
            '/kash.conf.js',
            '/.kash.conf.js',
            '/homedir/.kashrc.json',
        ];
        allFiles.forEach((file) => {
            if (file.indexOf('.json') !== -1) {
            }
            mock(file, {
                [file]: true,
            });
        });
        const RcLoader = mock.reRequire('./rc');
        mockFs(allFiles.reduce((acc, file) => {
            acc[file] = '';
            return acc;
        }, {}));
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

