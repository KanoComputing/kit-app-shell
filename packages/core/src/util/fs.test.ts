/* globals suite, test, teardown */
import * as  mock from 'mock-fs';
import * as mockRequire from 'mock-require';
import * as chai from 'chai';
// Neede for chai-fs to work as it enhances the global namespace
import chaiFs = require('chai-fs');
import { Transform, Readable, Writable } from 'stream';
import { copy, fromTemplate } from './fs';

import 'mocha';

chai.use(chaiFs);

const { assert } = chai;

const MOCK_DEFAULTS = { createCwd: false, createTmp: false };

function mockFsAssertWriteOptions(testOptions : any) {
    mockRequire('fs', {
        createReadStream() {
            return new Readable({
                read() {
                    this.push(null);
                },
            });
        },
        createWriteStream(a : any, options : any) {
            assert.equal(options, testOptions);
            return new Writable({
                write: () => null,
            });
        },
    });
    mockRequire('mkdirp', (d, cb) => cb());
    return mockRequire.reRequire('./fs');
}

suite('fs', () => {
    suite('copy', () => {
        test('create directory', () => {
            mock({
                '/src/file.txt': 'contents',
            }, MOCK_DEFAULTS);
            return copy('/src/file.txt', '/new-dir/file.txt')
                .then(() => {
                    assert.fileContent('/new-dir/file.txt', 'contents');
                });
        });
        test('existing directory', () => {
            mock({
                '/src/file.txt': 'contents',
                '/dest': mock.directory({ items: {} }),
            }, MOCK_DEFAULTS);
            return copy('/src/file.txt', '/dest/file.txt')
                .then(() => {
                    assert.fileContent('/dest/file.txt', 'contents');
                });
        });
        test('accepts transform', () => {
            mock({
                '/src/file.txt': 'contents',
                '/dest': mock.directory({ items: {} }),
            }, MOCK_DEFAULTS);
            const transform = new Transform({
                transform(chunk, encoding, callback) {
                    this.push(chunk.toString().toUpperCase());
                    callback();
                },
            });
            return copy('/src/file.txt', '/dest/file.txt', { transform })
                .then(() => {
                    assert.fileContent('/dest/file.txt', 'CONTENTS');
                });
        });
        test('proxy writeOptions to fs bindings', () => {
            const testOptions = {};
            const fsUtils = mockFsAssertWriteOptions(testOptions);
            mock({}, MOCK_DEFAULTS);
            return fsUtils.copy('/src/file.txt', '/dest/file.txt', { writeOptions: testOptions });
        });
        teardown(() => {
            mockRequire.stopAll();
            mock.restore();
        });
    });
    suite('fromTemplate', () => {
        test('replaces correctly', () => {
            /* eslint no-template-curly-in-string: 'off' */
            mock({
                '/file.tpl.txt': 'Test is ${STATUS}',
            }, MOCK_DEFAULTS);
            return fromTemplate('/file.tpl.txt', '/dest.txt', {
                STATUS: 'successful',
            })
                .then(() => {
                    assert.fileContent('/dest.txt', 'Test is successful');
                });
        });
        test('proxies writeOptions', () => {
            const testOptions = Symbol('options');
            const fsUtils = mockFsAssertWriteOptions(testOptions);
            return fsUtils.fromTemplate('/file.tpl.txt', '/dest.txt', {}, testOptions);
        });
        teardown(() => {
            mockRequire.stopAll();
            mock.restore();
        });
    });
});
