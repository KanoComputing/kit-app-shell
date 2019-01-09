"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const rollup = require("rollup");
const path = require("path");
const nodeResolve = require("rollup-plugin-node-resolve");
const replace_1 = require("./plugins/replace");
const polyfill = require("rollup-plugin-polyfill");
const inject = require("rollup-plugin-inject");
const virtual = require("rollup-plugin-virtual");
const mkdirp = require("mkdirp");
const html_1 = require("./html");
const log_1 = require("./log");
const util_1 = require("./util");
const process_state_1 = require("./process-state");
const progress_1 = require("./progress");
const util_2 = require("util");
const globCb = require("glob");
const escapeRegExp = require("escape-regexp");
const glob = util_2.promisify(globCb);
const writeFile = util_2.promisify(fs.writeFile);
function write(file, outputDir) {
    const filePath = path.join(outputDir, file.fileName);
    return writeFile(filePath, file.code);
}
function writeStatic(root, file, outputDir) {
    const filePath = path.join(root, file);
    const outFile = path.join(outputDir, file);
    return util_1.util.fs.copy(filePath, outFile);
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
        if (bundle.appStatic) {
            const { root, files } = bundle.appStatic;
            const p = files.reduce((acc, file) => acc.then(() => writeStatic(root, file, appOutputDir)), Promise.resolve());
            tasks.push(p);
        }
        return Promise.all(tasks)
            .then(() => {
            process_state_1.processState.setSuccess('Bundled app');
            return outputDir;
        });
    }
    static bundle(html, js, appSrc, config, opts = { html: {}, js: {}, appJs: { resources: [] } }) {
        process_state_1.processState.setStep(`Bundling app at ${appSrc}`);
        const appSrcName = path.basename(appSrc);
        const htmlOutput = Bundler.bundleHtml(html, opts.html || {});
        const stage1 = html_1.replaceIndex(html, js, htmlOutput);
        const htmlBundle = {
            fileName: path.basename(html),
            code: stage1,
        };
        const tasks = [
            Bundler.bundleSources(js, config, Object.assign({}, opts.js || {}, { appSrcName })),
            Bundler.bundleSources(appSrc, config, opts.appJs),
        ];
        if (opts.appJs && opts.appJs.resources) {
            tasks.push(Bundler.bundleStatic(opts.appJs.resources, path.dirname(appSrc)));
        }
        return Promise.all(tasks).then((results) => {
            const pkg = {
                html: htmlBundle,
                js: results[0],
                appJs: results[1],
                appStatic: results[2],
            };
            pkg.js.unshift({
                fileName: 'require.js',
                code: fs.readFileSync(require.resolve('requirejs/require.js'), 'utf-8'),
            });
            return pkg;
        });
    }
    static bundleHtml(input, replacements = {}) {
        const contents = fs.readFileSync(input, 'utf-8');
        const stage1 = html_1.addRequirejs(contents);
        const reg = /<!--\s?build:(.*?)\s?-->([\s\S]*)<!--\s?endbuild\s?-->/g;
        return stage1.replace(reg, (m, g0) => replacements[g0] || '');
    }
    static bundleSources(input, config, opts) {
        const { polyfills = [], moduleContext = {}, replaces = [], targets = {}, babelExclude = [], bundleOnly = false, appSrcName = 'index.js', } = opts;
        const tracker = new progress_1.ProgressTracker();
        tracker.on('progress', (e) => {
            process_state_1.processState.setStep(`(${e.loaded}) Bundling '${e.file}'`);
        });
        const inputRoot = path.dirname(input);
        const configPath = path.join(inputRoot, 'config.js');
        const replacers = replaces.map(replaceOpts => replace_1.replace(Object.assign({ delimiters: ['', ''] }, replaceOpts)));
        const defaultOptions = {
            input: [input],
            experimentalCodeSplitting: true,
            plugins: [
                tracker.plugin(),
                replace_1.replace({
                    delimiters: ['', ''],
                    exclude: [path.join(inputRoot, 'node_modules/**')],
                    values: {
                        'window.KitAppShellConfig.APP_SRC': `'./www/${appSrcName}'`,
                    },
                }),
                ...replacers,
                virtual({
                    [configPath]: `export default Object.assign(${JSON.stringify(config)}, window.KitAppShellConfig || {});`,
                }),
                inject({
                    modules: {
                        'window.KitAppShellConfig': configPath,
                    },
                }),
                polyfill(escapeRegExp(path.resolve(input)), polyfills),
                nodeResolve(),
            ],
            moduleContext,
            onwarn: () => { },
        };
        if (!bundleOnly) {
            const babel = require('rollup-plugin-babel');
            const minifyHTML = require('rollup-plugin-minify-html-literals').default;
            const uglify = require('rollup-plugin-uglify-es');
            const babelPluginSyntaxDynamicImport = require.resolve('@babel/plugin-syntax-dynamic-import');
            const babelPresetEnv = require.resolve('@babel/preset-env');
            defaultOptions.plugins.push(minifyHTML());
            defaultOptions.plugins.push(babel({
                exclude: babelExclude,
                plugins: [
                    babelPluginSyntaxDynamicImport,
                ],
                presets: [
                    [
                        babelPresetEnv,
                        {
                            targets,
                        },
                    ],
                ],
            }));
            defaultOptions.plugins.push(uglify());
        }
        log_1.log.trace('ROLLUP OPTIONS', defaultOptions);
        return rollup.rollup(defaultOptions)
            .then(bundle => bundle.generate({ format: 'amd' }))
            .then(({ output }) => Object.keys(output).map(id => {
            return ({
                fileName: output[id].fileName,
                code: output[id].code,
            });
        }));
    }
    static bundleStatic(patterns = [], appRoot = '/') {
        const tasks = patterns.map(pattern => glob(pattern, { cwd: appRoot, nodir: true }));
        return Promise.all(tasks)
            .then((results) => {
            const fileList = results
                .reduce((acc, files) => acc.concat(files), []);
            return {
                root: appRoot,
                files: fileList,
            };
        });
    }
}
exports.Bundler = Bundler;
//# sourceMappingURL=bundler.js.map