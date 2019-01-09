"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const chai = require("chai");
const chaiFs = require("chai-fs");
const mock = require("mock-require");
const mockFs = require("mock-fs");
const stream_1 = require("stream");
chai.use(chaiFs);
const { assert } = chai;
suite('electron run', () => {
    test('run', () => {
        let closeCb;
        mock('child_process', {
            spawn(cmd, args, opts) {
                assert.equal(args[0], '.');
                assert.equal(args[2], '/app');
                assert.equal(opts.stdio, 'inherit');
                assert.equal(opts.cwd, path.join(__dirname, '../app'));
                return {
                    stdout: new stream_1.Readable({ read() { } }),
                    stderr: new stream_1.Readable({ read() { } }),
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
                        watch() { },
                        close() {
                            resolve();
                        },
                    };
                },
            });
        });
        const run = mock.reRequire('./run');
        return run.default({ app: '/app' }, {})
            .then(() => {
            closeCb();
            return expectServerToClose;
        });
    });
    test('electron throws an error', () => {
        mock('child_process', {
            spawn() {
                throw new Error();
            },
        });
        const expectServerToClose = new Promise((resolve) => {
            mock('livereload', {
                createServer() {
                    return {
                        watch() { },
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
            run.default({ app: '/app' }, {}).catch(() => { }),
        ]);
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
//# sourceMappingURL=run.test.js.map