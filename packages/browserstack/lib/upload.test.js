const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mock = require('mock-require');
const mockFs = require('mock-fs');

chai.use(chaiAsPromised);

const { assert } = chai;

suite('upload', () => {
    test('missing param', () => {
        const upload = mock.reRequire('./upload');
        assert.isRejected(upload('/app.apk'));
        assert.isRejected(upload('/app.apk', { user: 'test' }));
    });
    test('missing file', () => {
        const upload = mock.reRequire('./upload');
        assert.isRejected(upload('/app.apk', { user: 'test', key: 'test' }));
    });
    test('upload', () => {
        mock('request', {
            post(opts, cb) {
                cb(null, {
                    body: JSON.stringify({ app_url: 'bs://test' }),
                });
            },
        });
        const upload = mock.reRequire('./upload');
        mockFs({
            '/app.apk': '',
        });
        return upload('/app.apk', { user: 'test', key: 'test' })
            .then((data) => {
                assert.equal(data.app_url, 'bs://test');
            });
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
