const path = require('path');
const mock = require('mock-fs');
const Bundler = require('./bundler');
const chai = require('chai');
chai.use(require('chai-fs'));

const { assert } = chai;

function wait(t) {
    return new Promise((res) => setTimeout(res, t));
}

suite('Bundler', () => {
    test('bundleHtml', () => {
        const transformed = Bundler.bundleHtml(path.join(__dirname, '../test/resources/bundler/index.html'), { test: '<div>Test</div>' });
        assert.equal(transformed, `<html lang="en"><div>Test</div><head><script src="/require.js"></script></head><body></body></html>`)
    });
    test('write', () => {
        const bundle = {
            html: {
                fileName: 'index.html',
                code: 'html-test',
            },
            js: [{
                fileName: 'index.js',
                code: 'js-test',
            }],
            appJs: [{
                fileName: 'index.js',
                code: 'app-js-test',
            }],
            appStatic: {
                root: '/static',
                files: ['a.png']
            }
        };
        mock({
            '/static/a.png': 'static-test',
        });
        return Bundler.write(bundle, '/')
            .then(() => wait(0)) // mock-fs seems to not have all files written after the stream finishes
            .then(() => {
                assert.fileContent('/index.html', 'html-test');
                assert.fileContent('/index.js', 'js-test');
                assert.fileContent('/www/index.js', 'app-js-test');
                assert.fileContent('/www/a.png', 'static-test');
            });
        });
    teardown(() => {
        mock.restore();
    });
});
