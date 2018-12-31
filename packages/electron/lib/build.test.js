/* globals suite, test, teardown */
const path = require('path');
const chai = require('chai');
const chaiFs = require('chai-fs');
const chaiJSONSchema = require('chai-json-schema');
const mock = require('mock-require');
const mockFs = require('mock-fs');
const util = require('@kano/kit-app-shell-core/lib/util');

chai.use(chaiFs);
chai.use(chaiJSONSchema);

const { assert } = chai;

suite('electron build', () => {
    test('default values', () => {
        mock('@kano/kit-app-shell-core/lib/bundler', {
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
        });
        mock('@kano/kit-app-shell-core/lib/process-state', {
            setStep() {},
        });
        mock('glob', (pattern, opts, cb) => {
            if (opts.cwd === path.join(__dirname, '../app')) {
                return cb(null, ['_test']);
            }
            return cb(null, []);
        });
        const build = mock.reRequire('./build');
        mockFs({
            [path.join(__dirname, '../app')]: {
                _test: 'test-file',
            },
        });
        return build({
            app: '/app',
            out: '/out',
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
