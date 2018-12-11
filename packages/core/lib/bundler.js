const glob = require('glob');
const fs = require('fs');
const rollup = require('rollup');
const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const polyfill = require('rollup-plugin-polyfill');
const babel = require('rollup-plugin-babel');
const presetEnv = require('@babel/preset-env');
const babelPluginDynamicImport = require('@babel/plugin-syntax-dynamic-import');
const inject = require('rollup-plugin-inject');
const virtual = require('rollup-plugin-virtual');
const mkdirp = require('mkdirp');
const { replaceIndex, addRequirejs } = require('./html');
const log = require('./log');
const util = require('./util');
const processState = require('./process-state');

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

function writeStatic(root, file, outputDir) {
    const filePath = path.join(root, file);
    const outFile = path.join(outputDir, file);
    return util.fs.copy(filePath, outFile);
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
        const { root, files } = bundle.appStatic;
        // Write assets in series
        // TODO: Move all this to a module that could run in a separate thread
        let p = Promise.resolve();
        files.forEach(file => p = p.then(writeStatic(root, file, appOutputDir)));
        tasks.push(p);
        return Promise.all(tasks)
            .then(() => {
                processState.setSuccess('Bundled app');
                return outputDir;
            });
    }
    static bundle(html, js, appSrc, config, opts = {}) {
        processState.setStep(`Bundling app at ${appSrc}`);
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
            Bundler.bundleStatic(opts.appJs.resources, path.dirname(appSrc)),
        ]).then((results) => {
            pkg.js = results[0];
            pkg.js.unshift({
                fileName: 'require.js',
                code: fs.readFileSync(require.resolve('requirejs/require.js'), 'utf-8'),
            });
            pkg.appJs = results[1];
            pkg.appStatic = results[2];
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
    static bundleSources(input, config, { polyfills = [], moduleContext = {}, replaces = {}, targets = {}, appSrcName = 'index.js' } = {}) {
        // Generate future config path
        // TODO: This does not work on non root files, figure out a solution
        const inputRoot = path.dirname(input);
        const configPath = path.join(inputRoot, 'config.js');
        const defaultOptions = {
            input: [input],
            experimentalCodeSplitting: true,
            plugins: [
                replace({
                    delimiters: ['', ''],
                    values: {
                        ...replaces,
                        'window.KitAppShellConfig.APP_SRC': `'./www/${appSrcName}'`,
                    },
                }),
                virtual({
                    // Config is external, let rollup import it
                    [configPath]: `export default Object.assign(${JSON.stringify(config)}, window.KitAppShellConfig || {});`,
                }),
                inject({
                    modules: {
                        // Replace every instance of the provided config with the added module
                        'window.KitAppShellConfig': configPath,
                    }
                }),
                polyfill(escapeRegExp(path.resolve(input)), polyfills),
                nodeResolve(),
                babel({
                    plugins: [babelPluginDynamicImport],
                    presets: [
                        [
                            presetEnv,
                            {
                                targets,
                            }
                        ]
                    ]
                }),
            ],
            moduleContext,
            // Silence for now
            onwarn: () => {},
        };
        log.trace('ROLLUP OPTIONS', defaultOptions);
        return rollup.rollup(defaultOptions)
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
    static bundleStatic(patterns = [], appRoot = '/') {
        const fileList = patterns
            .reduce((acc, pattern) => acc.concat(glob.sync(pattern, { cwd: appRoot, nodir: true })), []);
        return {
            root: appRoot,
            files: fileList,
        };
    }
}

module.exports = Bundler;
