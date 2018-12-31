/* globals suite, test, teardown */
const mock = require('mock-require');
const { assert } = require('chai');

suite('log', () => {
    test('silent trace', () => {
        mock('./logging', {
            log() {
                throw new Error('Should not have logged trace');
            },
        });
        const log = mock.reRequire('./log');
        log.trace('test');
    });
    test('trace when in debug mode', (done) => {
        const testMessage = Symbol('message');
        const originalDebug = process.env.DEBUG;
        process.env.DEBUG = '*';
        mock('./logging', {
            log(message) {
                assert.equal(message, testMessage);
                done();
            },
        });
        const log = mock.reRequire('./log');
        log.trace(testMessage);
        process.env.DEBUG = originalDebug;
    });
    teardown(() => {
        mock.stopAll();
    });
});

