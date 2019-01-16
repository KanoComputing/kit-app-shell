/* globals suite, test, teardown */
import * as path from 'path'
import * as chai from 'chai';
import chaiFs = require('chai-fs');
import * as chaiJSONSchema from 'chai-json-schema';
import * as mock from 'mock-require';
import * as mockFs from 'mock-fs';

chai.use(chaiFs);
chai.use(chaiJSONSchema);

const { assert } = chai;

suite('electron build', () => {
    test('default values', () => {
        mock('@kano/kit-app-shell-core/lib/bundler', {
            Bundler: {
                bundle(html, js, appJs, config, opts) {
                    assert.equal(html, path.join(__dirname, '../app/index.html'));
                    assert.equal(js, path.join(__dirname, '../app/index.js'));
                    assert.equal(appJs, path.join('/app', 'index.js'));
                    assert.equal(opts.js.targets.chrome, 66);
                    assert.equal(opts.appJs.targets.chrome, 66);
                    return Promise.resolve('/build');
                },
                write() {
                    return Promise.resolve();
                },
            },
        });
        mock('@kano/kit-app-shell-core/lib/process-state', {
            processState: {
                setStep() {},
                setSuccess() {},
            },
        });
        mock('glob', (pattern, opts, cb) => {
            if (opts.cwd === path.join(__dirname, '../app')) {
                return cb(null, ['_test']);
            }
            return cb(null, []);
        });
        mock('./snapshot/snap', {
            snap() {
                return Promise.resolve('/');
            },
        });
        const build = mock.reRequire('./build');
        mockFs({
            [path.join(__dirname, '../app')]: {
                _test: 'test-file',
            },
        });
        return build.default({
            app: '/app',
            out: '/out',
            config: {},
        }).then(() => {
            assert.jsonSchemaFile('/out/config.json', {
                $schema: 'http://json-schema.org/draft-06/schema#',
                $id: 'http://example.com/product.schema.json',
                type: 'object',
                required: ['BUNDLED'],
            });
            assert.fileContent('/out/_test', 'test-file');
        });
    });
    teardown(() => {
        mock.stopAll();
        mockFs.restore();
    });
});
