const mock = require('mock-fs');
const mockRequire = require('mock-require');
const chai = require('chai');
const chaiFs = require('chai-fs');
const { Transform, Readable, Writable } = require('stream');
const { copy, fromTemplate } = require('./fs');

chai.use(chaiFs);

const { assert } = chai;

suite('fs', () => {
    suite('copy', () => {
        test('create directory', () => {
            mock({
                '/src/file.txt': 'contents',
            });
            return copy('/src/file.txt', '/new-dir/file.txt')
                .then(() => {
                    assert.fileContent('/new-dir/file.txt', 'contents');
                });
        });
        test('existing directory', () => {
            mock({
                '/src/file.txt': 'contents',
                '/dest': mock.directory(),
            });
            return copy('/src/file.txt', '/dest/file.txt')
                .then(() => {
                    assert.fileContent('/dest/file.txt', 'contents');
                });
        });
        test('accepts transform', () => {
            mock({
                '/src/file.txt': 'contents',
                '/dest': mock.directory(),
            });
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
            const testOptions = Symbol();
            mockRequire('fs', {
                createReadStream() {
                    return new Readable({
                        read() {
                            this.push(null);
                        }
                    });
                },
                createWriteStream(a, options) {
                    assert.equal(options, testOptions);
                    return new Writable({
                        write() {}
                    });
                },
            });
            const { copy } = mockRequire.reRequire('./fs');
            return copy('/src/file.txt', '/dest/file.txt', { writeOptions: testOptions });
        });
        teardown(() => {
            mockRequire.stopAll();
            mock.restore();
        });
    });
    suite('fromTemplate', () => {});
});
