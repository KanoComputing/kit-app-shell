/* globals suite, test, teardown */
import * as path from 'path';
import * as chai from 'chai';
import chaiFs = require('chai-fs');
import * as mock from 'mock-require';
import * as mockFs from 'mock-fs';
import { Readable } from 'stream';

chai.use(chaiFs);

const { assert } = chai;

suite('electron run', () => {
    test('run', () => {
        mock('child_process', {
            spawn(_, args, opts) {
                assert.equal(args[0], '.');
                assert.equal(args[2], '/app');
                assert.equal(opts._showOutput, true);
                assert.equal(opts.cwd, path.join(__dirname, '../app'));
                return {
                    stdout: new Readable({ read: () => null }),
                    stderr: new Readable({ read: () => null }),
                    on: () => null,
                };
            },
        });
        mock('livereload', {
            createServer() {
                return {
                    watch: () => null,
                    close: () => null,
                };
            },
        });
        const run = mock.reRequire('./run');
        run.default({ app: '/app' }, {});
    });
    test('electron throws an error', () => {
        mock('child_process', {
            spawn() {
                // Throw an error on spanwn, expect the server to close
                throw new Error();
            },
        });
        const expectServerToClose = new Promise((resolve) => {
            mock('livereload', {
                createServer() {
                    return {
                        watch: () => null,
                        close() {
                            resolve();
                        },
                    };
                },
            });
        });
        const run = mock.reRequire('./run');
        return Promise.all([
            expectServerToClose,
            // Ignore error as it comes from our test
            run.default({ app: '/app' }, {}).catch(() => null),
        ]);
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
