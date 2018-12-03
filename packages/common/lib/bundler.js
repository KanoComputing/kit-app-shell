const fs = require('fs');
const rollup = require('rollup');
const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-re');
const polyfill = require('rollup-plugin-polyfill');
const inject = require('rollup-plugin-inject');
const virtual = require('rollup-plugin-virtual');
const mkdirp = require('mkdirp');
const { replaceIndex, addRequirejs } = require('./html');
const log = require('./log');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function write(file, outputDir) {
    const filePath = path.join(outputDir, file.fileName);
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, file.code, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

class Bundler {
    static write(bundle, outputDir) {
        const tasks = [];
        const appOutputDir = path.join(outputDir, 'www');
        mkdirp.sync(outputDir);
        mkdirp.sync(appOutputDir);
        tasks.push(write(bundle.html, outputDir));
        bundle.js.forEach(file => tasks.push(write(file, outputDir)));
        bundle.appJs.forEach(file => tasks.push(write(file, appOutputDir)));
        return Promise.all(tasks);
    }
    static bundle(html, js, appSrc, config, opts = {}) {
        log.info(`Bundling app at ${appSrc}...`);
        const pkg = {};
        const appSrcName = path.basename(appSrc);
        const htmlOutput = Bundler.bundleHtml(html, opts.html || {});
        const stage1 = replaceIndex(html, js, htmlOutput);
        pkg.html = {
            fileName: path.basename(html),
            code: stage1,
        };
        return Promise.all([
            Bundler.bundleSources(js, config, Object.assign({}, opts.js || {}, { appSrcName })),
            Bundler.bundleSources(appSrc, config, opts.appJs),
        ]).then((results) => {
            pkg.js = results[0];
            pkg.js.unshift({
                fileName: 'require.js',
                code: fs.readFileSync(require.resolve('requirejs/require.js'), 'utf-8'),
            });
            pkg.appJs = results[1];
            return pkg;
        });
    }
    static bundleHtml(input, replacements = {}) {
        const contents = fs.readFileSync(input, 'utf-8');
        const stage1 = addRequirejs(contents);
        // Replace html comment with build tag
        return stage1.replace(/<!--\s?build:(.*?)\s?-->([\s\S]*)<!--\s?endbuild\s?-->/g, (m, g0) => {
            return replacements[g0] || '';
        });
    }
    static bundleSources(input, config, { polyfills = [], moduleContext, appSrcName = 'index.js' } = {}) {
        // Generate future config path
        const inputRoot = path.dirname(input);
        const configPath = path.join(inputRoot, 'config.js');
        return rollup.rollup({
            input: [input],
            experimentalCodeSplitting: true,
            plugins: [
                replace({
                    replaces: {
                        'module.exports == freeExports': 'true',
                        'var twemoji=function()': 'var twemoji=window.twemoji=function()',
                        'typeof define': '"undefined"',
                        'typeof exports': '"undefined"',
                        'if (typeof module === "object") {': 'if (false) {',
                        'root.punycode = punycode;': 'module.exports = punycode;',
                        '}(this, (function (exports) {': '}(window, (function (exports) {',
                        'window.KitAppShellConfig.APP_SRC': `'./www/${appSrcName}'`,
                    },
                }),
                virtual({
                    // Config is external, let rollup import it
                    [configPath]: `export default ${JSON.stringify(config)}`,
                }),
                inject({
                    modules: {
                        // Replace every instance of the provided config with the added module
                        'window.KitAppShellConfig': configPath,
                    }
                }),
                polyfill(escapeRegExp(path.resolve(input)), polyfills),
                nodeResolve(),
            ],
            moduleContext,
        })
            .then(bundle => bundle.generate({ format: 'amd' }))
            .then(({ output }) => {
                return Object.keys(output).map((id) => {
                    return {
                        fileName: output[id].fileName,
                        code: output[id].code,
                    };
                });
            });
    }
}

module.exports = Bundler;
