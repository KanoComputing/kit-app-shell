/* globals suite, teardown test */
const path = require('path');
const mockFs = require('mock-fs');
const mock = require('mock-require');
const Bundler = require('./bundler');
const chai = require('chai');
chai.use(require('chai-fs'));

const { assert } = chai;

function wait(t) {
    return new Promise(res => setTimeout(res, t));
}

suite('Bundler', () => {
    test('bundleHtml', () => {
        const transformed = Bundler.bundleHtml(
            path.join(__dirname, '../test/resources/bundler/index.html'),
            { test: '<div>Test</div>' },
        );
        assert.equal(transformed, '<html lang="en"><div>Test</div><head><script src="/require.js"></script></head><body></body></html>');
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
                files: ['a.png'],
            },
        };
        mockFs({
            '/static/a.png': 'static-test',
        });
        return Bundler.write(bundle, '/')
            // mock-fs seems to not have all files written after the stream finishes
            .then(() => wait(0))
            .then(() => {
                assert.fileContent('/index.html', 'html-test');
                assert.fileContent('/index.js', 'js-test');
                assert.fileContent('/www/index.js', 'app-js-test');
                assert.fileContent('/www/a.png', 'static-test');
            });
    });
    test('bundle', () => {
        // Fake rollup, avoid testing rollup
        mock('rollup', {
            rollup(opts) {
                return Promise.resolve({
                    generate() {
                        // Generate fake output based on the provided inputs
                        return Promise.resolve({
                            output: opts.input.reduce((acc, id) => {
                                acc[id] = 'test';
                                return acc;
                            }, {}),
                        });
                    },
                });
            },
        });
        mock('rollup-plugin-minify-html-literals', { default: () => {} });
        mock('rollup-plugin-uglify-es', () => {});
        mock('@babel', () => {});
        // Fake bable plugin. Babel always tries to resolve its plugins
        mock('rollup-plugin-babel', () => {});
        const html = '/index.html';
        const js = '/index.js';
        const appJs = '/app.js';
        const TestBundler = mock.reRequire('./bundler');
        // Fake fs structure with all the input files and the requirejs library
        mockFs({
            '/index.html': 'html',
            '/index.js': 'js',
            '/app.js': 'appJs',
            [path.join(__dirname, '../../../node_modules/requirejs/require.js')]: 'requirejs',
            [path.join(__dirname, '../../../node_modules/@babel/plugin-syntax-dynamic-import/lib/index.js')]: '',
            [path.join(__dirname, '../../../node_modules/@babel/preset-env/lib/index.js')]: '',
        });
        return TestBundler.bundle(html, js, appJs, {}, { appJs: { resources: [] } });
    });
    test('bundleStatic', () => {
        mock('glob', (patterns, opts, cb) => {
            cb(null, [
                'path1',
                'path2',
            ]);
        });
        const TestBundler = mock.reRequire('./bundler');
        return TestBundler.bundleStatic(['testPattern'])
            .then((result) => {
                assert.equal(result.root, '/');
                assert.equal(result.files.indexOf('path1'), 0);
                assert.equal(result.files.indexOf('path2'), 1);
            });
    });
    teardown(() => {
        mockFs.restore();
        mock.stopAll();
    });
});
