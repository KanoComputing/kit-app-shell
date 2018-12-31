/* globals suite, test, teardown */
const path = require('path');
const chai = require('chai');
const chaiFs = require('chai-fs');
const mock = require('mock-require');
const mockFs = require('mock-fs');
const { Readable } = require('stream');

chai.use(chaiFs);

const { assert } = chai;

suite('electron run', () => {
    test('run', () => {
        let closeCb;
        mock('child_process', {
            spawn(cmd, args, opts) {
                assert.equal(args[0], '.');
                assert.equal(args[2], '/app');
                assert.equal(opts._showOutput, true);
                assert.equal(opts.cwd, path.join(__dirname, '../app'));
                return {
                    stdout: new Readable({ read() {} }),
                    stderr: new Readable({ read() {} }),
                    on(name, cb) {
                        if (name === 'close') {
                            closeCb = cb;
                        }
                    },
                };
            },
        });
        const expectServerToClose = new Promise((resolve) => {
            mock('livereload', {
                createServer() {
                    return {
                        watch() {},
                        close() {
                            resolve();
                        },
                    };
                },
            });
        });
        const run = mock.reRequire('./run');
        return run({ app: '/app' }, {})
            .then(() => {
                closeCb();
                return expectServerToClose;
            });
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
                        watch() {},
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
            run({ app: '/app' }, {}).catch(() => {}),
        ]);
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
